import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestHTTP } from './request-http';

describe('RequestHTTP — transport failures and contract handling', () => {
  let service: RequestHTTP;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    service = new RequestHTTP();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sends JSON with credentials and retains the HTTP status and data', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sucesso: true,
          status: 201,
          mensagem: 'Criado',
          dados: { ID_projeto: 7 },
        }),
        { status: 201 },
      ),
    );
    const result = await service.POST<{ ID_projeto: number }>('/projetos', {
      nomeProjeto: 'Teste',
    });
    expect(result).toMatchObject({ sucesso: true, status: 201, dados: { ID_projeto: 7 } });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/projetos$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ nomeProjeto: 'Teste' }),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('never treats a failing HTTP response as success even if its body says sucesso=true', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sucesso: true,
          status: 200,
          mensagem: 'Sem autorização',
          dados: { private: true },
        }),
        { status: 403 },
      ),
    );
    const result = await service.GET('/projetos');
    expect(result).toMatchObject({ sucesso: false, status: 403, mensagem: 'Sem autorização' });
    expect(result.dados).toBeUndefined();
  });

  it('preserves a server validation message instead of reporting a false network error', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          sucesso: false,
          status: 400,
          mensagem: 'Nome é obrigatório',
          erro: { field: 'nomeProjeto' },
        }),
        { status: 400 },
      ),
    );
    expect(await service.PUT('/projetos/7', {})).toMatchObject({
      sucesso: false,
      status: 400,
      mensagem: 'Nome é obrigatório',
    });
  });

  it('handles non-JSON and structurally invalid server responses', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Erro</html>', { status: 502 }));
    expect(await service.GET('/projetos')).toMatchObject({
      sucesso: false,
      status: 502,
      mensagem: expect.stringContaining('resposta inválida'),
    });
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ projects: [] }), { status: 200 }),
    );
    expect(await service.GET('/projetos')).toMatchObject({
      sucesso: false,
      status: 200,
      mensagem: expect.stringContaining('contrato esperado'),
    });
  });

  it('supports a successful no-content delete', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(await service.DELETE('/projetos/7')).toMatchObject({ sucesso: true, status: 204 });
  });

  it('rejects protocol-relative routes before sending credentials', async () => {
    expect(await service.GET('//untrusted.example/projetos')).toMatchObject({
      sucesso: false,
      status: 400,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cancels hung requests and exposes an actionable timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );
    const request = service.GET('/projetos');
    await vi.advanceTimersByTimeAsync(12_000);
    expect(await request).toMatchObject({
      sucesso: false,
      status: 408,
      mensagem: expect.stringContaining('demorou'),
    });
  });

  it('reports offline failures without leaking error internals', async () => {
    fetchMock.mockRejectedValue(new TypeError('Internal proxy credentials should not be shown'));
    const result = await service.GET('/projetos');
    expect(result).toMatchObject({ sucesso: false, status: 0 });
    expect(JSON.stringify(result)).not.toContain('Internal proxy');
  });
});

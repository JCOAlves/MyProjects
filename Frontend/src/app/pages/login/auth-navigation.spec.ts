import { safeReturnUrl } from './auth-navigation';

describe('Authentication return destinations', () => {
  it('retains only workspace routes, including their query and fragment', () => {
    expect(safeReturnUrl('/home')).toBe('/home');
    expect(safeReturnUrl('/projetos?q=trabalho')).toBe('/projetos?q=trabalho');
    expect(safeReturnUrl('/projeto/trabalho-de-redes#tarefas')).toBe(
      '/projeto/trabalho-de-redes#tarefas',
    );
    expect(safeReturnUrl('/perfil')).toBe('/perfil');
  });

  it('rejects external, protocol-relative and disguised external destinations', () => {
    for (const path of [
      'https://example.org',
      '//example.org',
      '/\\example.org',
      'javascript:void(0)',
      '/home\n',
    ]) {
      expect(safeReturnUrl(path)).toBe('/home');
    }
  });

  it('does not redirect back into authentication or arbitrary application routes', () => {
    for (const path of [null, '', '/login', '/cadastro', '/home/fake', '/projeto/', '/unknown']) {
      expect(safeReturnUrl(path)).toBe('/home');
    }
  });
});

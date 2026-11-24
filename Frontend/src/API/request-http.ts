import { Injectable } from '@angular/core';
import environment from '../environments/environment';
import type { DadosRequisicao, RespostaHTTP } from './tipagemDados';

/** Transport only. This class does not simulate authentication or repair server contracts. */
@Injectable({ providedIn: 'root' })
export class RequestHTTP {
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');
  private readonly timeoutMs = 12_000;

  GET<T = DadosRequisicao>(rota: string): Promise<RespostaHTTP<T>> {
    return this.request<T>('GET', rota);
  }

  POST<T = DadosRequisicao>(rota: string, dados: unknown): Promise<RespostaHTTP<T>> {
    return this.request<T>('POST', rota, dados);
  }

  PUT<T = DadosRequisicao>(rota: string, dados: unknown): Promise<RespostaHTTP<T>> {
    return this.request<T>('PUT', rota, dados);
  }

  DELETE<T = DadosRequisicao>(rota: string): Promise<RespostaHTTP<T>> {
    return this.request<T>('DELETE', rota);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    route: string,
    body?: unknown,
  ): Promise<RespostaHTTP<T>> {
    if (
      typeof route !== 'string' ||
      !route.startsWith('/') ||
      route.startsWith('//') ||
      /[\r\n\\]/.test(route)
    ) {
      return this.failure(400, 'A rota da API deve ser um caminho relativo iniciado por /.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${route}`, {
        method,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      });

      if (response.status === 204) {
        return { sucesso: true, status: response.status, mensagem: 'Operação concluída.' };
      }

      let result: unknown;
      try {
        result = await response.json();
      } catch {
        if (controller.signal.aborted)
          return this.failure(408, 'A API demorou para responder. Tente novamente.');
        return this.failure(
          response.status,
          'A API retornou uma resposta inválida. Verifique a implementação do servidor.',
        );
      }

      if (!this.isEnvelope(result)) {
        return this.failure(
          response.status,
          'A resposta da API não corresponde ao contrato esperado.',
        );
      }

      return {
        sucesso: response.ok && result.sucesso,
        status: response.status,
        mensagem: result.mensagem,
        ...(response.ok && result.sucesso && 'dados' in result ? { dados: result.dados as T } : {}),
        ...('erro' in result ? { erro: result.erro } : {}),
      };
    } catch {
      return controller.signal.aborted
        ? this.failure(408, 'A API demorou para responder. Tente novamente.')
        : this.failure(
            0,
            'Não foi possível conectar à API. Verifique a conexão e a configuração do servidor.',
          );
    } finally {
      clearTimeout(timeout);
    }
  }

  private isEnvelope(value: unknown): value is RespostaHTTP<unknown> {
    if (!value || typeof value !== 'object') return false;
    const item = value as Record<string, unknown>;
    return (
      typeof item['sucesso'] === 'boolean' &&
      typeof item['status'] === 'number' &&
      typeof item['mensagem'] === 'string'
    );
  }

  private failure<T>(status: number, mensagem: string): RespostaHTTP<T> {
    return { sucesso: false, status, mensagem, erro: mensagem };
  }
}

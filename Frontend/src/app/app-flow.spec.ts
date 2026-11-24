import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import environment from '../environments/environment';
import { routes } from './app.routes';
import { WorkspaceService } from './core/workspace.service';

/**
 * Real routed Angular templates in jsdom. These assertions verify DOM events,
 * validation, routing and persistence, not layout, native focus trapping or axe.
 * jsdom may not implement the platform dialog methods; the fixture below only
 * reflects their open/closed state and deliberately does not simulate a browser.
 */
describe('Application routes and forms — Angular DOM integration', () => {
  let harness: RouterTestingHarness;
  let router: Router;
  let workspace: WorkspaceService;
  const originalDemoMode = environment.demoMode;
  const dialogDescriptors = new Map<string, PropertyDescriptor | undefined>();

  beforeAll(() => {
    for (const name of ['showModal', 'close'] as const) {
      if (typeof HTMLDialogElement.prototype[name] === 'function') continue;
      dialogDescriptors.set(
        name,
        Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name),
      );
      Object.defineProperty(HTMLDialogElement.prototype, name, {
        configurable: true,
        writable: true,
        value: function (this: HTMLDialogElement) {
          this.open = name === 'showModal';
        },
      });
    }
  });

  afterAll(() => {
    for (const [name, descriptor] of dialogDescriptors) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
    }
    environment.demoMode = originalDemoMode;
  });

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.style.overflow = '';
    document.documentElement.dataset['theme'] = 'light';
    environment.demoMode = true;
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
      teardown: { destroyAfterEach: true },
    }).compileComponents();
    router = TestBed.inject(Router);
    workspace = TestBed.inject(WorkspaceService);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    sessionStorage.clear();
    document.body.style.overflow = '';
  });

  function dom(): HTMLElement {
    return harness.fixture.nativeElement as HTMLElement;
  }

  async function settle(): Promise<void> {
    // Async event handlers can start a navigation in their first microtask.
    await Promise.resolve();
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  async function navigate(path: string): Promise<void> {
    await harness.navigateByUrl(path);
    await settle();
  }

  function element<T extends Element>(selector: string): T {
    const result = dom().querySelector<T>(selector);
    expect(result, `Expected rendered element: ${selector}`).not.toBeNull();
    return result!;
  }

  async function fill(selector: string, value: string): Promise<void> {
    const input = element<HTMLInputElement | HTMLTextAreaElement>(selector);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
  }

  function button(label: string, within: ParentNode = dom()): HTMLButtonElement {
    const result = Array.from(within.querySelectorAll<HTMLButtonElement>('button')).find(
      (item) => item.textContent?.replace(/\s+/g, ' ').trim() === label,
    );
    expect(result, `Expected rendered button: ${label}`).toBeDefined();
    return result!;
  }

  async function click(label: string, within: ParentNode = dom()): Promise<void> {
    button(label, within).click();
    await settle();
  }

  async function submit(selector: string): Promise<void> {
    element<HTMLFormElement>(selector).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await settle();
  }

  async function enterDemo(): Promise<void> {
    await navigate('/');
    await click('Explorar demonstração');
    await vi.waitFor(() => expect(router.url).toBe('/home'));
    await settle();
    expect(workspace.user()?.name).toBe('Guilherme');
  }

  it('renders the seven requested pages through the actual route tree and session', async () => {
    for (const [url, title] of [
      ['/', 'Organize seus projetos com o PPI'],
      ['/cadastro', 'Criar uma conta'],
      ['/login', 'Bem-vindo de volta!'],
      ['/pagina-ausente', 'Página não encontrada'],
    ]) {
      await navigate(url);
      expect(element<HTMLHeadingElement>('h1').textContent?.replace(/\s+/g, ' ').trim()).toBe(
        title,
      );
      expect(dom().querySelector('app-brand')).not.toBeNull();
    }
    await enterDemo();
    expect(element<HTMLHeadingElement>('h1').textContent?.trim()).toBe('Olá, Guilherme!');
    expect(dom().querySelectorAll('.project-card')).toHaveLength(3);
    await navigate('/projeto/trabalho-de-redes');
    expect(element<HTMLHeadingElement>('h1').textContent?.trim()).toBe('Trabalho de Redes');
    expect(dom().querySelectorAll('[role="tab"]')).toHaveLength(4);
    await navigate('/perfil');
    expect(element<HTMLHeadingElement>('h1').textContent?.trim()).toBe('Editar perfil');
    expect(element<HTMLInputElement>('#profile-name').value).toBe('Guilherme');
  });

  it('protects a project route, validates login and returns to that project without saving passwords', async () => {
    await navigate('/projeto/trabalho-de-redes');
    expect(router.url).toMatch(/^\/login\?returnUrl=/);
    await fill('#login-email', 'guilherme@example.com');
    await fill('#login-password', 'curta');
    await submit('form');
    expect(element<HTMLInputElement>('#login-password').getAttribute('aria-invalid')).toBe('true');
    expect(workspace.user()).toBeNull();
    const password = 'SenhaFicticiaIntegracao-473';
    await fill('#login-password', password);
    await submit('form');
    await vi.waitFor(() => expect(router.url).toBe('/projeto/trabalho-de-redes'));
    await settle();
    expect(element<HTMLHeadingElement>('h1').textContent?.trim()).toBe('Trabalho de Redes');
    expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(password);
  });

  it('keeps registration values after validation errors and opens the dashboard only after a valid submission', async () => {
    await navigate('/cadastro');
    await fill('#register-name', 'Ana Exemplo');
    await fill('#register-email', 'ana@example.com');
    await fill('#register-password', 'SenhaFicticia-473');
    await fill('#register-confirmation', 'OutraSenha-473');
    await submit('form');
    expect(element<HTMLInputElement>('#register-confirmation').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(dom().textContent).toContain('As senhas precisam ser iguais.');
    expect(element<HTMLInputElement>('#register-name').value).toBe('Ana Exemplo');
    expect(workspace.user()).toBeNull();
    await fill('#register-confirmation', 'SenhaFicticia-473');
    await submit('form');
    await vi.waitFor(() => expect(router.url).toBe('/home'));
    await settle();
    expect(element<HTMLHeadingElement>('h1').textContent?.trim()).toBe('Olá, Ana!');
    expect(workspace.user()?.email).toBe('ana@example.com');
  });

  it('creates a project through the real modal form and finds it through the routed project search', async () => {
    await enterDemo();
    await click('Novo projeto');
    expect(element<HTMLDialogElement>('dialog').open).toBe(true);
    await submit('dialog form');
    expect(element<HTMLInputElement>('#new-project-title').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(workspace.projects()).toHaveLength(3);
    await fill('#new-project-title', 'Projeto de integração');
    await fill('#new-project-description', 'Organização das entregas da turma.');
    await submit('dialog form');
    expect(dom().querySelector('dialog')).toBeNull();
    expect(workspace.projects()).toHaveLength(4);
    expect(dom().textContent).toContain('Projeto de integração');
    await navigate('/projetos');
    await fill('#project-search', 'integração');
    expect(router.url).toContain('q=');
    expect(dom().querySelectorAll('.project-card')).toHaveLength(1);
    expect(element<HTMLElement>('.project-card').textContent).toContain('Projeto de integração');
    await fill('#project-search', 'busca-sem-resultados');
    expect(dom().textContent).toContain('Nenhum projeto encontrado');
    expect(dom().querySelectorAll('.project-card')).toHaveLength(0);
  });

  it('shows recovery for a missing project and applies task completion through its rendered checkbox', async () => {
    await enterDemo();
    await navigate('/projeto/id-inexistente');
    expect(element<HTMLHeadingElement>('h1').textContent?.trim()).toBe('Projeto não encontrado');
    expect(element<HTMLAnchorElement>('.project-missing a').getAttribute('href')).toBe('/projetos');
    await navigate('/projeto/trabalho-de-redes');
    const checkbox = element<HTMLInputElement>(
      'input[aria-label="Concluir tarefa: Finalizar relatório"]',
    );
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
    expect(element<HTMLElement>('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('80');
    const filter = element<HTMLSelectElement>('#task-filter');
    filter.value = 'all';
    filter.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
    expect(
      element<HTMLInputElement>('input[aria-label="Reabrir tarefa: Finalizar relatório"]').checked,
    ).toBe(true);
    await navigate('/home');
    expect(
      element<HTMLProgressElement>('progress[aria-label="Progresso de Trabalho de Redes"]').value,
    ).toBe(80);
  });

  it('saves the profile from its form and lets its real navigation guard retain or discard a draft', async () => {
    await enterDemo();
    await navigate('/perfil');
    await fill('#profile-name', 'Guilherme Atualizado');
    await fill('#profile-email', 'atualizado@example.com');
    await submit('form');
    expect(workspace.user()?.name).toBe('Guilherme Atualizado');
    expect(workspace.user()?.email).toBe('atualizado@example.com');
    await fill('#profile-name', 'Rascunho não salvo');

    const cancelledNavigation = router.navigateByUrl('/home');
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(dom().querySelector('dialog[open]')).not.toBeNull();
    });
    button('Continuar editando', element('dialog')).click();
    expect(await cancelledNavigation).toBe(false);
    await settle();
    expect(router.url).toBe('/perfil');
    expect(element<HTMLInputElement>('#profile-name').value).toBe('Rascunho não salvo');

    const allowedNavigation = router.navigateByUrl('/home');
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(dom().querySelector('dialog[open]')).not.toBeNull();
    });
    button('Descartar alterações', element('dialog')).click();
    expect(await allowedNavigation).toBe(true);
    await settle();
    expect(router.url).toBe('/home');
    await navigate('/perfil');
    expect(element<HTMLInputElement>('#profile-name').value).toBe('Guilherme Atualizado');
  });
});

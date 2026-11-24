import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, string[]>();
const FICTIONAL_PASSWORD = 'SenhaFicticiaE2E-8631';

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) || [], 'A página não deve lançar erros de JavaScript.').toEqual(
    [],
  );
});

async function enterDemo(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar demonstração', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Olá, Guilherme!');
}

async function createProject(page: Page, title: string): Promise<void> {
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Novo projeto', exact: true });
  await dialog.getByLabel(/Nome do projeto/).fill(title);
  await dialog
    .getByLabel(/Descrição/)
    .fill('Projeto fictício criado para verificar o fluxo completo.');
  await dialog.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: `Abrir projeto: ${title}`, exact: true }),
  ).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document, `A página ${page.url()} deve caber no viewport.`).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
}

async function expectAccessible(page: Page): Promise<void> {
  await expect(page.locator('h1').first()).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const failures = result.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      targets: violation.nodes.map((node) => node.target),
    }));
  expect(failures, `Violações de acessibilidade em ${page.url()}`).toEqual([]);
}

test('as páginas públicas apresentam os caminhos de acesso e a página não encontrada', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Organize seus projetos com o PPI/ }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Fazer login', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar com Google', exact: true })).toBeDisabled();
  await expect(page.getByText('Login com Google ainda não configurado.')).toBeVisible();
  await page.getByRole('link', { name: 'Criar uma conta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Criar uma conta', exact: true })).toBeVisible();
  await expect(page.getByText(/O acesso é simulado/)).toBeVisible();
  await page.goto('/pagina-que-nao-existe');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await page.getByRole('link', { name: 'Voltar para a página inicial' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('app-illustration img')).toHaveJSProperty('complete', true);
  expect(
    await page
      .locator('app-illustration img')
      .evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBeGreaterThan(0);
});

test('cadastro valida os campos, permite conferir a senha e nunca persiste o segredo', async ({
  page,
}) => {
  await page.goto('/cadastro');
  await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
  await expect(page.getByLabel('Nome completo', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Nome completo', { exact: true }).fill('Ana Exemplo');
  await page.getByLabel('Email', { exact: true }).fill('ana@example.com');
  await page.getByLabel('Senha', { exact: true }).fill(FICTIONAL_PASSWORD);
  await page.getByLabel('Confirmar senha', { exact: true }).fill('NaoCorresponde-1');
  await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
  await expect(page.getByText('As senhas precisam ser iguais.')).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar senha', exact: true }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha', exact: true }).click();
  await page.getByLabel('Confirmar senha', { exact: true }).fill(FICTIONAL_PASSWORD);
  await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Ana!' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Olá, Ana!' })).toBeVisible();
  const storage = await page.evaluate(() =>
    JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }),
  );
  expect(storage).not.toContain(FICTIONAL_PASSWORD);
  expect(storage).not.toMatch(/password|senha|access_token|refresh_token/i);
});

test('rotas protegidas voltam ao projeto solicitado depois do login simulado', async ({ page }) => {
  await page.goto('/projeto/trabalho-de-redes');
  await expect(page).toHaveURL(/\/login\?returnUrl=/);
  await page.getByLabel('Email', { exact: true }).fill('guilherme@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('curta');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Senha', { exact: true }).fill(FICTIONAL_PASSWORD);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/projeto\/trabalho-de-redes$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Trabalho de Redes' })).toBeVisible();
  await page.goto('/projeto/id-inexistente');
  await expect(page.getByRole('heading', { name: 'Projeto não encontrado' })).toBeVisible();
  await page
    .getByRole('button', { name: 'Sair da demonstração', exact: true })
    .filter({ visible: true })
    .click();
  await page.goto('/home');
  await expect(page).toHaveURL(/\/login\?returnUrl=/);
});

test('dashboard, busca da barra superior e filtros mantêm estado e exibem resultados vazios', async ({
  page,
}) => {
  await enterDemo(page);
  await expect(page.locator('.stat-card')).toHaveCount(3);
  await expect(page.locator('.project-card')).toHaveCount(3);
  await expect(
    page.getByRole('progressbar', { name: 'Progresso de Trabalho de Redes' }),
  ).toHaveAttribute('value', '70');
  await page.getByRole('button', { name: 'Buscar projetos', exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Buscar projetos por nome ou descrição' });
  await expect(search).toBeFocused();
  await search.fill('redes');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page).toHaveURL(/q=redes/);
  await page.reload();
  await expect(search).toHaveValue('redes');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await search.fill('um-projeto-que-nao-existe');
  await expect(page.getByRole('heading', { name: 'Nenhum projeto encontrado' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar busca de projetos' }).click();
  await expect(search).toBeFocused();
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Concluídos', exact: true }).click();
  await expect(page).toHaveURL(/filter=completed/);
  await expect(page.getByRole('heading', { name: 'Nenhum projeto encontrado' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(3);
});

test('projeto, tarefa, anotação e colaborador percorrem criação, edição, permissão e exclusão', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await enterDemo(page);
  await createProject(page, 'Projeto de teste');
  await page.getByRole('link', { name: 'Abrir projeto: Projeto de teste', exact: true }).click();
  await page.getByRole('button', { name: 'Editar projeto', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Editar projeto', exact: true });
  await dialog.getByLabel('Nome do projeto', { exact: true }).fill('Projeto de teste revisado');
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projeto de teste revisado');

  await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Nova tarefa', exact: true });
  await dialog.getByLabel('Nome da tarefa', { exact: true }).fill('Preparar apresentação');
  await dialog.getByLabel('Prioridade', { exact: true }).selectOption('high');
  await dialog.getByLabel(/Prazo/).fill('2026-12-10');
  await dialog.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Concluir tarefa: Preparar apresentação' }).check();
  await expect(page.getByRole('progressbar', { name: 'Progresso das tarefas' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  await page.getByLabel('Mostrar', { exact: true }).selectOption('all');
  await page.getByRole('button', { name: 'Preparar apresentação', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Editar tarefa', exact: true });
  await dialog.getByLabel('Nome da tarefa', { exact: true }).fill('Apresentação revisada');
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'Reabrir tarefa: Apresentação revisada' }),
  ).toBeChecked();

  await page.getByRole('button', { name: 'Nova nota', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Nova anotação', exact: true });
  await dialog.getByLabel('Título', { exact: true }).fill('Referências da apresentação');
  await dialog
    .getByLabel('Anotação', { exact: true })
    .fill('Organizar fontes e revisar os gráficos.');
  await dialog.getByRole('button', { name: 'Criar anotação', exact: true }).click();
  await page.getByRole('button', { name: 'Editar anotação: Referências da apresentação' }).click();
  dialog = page.getByRole('dialog', { name: 'Editar anotação', exact: true });
  await dialog
    .getByLabel('Anotação', { exact: true })
    .fill('Fontes revisadas e gráficos aprovados.');
  await dialog.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(
    page.getByText('Fontes revisadas e gráficos aprovados.', { exact: true }),
  ).toBeVisible();

  await page.getByRole('tab', { name: 'Compartilhamento', exact: true }).click();
  await page.getByRole('button', { name: 'Adicionar colaborador', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Adicionar colaborador', exact: true });
  await dialog.getByLabel('Nome', { exact: true }).fill('Ana Teste');
  await dialog.getByLabel('Email', { exact: true }).fill('ana-teste@example.com');
  await dialog.getByLabel('Permissão', { exact: true }).selectOption('editor');
  await dialog.getByRole('button', { name: 'Revisar colaborador' }).click();
  dialog = page.getByRole('dialog', { name: 'Confirmar colaborador local', exact: true });
  await expect(dialog).toContainText('nenhum email será enviado');
  await dialog.getByRole('button', { name: 'Adicionar colaborador', exact: true }).click();
  const member = page.locator('.member-row').filter({ hasText: 'ana-teste@example.com' });
  await expect(member).toContainText('Editor');
  await page.getByRole('button', { name: 'Alterar permissão de Ana Teste' }).click();
  dialog = page.getByRole('dialog', { name: 'Alterar permissão', exact: true });
  await dialog.getByLabel('Permissão', { exact: true }).selectOption('viewer');
  await dialog.getByRole('button', { name: 'Revisar alteração' }).click();
  await page
    .getByRole('dialog', { name: 'Confirmar alteração de permissão' })
    .getByRole('button', { name: 'Alterar permissão', exact: true })
    .click();
  await expect(member).toContainText('Leitor');

  await page.reload();
  await expect(member).toContainText('Leitor');
  await page.getByRole('button', { name: 'Remover colaborador: Ana Teste' }).click();
  await page
    .getByRole('dialog', { name: 'Remover colaborador?' })
    .getByRole('button', { name: 'Remover colaborador', exact: true })
    .click();
  await expect(member).toHaveCount(0);
  await page.getByRole('tab', { name: 'Tarefas', exact: true }).click();
  await page.getByLabel('Mostrar', { exact: true }).selectOption('all');
  await page.getByRole('button', { name: 'Excluir tarefa: Apresentação revisada' }).click();
  await page
    .getByRole('dialog', { name: 'Excluir tarefa?' })
    .getByRole('button', { name: 'Excluir tarefa', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Uma tarefa de cada vez' })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir anotação: Referências da apresentação' }).click();
  await page
    .getByRole('dialog', { name: 'Excluir anotação?' })
    .getByRole('button', { name: 'Excluir anotação', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Espaço para suas ideias' })).toBeVisible();
  await page.getByRole('tab', { name: 'Configurações', exact: true }).click();
  await page.getByRole('button', { name: 'Excluir projeto', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Excluir projeto?' });
  await expect(dialog.getByRole('button', { name: 'Cancelar', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Excluir projeto', exact: true }).click();
  await expect(page).toHaveURL(/\/projetos$/);
  await expect(
    page.getByRole('link', { name: 'Abrir projeto: Projeto de teste revisado' }),
  ).toHaveCount(0);
});

test('modal mantém o foco, restaura o botão e protege rascunhos ao pressionar Escape', async ({
  page,
}) => {
  await enterDemo(page);
  const opener = page.getByRole('button', { name: 'Novo projeto', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Novo projeto', exact: true });
  await expect(dialog.getByLabel(/Nome do projeto/)).toBeFocused();
  for (let index = 0; index < 14; index++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByLabel(/Nome do projeto/).fill('Rascunho a preservar');
  await page.keyboard.press('Escape');
  await expect(dialog.getByText('Descartar este rascunho?', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Continuar editando' }).click();
  await expect(dialog.getByLabel(/Nome do projeto/)).toHaveValue('Rascunho a preservar');
  await page.keyboard.press('Escape');
  await dialog.getByRole('button', { name: 'Descartar rascunho', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(3);
});

test('perfil valida, salva e impede perder alterações ao navegar', async ({ page }) => {
  await enterDemo(page);
  await page.getByRole('link', { name: 'Configurações', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Editar perfil', exact: true })).toBeVisible();
  await page.getByLabel('Nome completo', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByLabel('Nome completo', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByLabel('Nome completo', { exact: true }).fill('Guilherme Teste');
  await page.getByLabel('Email', { exact: true }).fill('guilherme-teste@example.com');
  await page.getByRole('link', { name: 'Início', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Descartar alterações?', exact: true });
  await dialog.getByRole('button', { name: 'Continuar editando', exact: true }).click();
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Guilherme Teste');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Perfil atualizado.' })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
    'guilherme-teste@example.com',
  );
  await page.getByLabel('Nome completo', { exact: true }).fill('Nome não salvo');
  await page.getByRole('link', { name: 'Início', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Descartar alterações?', exact: true });
  await dialog.getByRole('button', { name: 'Descartar alterações', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await page.getByRole('link', { name: 'Configurações', exact: true }).click();
  await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Guilherme Teste');
});

test('falha no armazenamento mantém o formulário e permite salvar novamente sem duplicação', async ({
  page,
}) => {
  await enterDemo(page);
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Novo projeto', exact: true });
  await dialog.getByLabel(/Nome do projeto/).fill('Projeto após recuperação');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as unknown as { restoreStorage: () => void }).restoreStorage = () => {
      Storage.prototype.setItem = original;
    };
    Storage.prototype.setItem = function (key, value) {
      if (this === window.localStorage)
        throw new DOMException('Armazenamento indisponível', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await dialog.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Não foi possível salvar');
  await expect(dialog.getByLabel(/Nome do projeto/)).toHaveValue('Projeto após recuperação');
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.evaluate(() => (window as unknown as { restoreStorage: () => void }).restoreStorage());
  await dialog.getByRole('button', { name: 'Criar projeto', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(4);
  await page.reload();
  await expect(
    page.getByRole('link', { name: 'Abrir projeto: Projeto após recuperação', exact: true }),
  ).toHaveCount(1);
});

test('mais de nove projetos têm navegação explícita e nenhum item desaparece da lista', async ({
  page,
}) => {
  await enterDemo(page);
  await page.getByRole('link', { name: 'Ver todos', exact: true }).click();
  for (let index = 1; index <= 7; index++) await createProject(page, `Projeto adicional ${index}`);
  await expect(page.locator('.project-card')).toHaveCount(9);
  await expect(page.getByText('Mostrando 9 de 10 projetos.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Carregar mais projetos' }).click();
  await expect(page.locator('.project-card')).toHaveCount(10);
  await expect(page.getByRole('button', { name: 'Carregar mais projetos' })).toHaveCount(0);
});

test('tema persiste entre páginas e recarregamento sem alterar o conteúdo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ativar tema escuro', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Explorar demonstração', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Guilherme!' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Ativar tema claro', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.project-card')).toHaveCount(3);
});

test('as sete páginas e um modal cabem em uma tela de celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterDemo(page);
  const routes = [
    '/',
    '/cadastro',
    '/login',
    '/home',
    '/projeto/trabalho-de-redes',
    '/perfil',
    '/pagina-ausente',
  ];
  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
  await page.goto('/home');
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Novo projeto', exact: true });
  await expect(dialog).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(391);
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test('desktop não apresenta violações sérias ou críticas de acessibilidade nas telas principais', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expectAccessible(page);
  await page.goto('/login');
  await expectAccessible(page);
  await enterDemo(page);
  await expectAccessible(page);
  await page.goto('/projeto/trabalho-de-redes');
  await expectAccessible(page);
  await page.goto('/perfil');
  await expectAccessible(page);
});

test('celular mantém acessibilidade nos formulários, projeto, modal e tema escuro', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cadastro');
  await expectAccessible(page);
  await enterDemo(page);
  await page.getByRole('button', { name: 'Novo projeto', exact: true }).click();
  await expectAccessible(page);
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.goto('/projeto/trabalho-de-redes');
  await expectAccessible(page);
  await page.getByRole('button', { name: 'Ativar tema escuro', exact: true }).click();
  await expectAccessible(page);
});

import type { Profile, Project, Task } from './models';

export const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  name: 'Guilherme',
  email: 'guilherme@example.com',
};

function tasks(prefix: string, titles: string[], completed: number): Task[] {
  return titles.map((title, index) => ({
    id: `${prefix}-${index + 1}`,
    title,
    description: '',
    priority: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
    done: index < completed,
    deadline:
      index < completed
        ? '2026-11-21'
        : ['2026-11-25', '2026-11-27', '2026-11-30'][(index - completed) % 3],
  }));
}

/** Fictional sample content. Every percentage is derived from actual tasks. */
export function createDemoProjects(): Project[] {
  return [
    {
      id: 'trabalho-de-redes',
      title: 'Trabalho de Redes',
      description:
        'Planejamento e documentação de uma rede local. Vamos organizar as etapas para a apresentação final.',
      icon: 'laptop',
      color: 'blue',
      createdAt: '2026-11-10T12:00:00.000Z',
      updatedAt: '2026-11-22T12:00:00.000Z',
      tasks: tasks(
        'redes',
        [
          'Definir o objetivo do trabalho',
          'Pesquisar topologias de rede',
          'Levantar os equipamentos',
          'Desenhar a topologia',
          'Configurar o ambiente de testes',
          'Documentar o endereçamento IP',
          'Realizar os testes de conexão',
          'Finalizar relatório',
          'Revisar apresentação',
          'Enviar para o professor',
        ],
        7,
      ),
      notes: [
        {
          id: 'nota-redes-1',
          title: 'Ideias para o projeto',
          content: 'Adicionar gráficos\nRevisar metodologia\nCriar checklist final',
          updatedAt: '2026-11-22T12:00:00.000Z',
        },
      ],
      members: [],
    },
    {
      id: 'projeto-ppi',
      title: 'Projeto PPI',
      description:
        'Um espaço para planejar, colaborar e acompanhar nossos projetos em um só lugar.',
      icon: 'bulb',
      color: 'amber',
      createdAt: '2026-11-05T12:00:00.000Z',
      updatedAt: '2026-11-17T12:00:00.000Z',
      tasks: tasks(
        'ppi',
        [
          'Definir os requisitos',
          'Aprovar o design das telas',
          'Implementar o frontend',
          'Integrar a API',
          'Apresentar o projeto',
        ],
        2,
      ),
      notes: [
        {
          id: 'nota-ppi-1',
          title: 'Nossa próxima entrega',
          content: 'Revisar as sete páginas e testar a navegação no computador e no celular.',
          updatedAt: '2026-11-17T12:00:00.000Z',
        },
      ],
      members: [],
    },
    {
      id: 'estudos-enem',
      title: 'Estudos para ENEM',
      description:
        'Um plano de estudos com revisões, exercícios e espaço para anotar as principais dúvidas.',
      icon: 'chart',
      color: 'blue',
      createdAt: '2026-11-01T12:00:00.000Z',
      updatedAt: '2026-11-17T12:00:00.000Z',
      tasks: tasks(
        'enem',
        [
          'Organizar o cronograma',
          'Revisar linguagens',
          'Resolver exercícios de matemática',
          'Escrever uma redação',
          'Fazer o simulado final',
        ],
        4,
      ),
      notes: [],
      members: [],
    },
  ];
}

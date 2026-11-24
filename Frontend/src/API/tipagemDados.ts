/** Contracts observed in Backend/Models and Backend/Validates.
 * They are distinct from the local demonstration UI models.
 * Authentication and authorization must be implemented before API mode is enabled.
 */
export interface Usuario {
  ID_usuario: number;
  nomeUsuario: string;
  nicknameUsuario: string;
  emailUsuario: string;
  projetos?: Projeto[];
}

export interface NovoUsuario {
  nomeUsuario: string;
  nicknameUsuario: string;
  emailUsuario: string;
  senhaUsuario: string;
}

export type StatusProjeto = 'Não Iniciado' | 'Em Desenvolvimento' | 'Concluído';
export type StatusTarefa = 'Não Iniciada' | 'Em Desenvolvimento' | 'Concluída';
export type TipoPermissao = 'R-PTA' | 'CRUD-A' | 'CRUD-TA' | 'CRUD-PTA';

export interface Projeto {
  ID_projeto: number;
  nomeProjeto: string;
  descricaoProjeto: string;
  dataEntrega: string;
  projetoPublico: boolean;
  statusProjeto: StatusProjeto;
  dataCriacao: string;
  usuarios?: Usuario[];
}

export interface NovoProjeto {
  nomeProjeto: string;
  descricaoProjeto: string;
  /** Backend validation currently expects YYYY-MM-DD HH:mm:ss. */
  dataEntrega: string;
  projetoPublico: boolean;
}

export interface Tarefa {
  ID_tarefa: number;
  nomeTarefa: string;
  descricaoTarefa: string;
  dataInicio: string;
  dataFim: string;
  statusTarefa: StatusTarefa;
  dataCriacao: string;
  ID_projeto: number;
}

export interface NovaTarefa {
  nomeTarefa: string;
  descricaoTarefa: string;
  dataInicio: string;
  dataFim: string;
  ID_projeto: number;
}

export interface Anotacao {
  ID_anotacao: number;
  textoAnotacao: string;
  dataCriacao: string;
  ID_projeto: number;
}

export interface NovaAnotacao {
  textoAnotacao: string;
  ID_projeto: number;
}

export interface Permissao {
  ID_permissao: number;
  tipoPermissao: TipoPermissao;
  valorPermissao: number;
  ID_usuario: number;
  ID_projeto: number;
}

export type NovaPermissao = Omit<Permissao, 'ID_permissao'>;
export type DadosRequisicao =
  | Usuario
  | Usuario[]
  | Projeto
  | Projeto[]
  | Tarefa
  | Tarefa[]
  | Anotacao
  | Anotacao[]
  | Permissao
  | Permissao[];

export interface RespostaHTTP<T = DadosRequisicao> {
  sucesso: boolean;
  status: number;
  mensagem: string;
  dados?: T;
  erro?: unknown;
}

// Types de resposta do servidor

export type Usuario = {

};

export type Projeto = {

};

export type Tarefa = {

};

export type Anotacao = {

};

export type Permissao = {

};

export type DadosRequisicao = Usuario | Usuario[] | Projeto | Projeto[] | 
    Anotacao | Anotacao[] | Tarefa | Tarefa[] | Permissao | Permissao[]

export type RespostaHTTP = {
    sucesso: boolean,
    status: number,
    mensagem: string,
    dados?: DadosRequisicao,
    erro?: Error | TypeError | null | any | (Error | TypeError | null | any)[];
};
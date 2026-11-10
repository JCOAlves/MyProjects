// Types de resposta do servidor

export type Usuario = {

};

export type Projeto = {

};

export type Tarefa = {

};

export type Anotacao = {

};

export type DadosRequisicao = Usuario | Usuario[] | Projeto | Projeto[] | 
    Anotacao | Anotacao[] | Tarefa | Tarefa[] | any

export type RespostaHTTP = {
    sucesso: boolean,
    status: number,
    mensagem: string,
    dados?: DadosRequisicao,
    erro?: Error | TypeError | null | any;
};
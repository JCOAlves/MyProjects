import bcrypt from "bcrypt";

// Função de criptografia de senhas
async function criptografiaSenha(senha: string): Promise<string> {
    const numeroSaltos: number = 10; // Refere-se ao custo de processamento
    const senhaCriptografada: string = await bcrypt.hash(senha, numeroSaltos);
    return senhaCriptografada;
};

// Função de comparação de string com senha criptografada
async function comparacaoSenhas(senhaNormal: string, senhaCriptografada: string): Promise<boolean> {
    const respostaComparacao: boolean = await bcrypt.compare(senhaNormal, senhaCriptografada);
    return respostaComparacao;
};

export { criptografiaSenha, comparacaoSenhas };
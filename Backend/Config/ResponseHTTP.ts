// Classe de requisição HTTP 
type objectJSON = {
    sucesso: boolean,
    status: number,
    mensagem: string,
    dados?: any,
    erro?: Error | TypeError | null | any;
};

class ResponseHTTP {
    #sucesso: boolean;
    #status: number;
    #mensagem: string;
    #dados: any;
    #erro: Error | TypeError | null | any;

    constructor(sucesso: boolean, status: number, mensagem: string, dados?: any, erro?: Error | TypeError | null | any) {
        this.#sucesso = sucesso;
        this.#status = status;
        this.#mensagem = mensagem;
        this.#dados = dados;
        this.#erro = erro;
    };

    // Exibe mensagem com relação a requisição HTTP
    mostrarMensagem(): void {
        if (this.#sucesso) {
            console.log(`\x1b[33m[${new Date().toLocaleDateString("pt-BR")}]\x1b[0m - \x1b[32m${this.#status} ${this.#mensagem}\x1b[0m`);

        } else if (this.#status >= 400 && this.#status < 500){
            console.error(`\x1b[33m[${new Date().toLocaleDateString("pt-BR")}]\x1b[0m - \x1b[31m${this.#status} ${this.#mensagem} ${this.#erro ? `: ${this.#erro}` : ''}\x1b[0m`);
        
        } else if (this.#status >= 500 && this.#status < 600){
            console.error(`\x1b[33m[${new Date().toLocaleDateString("pt-BR")}]\x1b[0m - \x1b[35m${this.#status} ${this.#mensagem} ${this.#erro ? `: ${this.#erro}` : ''}\x1b[0m`);
        };
        return;
    };

    // Exibe mensagem com relação a requisição HTTP
    returnJSON(): objectJSON {
        let Resposta: objectJSON;
        if(this.#sucesso){
            Resposta = {
                sucesso: this.#sucesso,
                status: this.#status,
                mensagem: this.#mensagem,
                dados: this.#dados
            };

        } else {
            Resposta = {
                sucesso: this.#sucesso,
                status: this.#status,
                mensagem: this.#mensagem,
                erro: this.#erro
            };
        };
        return Resposta;
    };
};

export default ResponseHTTP;
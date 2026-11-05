import { Service } from '@angular/core';
import environment from "../environments/environment";

// Classe de serviço para requisições HTTP ao servidor
@Service()
export class RequestHTTP {
    #API_Rota: string = `http:/${environment.HostBackend}:${environment.PortBackend}`;

    // Função para requisição GET
    async GET(rota: string) {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            let resposta: any = await fetch(this.#API_Rota + rota, { credentials: 'include' });
            const dados: any = await resposta.json();
            return dados;

        } catch (error) {
            console.error("Erro na busca de dados no servidor: ", error);
            return { erro: `Erro na busca de dados no servidor: ${error}` };
        };
    };

    // Função para requisição POST
    async POST(rota: string, dados: any) {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            const objetoJSON: any = JSON.stringify(dados);
            let resposta: any = await fetch(this.#API_Rota + rota, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: objetoJSON,
                credentials: 'include'
            });
            resposta = await resposta.json();
            return resposta;


        } catch (error) {
            console.error("Erro no envio de novos dados ao servidor: ", error);
            return { erro: `Erro no envio de novos dados ao servidor: ${error}` };
        };
    };

    // Função para requisição PUT
    async PUT(rota: string, dados: any) {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            const objetoJSON: any = JSON.stringify(dados);
            let resposta: any = await fetch(this.#API_Rota + rota, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: objetoJSON,
                credentials: 'include'
            });
            resposta = await resposta.json();
            return resposta;

        } catch (error) {
            console.error("Erro no envio de dados atualizados ao servidor: ", error);
            return { erro: `Erro no envio de dados atualizados ao servidor: ${error}` };
        };
    };

    // Função para requisição DELETE
    async DELETE(rota: string) {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            let resposta: any = await fetch(this.#API_Rota + rota, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });
            resposta = await resposta.json();
            return resposta;

        } catch (error) {
            console.error("Erro na solicitação de exclusão dados no servidor:", error);
            return { erro: `Erro na solicitação de exclusão dados no servidor: ${error}` };
        };
    };
};

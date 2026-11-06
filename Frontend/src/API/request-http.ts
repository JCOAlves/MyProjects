import { Service } from '@angular/core';
import environment from "../environments/environment";
import { type RespostaHTTP, type DadosRequisicao } from "./tipagemDados.ts";

// Classe de serviço para requisições HTTP ao servidor
@Service()
export class RequestHTTP {
    #API_Rota: string = `http:/${environment.HostBackend}:${environment.PortBackend}`;

    // Função para requisição GET
    async GET(rota: string): RespostaHTTP {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            let resposta: DadosRequisicao = await fetch(this.#API_Rota + rota, { credentials: 'include' });
            const dados: DadosRequisicao = await resposta.json();
            return dados;

        } catch (error) {
            console.error("Erro na busca de dados no servidor: ", error);
            return { erro: `Erro na busca de dados no servidor: ${error}` };
        };
    };

    // Função para requisição POST
    async POST(rota: string, dados: DadosRequisicao): RespostaHTTP {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            const objetoJSON: DadosRequisicao = JSON.stringify(dados);
            let resposta: DadosRequisicao = await fetch(this.#API_Rota + rota, {
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
    async PUT(rota: string, dados: DadosRequisicao): RespostaHTTP {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            const objetoJSON: DadosRequisicao = JSON.stringify(dados);
            let resposta: DadosRequisicao = await fetch(this.#API_Rota + rota, {
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
    async DELETE(rota: string): RespostaHTTP {
        try {
            if (!rota) {
                console.error("Não foi fornecida a rota do servidor ou rota fornecida invalida.")
                return { erro: "Não foi fornecida a rota do servidor ou rota fornecida invalida." }
            };

            let resposta: DadosRequisicao = await fetch(this.#API_Rota + rota, {
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

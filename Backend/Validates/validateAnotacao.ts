// Script de validação de dados de Anotacao para requisições
import { z } from "zod";

const mensagensErros = {
    ID: [
        "ID de projeto não fornecido ou ID invalido.",
        "ID de projeto é menor que 1."
    ]
};

const { ID } = mensagensErros;

const parametrosValidade = {
    textoAnotacao: z.string(),
    ID_projeto: z.number(ID[0]).gte(1, ID[1])
};

const dadosAnotacao = z.object(parametrosValidade);

export default dadosAnotacao;
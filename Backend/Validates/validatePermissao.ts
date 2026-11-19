// Script de validação de dados de Permissao para requisições
import { z } from "zod";

const mensagensErros = {
    permissao: [
        "Tipo de permissão fornecida não existe foi é invalida."
    ],
    valor: [
        "Valor de permissão é menor do que 100,111.",
        "Valor de permissão é maior do que 1,111,111."
    ],
    projeto: [
        "ID de projeto não fornecido ou ID invalido.",
        "ID de projeto é menor que 1."
    ],
    usuario: [
        "ID de usuario não fornecido ou ID invalido.",
        "ID de usuario é menor que 1."
    ],
};

const { permissao, valor, usuario, projeto } = mensagensErros;

const parametrosValidade = {
    tipoPermissao: z.literal(["R-PTA", "CRUD-A", "CRUD-TA", "CRUD-PTA"], permissao[0]),
    valorPermissao: z.number().gte(100111, valor[0]).lte(1111111, valor[1]),
    ID_usuario: z.number(usuario[0]).gte(1, usuario[1]),
    ID_projeto: z.number(projeto[0]).gte(1, projeto[1])
};

const dadosPermissao = z.object(parametrosValidade);

export default dadosPermissao;
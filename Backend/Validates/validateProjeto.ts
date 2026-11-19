// Script de validação de dados de Projeto para requisições
import { z } from "zod";

const mensagensErros = {
    nome: [
        "Nome do projeto fornecido ultrapassa o limite de 120 caracteres."
    ],
    dataEntrega: [
        "Use o formato YYYY-MM-DD HH:mm:ss.",
        "Data e hora de entrega do projeto do calendário inválida."
    ],
};

const { nome, dataEntrega } = mensagensErros;
const dataSemTRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const parametrosValidade = {
    nomeProjeto: z.string().max(120, nome[0]),
    descricaoProjeto: z.string().optional(),
    dataEntrega: z
        .string()
        .regex(dataSemTRegex, { message: dataEntrega[0] })
        .refine(
            (val) => {
                // Substitui o espaço por 'T' temporariamente para o JavaScript validar se a data realmente existe
                const dataValida = new Date(val.replace(" ", "T"));
                return !isNaN(dataValida.getTime());
            },
            { message: dataEntrega[1] }
        ).optional(),
    projetoPublico: z.boolean().optional(),
};

const dadosProjeto = z.object(parametrosValidade);

export default dadosProjeto;
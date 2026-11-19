// Script de validação de dados de Tarefa para requisições
import { z } from "zod";

const mensagensErros = {
    dataInicio: [
        "Use o formato YYYY-MM-DD HH:mm:ss.",
        "Data e hora de inicio da tarefa do calendário inválida."
    ],
    dataFim: [
        "Use o formato YYYY-MM-DD HH:mm:ss.",
        "Data e hora de fim da tarefa do calendário inválida."
    ],
    ID: [
        "ID de projeto não fornecido ou ID invalido.",
        "ID de projeto é menor que 1."
    ]
};

const { dataInicio, dataFim, ID } = mensagensErros;
const dataSemTRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const parametrosValidade = {
    nomeTarefa: z.string().max(100),
    dataInicio: z
        .string()
        .regex(dataSemTRegex, { message: dataInicio[0] })
        .refine(
            (val) => {
                // Substitui o espaço por 'T' temporariamente para o JavaScript validar se a data realmente existe
                const dataValida = new Date(val.replace(" ", "T"));
                return !isNaN(dataValida.getTime());
            },
            { message: dataInicio[1] }
        ).optional(),
    dataFim: z
        .string()
        .regex(dataSemTRegex, { message: dataFim[0] })
        .refine(
            (val) => {
                // Substitui o espaço por 'T' temporariamente para o JavaScript validar se a data realmente existe
                const dataValida = new Date(val.replace(" ", "T"));
                return !isNaN(dataValida.getTime());
            },
            { message: dataFim[1] }
        ).optional(),
    ID_projeto: z.number(ID[0]).gte(1, ID[1])
};

const dadosTarefa = z.object(parametrosValidade);

export default dadosTarefa;
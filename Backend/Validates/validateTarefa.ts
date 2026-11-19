// Script de validação de dados de Tarefa para requisições
import { z } from "zod";

const mensagensErros = {};

const parametrosValidade = {
    
};

const dadosTarefa = z.object(parametrosValidade);

export default dadosTarefa;
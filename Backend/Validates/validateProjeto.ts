// Script de validação de dados de Projeto para requisições
import { z } from "zod";

const mensagensErros = {};

const parametrosValidade = {
    
};

const dadosProjeto = z.object(parametrosValidade);

export default dadosProjeto;
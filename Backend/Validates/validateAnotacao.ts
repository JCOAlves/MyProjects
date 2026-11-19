// Script de validação de dados de Anotacao para requisições
import { z } from "zod";
import type Anotacao from "../Models/Anotacao.ts";

const mensagensErros = {};

const parametrosValidade = {
    
};

const dadosAnotacao = z.object(parametrosValidade);

export default dadosAnotacao;
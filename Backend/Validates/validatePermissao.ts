// Script de validação de dados de Permissao para requisições
import { z } from "zod";

const mensagensErros = {};

const parametrosValidade = {
    
};

const dadosPermissao = z.object(parametrosValidade);

export default dadosPermissao;
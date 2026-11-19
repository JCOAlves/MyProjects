// Script de validação de dados de Usuario para requisições
import { z } from "zod";

const mensagensErros = {
    nome: [
        "Nome de usuário não fornecido ou nome invalido.",
        "Nome de usuário ultrapassa o limite de 100 caracteres."
    ],
    nickname: [
        "Nickname de usuário não foi fornecido ou nickname invalido.",
        "Nickname de usuário tem menos do que 8 caracteres minimamente exigidos.",
        "Nickname de usuário tem mais do que 12 caracteres de limite."
    ],
    email: [
        "Endereço de email de usuário nã foi fornecida ou email invalido.",
        "Endereço de email de usuário ultrapassou o limite de 100 caracteres do banco de dado."
    ],
    senha: [
        "Senha de usuário não foi fornecida ou senha invalida.",
        "Senha de usuário fornecida possui menos do que 8 caracteres exigidos."
    ]
};

const { nome, nickname, email, senha } = mensagensErros;

const parametrosValidade = {
    nomeUsuario: z.string(nome[0]).max(100, nome[1]),
    nicknameUsuario: z.string(nickname[0]).min(8, nickname[1]).max(12, nickname[2]),
    emailUsuario: z.email(email[0]).max(100, email[1]),
    senhaUsuario: z.string(senha[0]).min(8, senha[1])
};

const dadosUsuario = z.object(parametrosValidade);

export default dadosUsuario;
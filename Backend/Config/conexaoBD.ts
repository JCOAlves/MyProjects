// Conexão do banco de dados do projeto
import { Sequelize } from "@sequelize/core";
import { MySqlDialect } from "@sequelize/mysql";
import dotenv from "dotenv";

// Modelos Sequelize das tabelas do banco de dados
import Usuario from "../Models/Usuario.ts";
import Projeto from "../Models/Projeto.ts";
import Usuario_projeto from "../Models/Usuario_projeto.ts";
import Anotacao from "../Models/Anotacao.ts";
import Tarefa from "../Models/Tarefa.ts";
import Permissao from "../Models/Permissao.ts";

dotenv.config();

const configBD = {
    dialect: MySqlDialect,
    database: process.env.NOME_BD || "myproject_bd",
    user: process.env.USUARIO_BD || "root",
    password: process.env.SENHA_BD || "",
    host: process.env.HOST_BD || "localhost",
    port: Number(process.env.PORT_BD) || 3306,
    models: [Usuario, Projeto, Usuario_projeto, Anotacao, Tarefa, Permissao]
};

const conexaoBD = new Sequelize(configBD);

export default conexaoBD;
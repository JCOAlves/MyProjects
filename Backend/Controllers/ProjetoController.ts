// Funções da rotas de Projeto
import { type Request, type Response } from "express";
import { Op } from '@sequelize/core';
import Projeto from "../Models/Projeto.ts";
import Usuario from "../Models/Usuario.ts";
import Usuario_projeto from "../Models/Usuario_projeto.ts";
import dadosProjeto from "../Validates/validateProjeto.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

// Melhorar INNER JOIN

// GET de projetos
const listaProjetos = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nome, descricao, dataEntrega, status, ID_usuario } = req.query;

        type Filtros = {
            nome?: { [Op.like]: string },
            descricao?: { [Op.like]: string },
            dataEntrega?: { [Op.between]: Date[] },
            status?: string,
            ID_usuario?: number
        };

        const parametrosProjeto: Filtros = {};
        if (nome) parametrosProjeto.nome = { [Op.like]: `${nome}%` };
        if (descricao) parametrosProjeto.descricao = { [Op.like]: `%${descricao}%` };
        if (dataEntrega) parametrosProjeto.dataEntrega = {
            [Op.between]: [new Date(`${dataEntrega} 00:00:00`), new Date(`${dataEntrega} 23:59:59`)]
        };
        if (status) parametrosProjeto.status = status as string;
        if (!Number.isNaN(Number(ID_usuario)) && ID_usuario) parametrosProjeto.ID_usuario = Number(ID_usuario);

        let projetosLista: Projeto[] = [];
        nome || descricao || dataEntrega || status ?
            projetosLista = await Projeto.findAll({ where: parametrosProjeto, include: { model: Usuario, attributes: ["ID_usuario", "nomeUsuario", "nicknameUsuario"], through: { attributes: [] } } }) :
            projetosLista = await Projeto.findAll({ include: { model: Usuario, attributes: ["ID_usuario", "nomeUsuario", "nicknameUsuario"], through: { attributes: [] } } });

        if (projetosLista.length === 0) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Projetos não encontrados ou não existentes no sistema", projetosLista);
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Usuários do sistema listados com sucesso", projetosLista);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON());

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de projetos do sistema", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// GET de projeto por ID
const listaProjetoID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

        if (Number.isNaN(Number(ID)) || !ID) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "ID de projeto não foi fornecido ou é inválido");
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON());
        };

        const projetoID: Projeto | null = await Projeto.findByPk(Number(ID), { include: { model: Usuario, attributes: ["ID_usuario", "nomeUsuario", "nicknameUsuario"], through: { attributes: [] } } });

        if (!projetoID) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Projeto relacionado ao ID não foi encontrado ou não existe no sistema");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Projeto listado por ID com sucesso", projetoID);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON());

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de projeto do sistema por ID", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// POST de projeto
const cadastraProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosProjeto.safeParse(req.body);
        const { success, data, error } = dadosRequisicao;

        if (!success) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de criação de projeto", null, error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON());
        };

        const { nomeProjeto, descricaoProjeto, dataEntrega, projetoPublico, ID_usuario } = data;
        const dadosNovos = { 
            nomeProjeto: nomeProjeto,
            descricaoProjeto: descricaoProjeto || "",
            dataEntrega: dataEntrega || "",
            projetoPublico: projetoPublico ? true : false
        };

        const usuarioExistente: Usuario | null = await Usuario.findByPk(ID_usuario);
        if (!usuarioExistente) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Usuário relacionado ao ID não foi encontrado ou não existe no sistema");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const novoProjeto: Projeto | null = await Projeto.create(dadosNovos);
        const usuario_projeto: Usuario_projeto | null = await Usuario_projeto.create({ ID_usuario: ID_usuario, ID_projeto: novoProjeto.ID_projeto });
        if (novoProjeto && usuario_projeto){
            const RespostaHTTP = new ResponseHTTP(true, 200, "Novo projeto cadastrado no sistema com sucesso", novoProjeto);
            RespostaHTTP.mostrarMensagem();
            return res.status(200).json(RespostaHTTP.returnJSON());
        };

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro no cadastro de novo projeto no sistema", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// PUT de projeto
const editaProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// DELETE de projeto
const deletaProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

export { listaProjetos, listaProjetoID, cadastraProjeto, editaProjeto, deletaProjeto };


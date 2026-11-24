// Funções da rotas de Projeto
import { type Request, type Response } from "express";
import { Op } from '@sequelize/core';
import Projeto from "../Models/Projeto.ts";
import Usuario from "../Models/Usuario.ts";
import dadosProjeto from "../Validates/validateProjeto.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

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
            projetosLista = await Projeto.findAll({ where: parametrosProjeto, include: { model: Usuario, through: { attributes: ["ID_usuario", "nicknameUsuario"] } } }) :
            projetosLista = await Projeto.findAll({ include: { model: Usuario, through: { attributes: ["ID_usuario", "nicknameUsuario"] } } });

        if (projetosLista.length === 0) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Projetos não encontrados ou não existentes no sistema.", projetosLista);
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON);
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Usuários do sistema listados com sucesso.", projetosLista);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON);

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de projetos do sistema.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

// GET de projeto por ID
const listaProjetoID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

        if (Number.isNaN(Number(ID)) || !ID) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "ID de projeto não foi fornecido ou é inválido.");
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };

        const projetoID: Projeto | null = await Projeto.findByPk(Number(ID), { include: { model: Usuario, through: { attributes: ["ID_usuario", "nicknameUsuario"] } } });

        if (!projetoID) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Projeto relacionado ao ID não foi encontrado ou não existe no sistema.");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON);
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Projeto listado por ID com sucesso.", projetoID);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON);

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de projeto do sistema por ID.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

// POST de projeto
const cadastraProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosProjeto.safeParse(req.body);

        if (!dadosRequisicao.success) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de criação de projeto.", null, dadosRequisicao.error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

// PUT de projeto
const editaProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

// DELETE de projeto
const deletaProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

export { listaProjetos, listaProjetoID, cadastraProjeto, editaProjeto, deletaProjeto };


// Funções CRUD das rotas de Permissão
import { type Request, type Response } from "express";
import Permissao from "../Models/Permissao.ts";
import Usuario from "../Models/Usuario.ts";
import Projeto from "../Models/Projeto.ts";
import dadosPermissao from "../Validates/validatePermissao.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

// Melhorar INNER JOIN

// GET de permissões
const listaPermissoes = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { tipo, projeto } = req.query;

        type Filtros = {
            tipo?: string,
            projeto?: number
        };

        const parametrosPermissao: Filtros = {};
        if (tipo) parametrosPermissao.tipo = tipo as string;
        if (!Number.isNaN(Number(projeto)) && projeto) parametrosPermissao.projeto = Number(projeto);

        let permissoesLista: Permissao[] = [];
        tipo || projeto ?
            permissoesLista = await Permissao.findAll({
                where: parametrosPermissao, 
                attributes: ["ID_permissao", "tipoPermissao", "valorPermissao"], 
                include: [
                    { model: Usuario, attributes: ["ID_usuario", "nomeUsuario", "nicknameUsuario"] },
                    { model: Projeto, attributes: ["ID_projeto", "nomeProjeto"] }
                ]
            }) 
            : permissoesLista = await Permissao.findAll({
                attributes: ["ID_permissao", "tipoPermissao", "valorPermissao"],
                include: [
                    { model: Usuario, attributes: ["ID_usuario", "nomeUsuario", "nicknameUsuario"] },
                    { model: Projeto, attributes: ["ID_projeto", "nomeProjeto"] }
                ]
            });

        if (permissoesLista.length === 0) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Permissões de usuários não encontrados ou não existentes no sistema", permissoesLista);
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Permissões de usuários do sistema listados com sucesso", permissoesLista);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON());

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de permissões de usuários sob projetos do sistema", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// GET de permissão por ID
const listaPermissaoID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

        if (Number.isNaN(ID) || !ID) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "ID de Permissão não foi fornecido ou é inválido");
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON());
        };

        const permissaoID: Permissao | null = await Permissao.findByPk(Number(ID), {
            attributes: ["ID_permissao", "tipoPermissao", "valorPermissao"],
            include: [
                { model: Usuario, attributes: ["ID_usuario", "nomeUsuario", "nicknameUsuario"] },
                { model: Projeto, attributes: ["ID_projeto", "nomeProjeto"] }
            ]
        });

        if (!permissaoID) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Permissão de usuário relacionada ao ID não foi encontrado ou não existe no sistema");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Permissão de usuário listado por ID com sucesso", permissaoID);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON());

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de permissão de usuário sob projeto do sistema por ID", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// POST de permissão
const atribuiPermissao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosPermissao.safeParse(req.body);

        if (!dadosRequisicao.success) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de atribuição de permissão", null, dadosRequisicao.error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON());
        };

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// PUT de permissão
const editaPermissao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// DELETE de permissão
const revogaPermissao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

export { listaPermissoes, listaPermissaoID, atribuiPermissao, editaPermissao, revogaPermissao };
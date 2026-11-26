// Funções da rotas de Anotação
import { type Request, type Response } from "express";
import { Op } from '@sequelize/core';
import Anotacao from "../Models/Anotacao.ts";
import Projeto from "../Models/Projeto.ts";
import dadosAnotacao from "../Validates/validateAnotacao.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

// Melhorar INNER JOIN

// GET de anotações
const listaAnotacoes = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { texto, projeto } = req.query;

        type Filtros = {
            texto?: { [Op.like]: string },
            projeto?: number
        };

        const parametrosAnotacao: Filtros = {};
        if (texto) parametrosAnotacao.texto = { [Op.like]: `%${texto}%` };
        if (!Number.isNaN(Number(projeto)) && projeto) parametrosAnotacao.projeto = Number(projeto);

        let anotacoesLista: Anotacao[] = [];
        texto || projeto ?
            anotacoesLista = await Anotacao.findAll({ 
                where: parametrosAnotacao, 
                attributes: ["ID_anotacao", "textoAnotacao", "dataCriacao"], 
                include: { model: Projeto, attributes: ["ID_projeto", "nomeProjeto"] } }) 
                : anotacoesLista = await Anotacao.findAll({ 
                    attributes: ["ID_anotacao", "textoAnotacao", "dataCriacao"], 
                    include: { model: Projeto, attributes: ["ID_projeto", "nomeProjeto"] } 
            });

        if (anotacoesLista.length === 0) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Anotações de projetos não encontrados ou não existentes no sistema", anotacoesLista);
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Anotações de projetos do sistema listados com sucesso", anotacoesLista);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON());

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de anotações de projetos do sistema", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// GET de anotação por ID
const listaAnotacaoID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

        if (Number.isNaN(Number(ID)) || !ID) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "ID de anotação de projeto não foi fornecido ou é inválido");
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON());
        };

        const anotacaoID: Anotacao | null = await Anotacao.findByPk(Number(ID), {
            attributes: ["ID_anotacao", "textoAnotacao", "dataCriacao"], 
            include: { model: Projeto, attributes: ["ID_projeto", "nomeProjeto"] } 
        });

        if (!anotacaoID) {
            const RespostaHTTP = new ResponseHTTP(false, 404, "Anotação de projeto relacionado ao ID não foi encontrado ou não existe no sistema");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON());
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Anotação de projeto listado por ID com sucesso", anotacaoID);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON());

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de anotação de projeto do sistema por ID", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// POST de anotação
const cadastraAnotacao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosAnotacao.safeParse(req.body);

        if (!dadosRequisicao.success) {
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de criação de anotação", null, dadosRequisicao.error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON());
        };

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// PUT de anotação
const editaAnotacao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

// DELETE de anotação
const deletaAnotacao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON());
    };
};

export { listaAnotacoes, listaAnotacaoID, cadastraAnotacao, editaAnotacao, deletaAnotacao };


// Funções da rotas de Projeto
import { type Express, type Request, type Response } from "express";
import Projeto from "../Models/Projeto.ts";
import dadosProjeto from "../Validates/validateProjeto.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

const listaProjetos = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nome, descricao, dataEntrega, status } = req.query;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const listaProjetoID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const cadastraProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosProjeto.safeParse(req.body);
        
        if(!dadosRequisicao.success){
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

const editaProjeto = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

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


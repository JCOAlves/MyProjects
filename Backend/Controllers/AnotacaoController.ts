// Funções da rotas de Anotação
import { type Express, type Request, type Response } from "express";
import Anotacao from "../Models/Anotacao.ts";
import dadosAnotacao from "../Validates/validateAnotacao.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

const listaAnotacoes = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { texto, projeto } = req.query;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const listaAnotacaoID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const cadastraAnotacao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosAnotacao.safeParse(req.body);
        
        if(!dadosRequisicao.success){
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de criação de anotação.", null, dadosRequisicao.error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const editaAnotacao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const deletaAnotacao = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

export { listaAnotacoes, listaAnotacaoID, cadastraAnotacao, editaAnotacao, deletaAnotacao }; 


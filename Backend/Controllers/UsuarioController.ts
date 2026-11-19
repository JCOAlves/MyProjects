// Funções CRUD das rotas de Usuário
import { type Express, type Request, type Response } from "express";
import Usuario from "../Models/Usuario.ts";
import dadosUsuario from "../Validates/validateUsuario.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

const listaUsuarios = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nome, nickname, email } = req.query;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de usuários do sistema.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const listaUsuarioID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;


        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de usuário do sistema por ID.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const cadastraUsuario = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosUsuario.safeParse(req.body);
        
        if(!dadosRequisicao.success){
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de criação de usuário.", null, dadosRequisicao.error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };

        
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro no cadastro de novo usuário no sistema.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const editaUsuario = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na edição de dados de usuário do sistema.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const deletaUsuario = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na exclusão de usuário do sistema.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

export { listaUsuarios, listaUsuarioID, cadastraUsuario, editaUsuario, deletaUsuario}; 

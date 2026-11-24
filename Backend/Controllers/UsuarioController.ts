// Funções CRUD das rotas de Usuário
import { type Request, type Response } from "express";
import { Op } from '@sequelize/core';
import Usuario from "../Models/Usuario.ts";
import dadosUsuario from "../Validates/validateUsuario.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

// Implementar o INNER JOIN na listagem

const listaUsuarios = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nome, nickname, email } = req.query;

        type Filtros = {
            nome?: { [Op.like]: string },
            nickname?: { [Op.like]: string },
            email?: { [Op.like]: string }
        };

        const parametrosUsuario: Filtros = {};
        if (nome) parametrosUsuario.nome = { [Op.like]: `${nome}%` };
        if (nickname) parametrosUsuario.nickname = { [Op.like]: `${nickname}%` };
        if (email) parametrosUsuario.email = { [Op.like]: `${email}%` };

        let usuariosLista: Usuario[] = [];
        nome || nickname || email ?
            usuariosLista = await Usuario.findAll({ where: parametrosUsuario }) :
            usuariosLista = await Usuario.findAll();

        if (usuariosLista.length === 0){
            const RespostaHTTP = new ResponseHTTP(false, 404, "Usuários não encontrados ou não existentes no sistema.", usuariosLista);
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON);
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Usuários do sistema listados com sucesso.", usuariosLista);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON);

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de usuários do sistema.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const listaUsuarioID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

        if(Number.isNaN(Number(ID)) || !ID){
            const RespostaHTTP = new ResponseHTTP(false, 400, "ID de usuário não foi fornecido ou é inválido.");
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };

        const usuarioID: Usuario | null = await Usuario.findByPk(Number(ID));

        if(!usuarioID){
            const RespostaHTTP = new ResponseHTTP(false, 404, "Usuário relacionado ao ID não foi encontrado ou não existe no sistema.");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON);
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Usuário listado por ID com sucesso.", usuarioID);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON);

    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "Erro na listagem de usuário do sistema por ID.", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const cadastraUsuario = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosUsuario.safeParse(req.body);

        if (!dadosRequisicao.success) {
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

export { listaUsuarios, listaUsuarioID, cadastraUsuario, editaUsuario, deletaUsuario }; 

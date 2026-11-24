// Funções da rotas de Tarefa
import { type Request, type Response } from "express";
import { Op } from '@sequelize/core';
import Tarefa from "../Models/Tarefa.ts";
import dadosTarefa from "../Validates/validateTarefa.ts";
import ResponseHTTP from "../Config/RespostaHTTP.ts";

// Implementar o INNER JOIN na listagem

const listaTarefas = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nome, texto, projeto } = req.query;

        type Filtros = {
            nome?: { [Op.like]: string },
            texto?: { [Op.like]: string },
            projeto?: number
        };

        const parametrosTarefa: Filtros = {};
        if (nome) parametrosTarefa.nome = { [Op.like]: `${nome}%` };
        if (texto) parametrosTarefa.texto = { [Op.like]: `%${texto}%` };
        if (!Number.isNaN(Number(projeto)) && projeto) parametrosTarefa.projeto = Number(projeto);

        let tarefasLista: Tarefa[] = [];
        nome || texto || projeto ?
            tarefasLista = await Tarefa.findAll({ where: parametrosTarefa }) :
            tarefasLista = await Tarefa.findAll();

        if (tarefasLista.length === 0){
            const RespostaHTTP = new ResponseHTTP(false, 404, "Tarefas de projetos não encontrados ou não existentes no sistema.", tarefasLista);
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON);
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Tarefas de projeto do sistema listados com sucesso.", tarefasLista);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON);
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const listaTarefaID = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;

        if(Number.isNaN(ID) || !ID){
            const RespostaHTTP = new ResponseHTTP(false, 400, "ID de tarefa do projeto não foi fornecido ou é inválido.");
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };

        const tarefaID: Tarefa | null = await Tarefa.findByPk(Number(ID));

        if(!tarefaID){
            const RespostaHTTP = new ResponseHTTP(false, 404, "Tarefa de projeto relacionado ao ID não foi encontrado ou não existe no sistema.");
            RespostaHTTP.mostrarMensagem();
            return res.status(404).json(RespostaHTTP.returnJSON);
        };

        const RespostaHTTP = new ResponseHTTP(true, 200, "Tarefa de projeto listado por ID com sucesso.", tarefaID);
        RespostaHTTP.mostrarMensagem();
        return res.status(200).json(RespostaHTTP.returnJSON);
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const cadastraTarefa = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosRequisicao = dadosTarefa.safeParse(req.body);
        
        if(!dadosRequisicao.success){
            const RespostaHTTP = new ResponseHTTP(false, 400, "Erro nos dados enviados na requisição de criação de tarefa.", null, dadosRequisicao.error);
            RespostaHTTP.mostrarMensagem();
            return res.status(400).json(RespostaHTTP.returnJSON);
        };
        
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const editaTarefa = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

const deletaTarefa = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { ID } = req.params;
        
    } catch (error) {
        const RespostaHTTP = new ResponseHTTP(false, 500, "", null, error);
        RespostaHTTP.mostrarMensagem();
        return res.status(500).json(RespostaHTTP.returnJSON);
    };
};

export { listaTarefas, listaTarefaID, cadastraTarefa, editaTarefa, deletaTarefa }; 


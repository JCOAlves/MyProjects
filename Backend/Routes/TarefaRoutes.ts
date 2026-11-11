// Funções da rotas de Tarefa
import express from "express";

const app = express.Router();

app.get("/", () => console.log("Rota de tarefas do projeto"));


export default app;
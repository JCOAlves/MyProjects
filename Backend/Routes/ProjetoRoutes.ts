// Funções da rotas de Projeto
import express from "express";

const app = express.Router();

app.get("/", () => console.log("Rota de Projetos"));


export default app;
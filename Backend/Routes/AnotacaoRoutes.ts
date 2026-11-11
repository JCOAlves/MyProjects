// Funções da rotas de Anotacao
import express from "express";

const app = express.Router();

app.get("/", () => console.log("Rota de anotações do projeto"));


export default app;
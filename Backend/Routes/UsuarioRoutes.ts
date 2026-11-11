// Funções da rotas de Usuário
import express from "express";

const app = express.Router();

app.get("/", () => console.log("Rota de usuários"));

export default app;
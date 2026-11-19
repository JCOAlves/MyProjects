// Funções da rotas de Projeto
import express from "express";
import { listaProjetos, listaProjetoID, cadastraProjeto, editaProjeto, deletaProjeto } from "../Controllers/ProjetoController.ts";

const app = express.Router();

app.get("/", listaProjetos);
app.get("/:ID", listaProjetoID);
app.post("/", cadastraProjeto);
app.put(":ID", editaProjeto);
app.delete(":ID", deletaProjeto);

export default app;
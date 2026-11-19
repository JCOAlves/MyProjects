// Funções da rotas de Tarefa
import express from "express";
import { listaTarefas, listaTarefaID, cadastraTarefa, editaTarefa, deletaTarefa } from "../Controllers/TarefaController.ts";

const app = express.Router();

app.get("/", listaTarefas);
app.get("/:ID", listaTarefaID);
app.post("/", cadastraTarefa);
app.put("/:ID", editaTarefa);
app.delete("/:ID", deletaTarefa);


export default app;
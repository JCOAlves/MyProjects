// Funções da rotas de Anotacao
import express from "express";
import { listaAnotacoes, listaAnotacaoID, cadastraAnotacao, editaAnotacao, deletaAnotacao } from "../Controllers/AnotacaoController.ts";

const app = express.Router();

app.get("/", listaAnotacoes);
app.get("/ID", listaAnotacaoID);
app.post("/", cadastraAnotacao);
app.put("/:ID", editaAnotacao);
app.delete("/:ID", deletaAnotacao);

export default app;
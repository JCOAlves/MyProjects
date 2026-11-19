// Funções da rotas de Permissoes
import express from "express";
import { listaPermissoes, listaPermissaoID, atribuiPermissao, editaPermissao, revogaPermissao } from "../Controllers/PermissaoController.ts";

const app = express.Router();

app.get("/", listaPermissoes);
app.get("/:ID", listaPermissaoID);
app.post("/", atribuiPermissao);
app.put("/:ID", editaPermissao);
app.delete("/:ID", revogaPermissao);

export default app;
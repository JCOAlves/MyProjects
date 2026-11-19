// Funções da rotas de Usuário
import express from "express";
import { listaUsuarios, listaUsuarioID, cadastraUsuario, editaUsuario, deletaUsuario } from "../Controllers/UsuarioController.ts";

const app = express.Router();

app.get("/", listaUsuarios);
app.get("/:ID", listaUsuarioID);
app.post("/", cadastraUsuario);
app.put("/:ID", editaUsuario);
app.delete(":ID", deletaUsuario);

export default app;
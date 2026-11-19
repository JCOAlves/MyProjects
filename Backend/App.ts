import express, { type Express, type Request, type Response } from "express";
import verificacaoBD from "./Config/verificacaoBD.ts";
import CORS from "./Config/CORS.ts";
import dotenv from "dotenv";

// Subrotas
import UsuarioRoutes from "./Routes/UsuarioRoutes.ts";
import ProjetoRoutes from "./Routes/ProjetoRoutes.ts";
import AnotacaoRoutes from "./Routes/AnotacaoRoutes.ts";
import TarefaRoutes from "./Routes/TarefaRoutes.ts";
import PermissaoRoutes from "./Routes/PermissaoRoutes.ts";

dotenv.config();

const app: Express = express();
const HOST: string = process.env.HOST || "localhost";
const PORT: number = Number(process.env.PORT) || 3000;

verificacaoBD(); // Verificar erro em modelo Usuario_projeto
app.use(CORS);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use("/usuarios", UsuarioRoutes);
app.use("/projetos", ProjetoRoutes);
app.use("/anotacoes", AnotacaoRoutes);
app.use("/tarefas", TarefaRoutes);
app.use("/permissoes", PermissaoRoutes);

app.all("/*notfound", (req: Request, res: Response) => {
  console.log("Rota não encontrada ou não existente.");
  res.status(404).send("Rota não encontrada ou não existente.");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
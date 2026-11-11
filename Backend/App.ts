import express, { type Express, type Request, type Response } from "express";
import verificacaoBD from "./Config/verificacaoBD.ts";
import dotenv from "dotenv";

// Subrotas
import UsuarioRoutes from "./Routes/UsuarioRoutes.ts";
import ProjetoRoutes from "./Routes/ProjetoRoutes.ts";
import AnotacaoRoutes from "./Routes/AnotacaoRoutes.ts";
import TarefaRoutes from "./Routes/TarefaRoutes.ts";

dotenv.config();

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

verificacaoBD();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use("/usuarios", UsuarioRoutes);
app.use("/projetos", ProjetoRoutes);
app.use("/anotacoes", AnotacaoRoutes);
app.use("/tarefas", TarefaRoutes);

app.all("/*notfound", (req: Request, res: Response) => {
  console.log("Rota não encontrada ou não existente.");
  res.status(404).send("Rota não encontrada ou não existente.");
});

app.listen(PORT, () => {
    console.log("olá mundo");
});
import express, { type Express, type Request, type Response } from "express";
import verificacaoBD from "./Config/verificacaoBD.ts";
import dotenv from "dotenv";

dotenv.config()

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000

verificacaoBD();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log("olá mundo")
});
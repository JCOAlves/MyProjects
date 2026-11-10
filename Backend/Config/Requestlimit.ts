import dotenv from "dotenv";
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const intervaloTempo: number = Number(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000;
const limiteRequisicoes: number= Number(process.env.RATE_LIMIT_MAX) || 200;

const configLimit = {
    windowMs: intervaloTempo, // Intervalo de tempo em milisegundos
    max: limiteRequisicoes, // quantidade de requisições por intervalo de tempo
    standardHeaders: 'draft-8' as const, 
    legacyHeaders: false,
    message: `Limite de requisições por endereço IP ultrapassado. Tente novamente em ${(intervaloTempo/60000).toFixed(0)} minutos.`,
};

const ReqLimit = rateLimit(configLimit);

export default ReqLimit;
// Função de sincronização do banco de dados
import conexaoBD from "./conexaoBD.ts";

async function verificacaoBD(): Promise<void> {
    try {
        await conexaoBD.authenticate(); // Verifica a conexão do banco de dados
        await conexaoBD.sync(); // Sincroniza com o banco de dados
        console.log(`\x1b[33m[${new Date().toLocaleDateString("pt-BR")}]\x1b[0m - \x1b[32mBanco de dados conectado e sincronizado com sucesso\x1b[0m`);
        
    } catch (error) {
        console.error(`\x1b[33m[${new Date().toLocaleDateString("pt-BR")}]\x1b[0m - \x1b[31mErro na conexão e sincronização do banco de dados: ${error}\x1b[0m`);
    };
};

export default verificacaoBD;
import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const target = fileURLToPath(new URL('../.env', import.meta.url));
const source = fileURLToPath(new URL('../src/environments/.env.example', import.meta.url));
if (existsSync(target)) console.log('O arquivo .env já existe. Nenhuma configuração foi alterada.');
else {
  copyFileSync(source, target);
  console.log('Arquivo .env criado. O modo de demonstração já está pronto para usar.');
}

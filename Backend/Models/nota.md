
1. Limpeza e instalação dos pacotes

No Sequelize v7, cada banco de dados tem seu próprio pacote separado (por exemplo, @sequelize/mysql, @sequelize/postgres, @sequelize/sqlite3 ou @sequelize/mariadb).
• Remova a versão alpha antiga e os pacotes do sequelize-typescript (se tiver instalado algo):bash
npm uninstall sequelize sequelize-typescript reflect-metadata @types/validator
Use o código com cuidado.
• Instale o @sequelize/core e o driver do seu banco:
(Exemplo abaixo usando MySQL + driver mysql2; se usar PostgreSQL, troque por @sequelize/postgres pg).bash
npm install @sequelize/core @sequelize/mysql mysql2
Use o código com cuidado.

2. Ajuste o tsconfig.json

O Sequelize v7 suporta tanto os decorators padrão do ECMAScript (TC39) quanto os decorators legados do TypeScript. Para usar os decorators do @sequelize/core/decorators-legacy com segurança no TypeScript 6.0, deixe seu tsconfig.json assim (lembre-se de remover "erasableSyntaxOnly": true e "paths" antigos):
json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "rewriteRelativeImportExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true
  }
}
Use o código com cuidado.
(Nota: No Sequelize v7 você não precisa de emitDecoratorMetadata nem de reflect-metadata, pois os tipos são passados explicitamente dentro de @Attribute(DataTypes.STRING)).

3. Definição do Model (src/models/Usuario.ts)

No @sequelize/core, os decorators ficam no subpacote @sequelize/core/decorators-legacy e os tipos principais vêm direto de @sequelize/core (sem erro de recursão infinita):
typescript
import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional
} from '@sequelize/core';
import {
  Table,
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  Unique
} from '@sequelize/core/decorators-legacy';

@Table({
  tableName: 'usuarios',
  timestamps: true
})
export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare ID_usuario: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare nome: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  declare email: string;
}
Use o código com cuidado.

4. Conexão com o Banco (src/database/conexao.ts)

No Sequelize v7, a classe Sequelize recebe o dialeto importado diretamente do pacote do seu banco (MySqlDialect, PostgresDialect, etc.) e a lista de models:
typescript
import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';
import { Usuario } from '../models/Usuario.ts';

export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: 'nome_do_banco',
  user: 'root',
  password: 'sua_senha',
  host: 'localhost',
  port: 3306,
  models: [Usuario] // Registra o model automaticamente
});
Use o código com cuidado.

5. Como criar instâncias do Model

Depois que o sequelize for inicializado, você pode instanciar e salvar os registros das três maneiras padrão:
typescript
// 1. Usando new + .save()
const novoUsuario = new Usuario({
  nome: 'Carlos Eduardo',
  email: 'carlos@email.com'
});
await novoUsuario.save();

// 2. Usando .create() (cria e salva em um único passo)
const usuarioCriado = await Usuario.create({
  nome: 'Fernanda Lima',
  email: 'fernanda@email.com'
});

// 3. Usando .build() + .save()
const usuarioBuild = Usuario.build({
  nome: 'Lucas Alves',
  email: 'lucas@email.com'
});
await usuarioBuild.save();
Use o código com cuidado.


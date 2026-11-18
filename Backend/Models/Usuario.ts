// Modelo Sequelize de Usuário
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table, BelongsToMany } from '@sequelize/core/decorators-legacy';
import validator from "validator";
import Projeto from './Projeto.ts';
import Usuario_projeto from './Usuario_projeto.ts';

@Table({
    // Por padrão o Sequelize plurariza o nome das tabelas
    tableName: "usuario", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
    @Attribute({ type: DataTypes.INTEGER })
    @PrimaryKey
    @AutoIncrement
    declare ID_usuario: CreationOptional<number>;

    @Attribute({
        type: DataTypes.STRING, validate: {
            validacaoNome(nomeUsuario: string) {
                if (nomeUsuario.trim().length > 100) 
                    throw new Error("Nome de usuário ultrapassou limite de 100 caracteres do banco de dados.");
            }
        }
    })
    @NotNull
    declare nomeUsuario: string;

    @Attribute({
        type: DataTypes.STRING, validate: {
            validacaoNickname(nicknameUsuario: string) {
                if (nicknameUsuario.trim().length < 8)
                    throw new Error("Nickname de usuário tem número de caracteres menor do que 8.");

                else if (nicknameUsuario.trim().length > 12)
                    throw new Error("Nickname de usuário tem número de caracteres maior do que 12.");
            }
        }
    })
    @NotNull
    @Unique
    declare nicknameUsuario: string;

    @Attribute({
        type: DataTypes.STRING, validate: {
            validacaoEmail(emailUsuario: string) {
                if (!validator.isEmail(emailUsuario)) 
                    throw new Error("Endereço de Email fornecido pelo usuário é invalido.");

                else if (emailUsuario.trim().length > 100) 
                    throw new Error("Endereço de Email de usuário ultrapassou limite de 100 caracteres do banco de dados.");
            }
        }
    })
    @NotNull
    @Unique
    declare emailUsuario: string;

    @Attribute({
        type: DataTypes.TEXT, validate: {
            validacaoSenha(senhaUsuario: string) {
                if(senhaUsuario.trim().length < 8)
                    throw new Error("Senha fornecida pelo usuário não possui o número minimo de 8 caracteres.");
            }
        }
    })
    @NotNull
    declare senhaUsuario: string;

    @BelongsToMany(() => Projeto, {
        through: () => Usuario_projeto,
        foreignKey: "ID_usuario",
        otherKey: "ID_projeto",
    })
    declare projetos?: NonAttribute<Projeto[]>
};

export default Usuario;
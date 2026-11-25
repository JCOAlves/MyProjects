// Modelo Sequelize de Projeto
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, Default, BelongsToMany } from '@sequelize/core/decorators-legacy';
import validator from "validator";
import Usuario from './Usuario.ts';
import Usuario_projeto from './Usuario_projeto.ts';

@Table({
    tableName: "projeto", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Projeto extends Model<InferAttributes<Projeto>, InferCreationAttributes<Projeto>> {
    @Attribute({ type: DataTypes.INTEGER })
    @PrimaryKey
    @AutoIncrement
    declare ID_projeto: CreationOptional<number>;

    @Attribute({
        type: DataTypes.STRING(120), validate: {
            validacaoNome(nomeProjeto: string) {
                if (nomeProjeto.trim().length > 120)
                    throw new Error("Nome de projeto ultrapassou limite de 120 caracteres do banco de dados.");

                else if (nomeProjeto.trim().length === 0)
                    throw new Error("Nome de projeto composto apenas por espaços ou nome inválido.");
            }
        }
    })
    @NotNull
    @Default("Sem Nome")
    declare nomeProjeto: CreationOptional<string>;

    @Attribute({ type: DataTypes.TEXT })
    @NotNull
    declare descricaoProjeto: string;

    @Attribute({
        type: DataTypes.DATE, validate: {
            validacaoData(dataEntrega: string) {
                const formatoCorreto = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dataEntrega);
                if (!formatoCorreto)
                    throw new Error("Data e hora de entrega não estão no formato padrão (YYYY-MM-DD HH:mm:ss).");

                else if (!validator.isISO8601(dataEntrega, { strict: true, strictSeparator: false }))
                    throw new Error("A data de entrega fornecida não corresponde com uma data real no calendario.");
            }
        }
    })
    @NotNull
    declare dataEntrega: Date;

    @Attribute({ type: DataTypes.BOOLEAN })
    @NotNull
    @Default(false)
    declare projetoPublico: CreationOptional<boolean>;

    @Attribute({ type: DataTypes.ENUM("Não Iniciado", "Em Desenvolvimento", "Concluído") })
    @NotNull
    @Default("Não Iniciado")
    declare statusProjeto: CreationOptional<"Não Iniciado" | "Em Desenvolvimento" | "Concluído">;

    @Attribute({ type: DataTypes.DATE })
    @NotNull
    @Default(DataTypes.NOW)
    declare dataCriacao: CreationOptional<Date>;

    // Relacionamento N:M de Usuários e Projetos
    @BelongsToMany(() => Usuario, {
        through: () => Usuario_projeto,
        foreignKey: "ID_projeto",
        otherKey: "ID_usuario",
        inverse: { as: "projetos" }
    })
    declare usuarios?: NonAttribute<Usuario[]>;
};

export default Projeto;
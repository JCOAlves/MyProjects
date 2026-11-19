// Modelo Sequelize de tarefa
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, BelongsTo, Default } from '@sequelize/core/decorators-legacy';
import validator from "validator";
import Projeto from './Projeto.ts';

@Table({
    tableName: "tarefa", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Tarefa extends Model<InferAttributes<Tarefa>, InferCreationAttributes<Tarefa>> {
    @Attribute({ type: DataTypes.INTEGER })
    @PrimaryKey
    @AutoIncrement
    declare ID_tarefa: CreationOptional<number>;

    @Attribute({
        type: DataTypes.STRING(100), validate: {
            validacaoNome(nomeTarefa: string) {
                if (nomeTarefa.trim().length > 100)
                    throw new Error("Nome de tarefa ultrapassou limite de 100 caracteres do banco de dados.");
            }
        }
    })
    @NotNull
    declare nomeTarefa: string;

    @Attribute({
        type: DataTypes.DATE, validate: {
            validacaoData(dataInicio: string) {
                const formatoCorreto = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dataInicio);
                if (!formatoCorreto)
                    throw new Error("Data e hora de inicio não estão no formato padrão (YYYY-MM-DD HH:mm:ss).");

                else if (!validator.isISO8601(dataInicio, { strict: true, strictSeparator: false }))
                    throw new Error("A data de inicio fornecida não corresponde com uma data real no calendario.");
            }
        }
    })
    @NotNull
    declare dataInicio: string;

    @Attribute({
        type: DataTypes.DATE, validate: {
            validacaoData(dataFim: string) {
                const formatoCorreto = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dataFim);
                if (!formatoCorreto)
                    throw new Error("Data e hora de fim não estão no formato padrão (YYYY-MM-DD HH:mm:ss).");

                else if (!validator.isISO8601(dataFim, { strict: true, strictSeparator: false }))
                    throw new Error("A data de fim fornecida não corresponde com uma data real no calendario.");
            }
        }
    })
    @NotNull
    declare dataFim: string;

    @Attribute({ type: DataTypes.ENUM("Não Iniciada", "Em Desenvolvimento", "Concluída") })
    @Default("Não Iniciada")
    declare statusTarefa: CreationOptional<string>;

    @Attribute({ type: DataTypes.DATE })
    @NotNull
    @Default(DataTypes.NOW)
    declare dataCriacao: CreationOptional<Date>;

    // Chave Estrangeira de ID Projeto
    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare ID_projeto: ForeignKey<Projeto["ID_projeto"]>

    @BelongsTo(() => Projeto, "ID_projeto")
    declare projeto?: NonAttribute<Projeto>
};

export default Tarefa;
// Modelo Sequelize de Projeto
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table, Default } from '@sequelize/core/decorators-legacy';

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
        type: DataTypes.STRING, validate: {
            validacaoNome(nomeProjeto: string) {
                if (nomeProjeto.trim().length > 120) {
                    throw new Error("Nome de projeto ultrapassou limite de 120 caracteres do banco de dados.");
                };
            }
        }
    })
    @NotNull
    @Default("Sem Nome")
    declare nomeProjeto: string

    @Attribute({ type: DataTypes.TEXT })
    @NotNull
    declare descricaoProjeto: string

};

export default Projeto;
// Modelo Sequelize de Anotação
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, BelongsTo, Default } from '@sequelize/core/decorators-legacy';
import Projeto from './Projeto.ts';

@Table({
    tableName: "anotacao", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Anotacao extends Model<InferAttributes<Anotacao>, InferCreationAttributes<Anotacao>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare ID_anotacao: CreationOptional<number>;

    @Attribute({
        type: DataTypes.TEXT, validate: {
            validacaoTexto(textoAnotacao: string) {
                if (textoAnotacao.trim().length === 0)
                    throw new Error("Texto de anotação não foi fornecido ou texto composto apenas por espaços.");
            }
        }
    })
    @NotNull
    declare textoAnotacao: string;

    @Attribute({ type: DataTypes.DATE })
    @NotNull
    @Default(DataTypes.NOW)
    declare dataCriacao: CreationOptional<Date>;

    // Chave Estrangeira de ID Projeto
    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare ID_projeto: ForeignKey<Projeto["ID_projeto"]>;

    @BelongsTo(() => Projeto, "ID_projeto")
    declare projeto?: NonAttribute<Projeto>;
};

export default Anotacao;
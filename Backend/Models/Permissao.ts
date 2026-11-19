// Modelo Sequelize de Permissão de usuário
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute, type ForeignKey } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Table, BelongsTo } from '@sequelize/core/decorators-legacy';
import Usuario from './Usuario.ts';
import Projeto from './Projeto.ts';

@Table({
    tableName: "permissao", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Permissao extends Model<InferAttributes<Permissao>, InferCreationAttributes<Permissao>> {
    @Attribute({ type: DataTypes.INTEGER })
    @PrimaryKey
    @AutoIncrement
    declare ID_permissao: CreationOptional<number>;

    @Attribute({ type: DataTypes.ENUM("R-PTA", "CRUD-A", "CRUD-TA", "CRUD-PTA") })
    @NotNull
    declare tipoPermissao: "R-PTA" | "CRUD-A" | "CRUD-TA" | "CRUD-PTA";

    @Attribute({
        type: DataTypes.INTEGER, validate: {
            validacaoValor(valorPermissao: number) {
                if (valorPermissao < 100111)
                    throw new Error("Valor de permissão inferior a 100,111.");
                else if (valorPermissao > 1111111)
                    throw new Error("Valor de permissão superior a 1,111,111.");
            }
        }
    })
    @NotNull
    declare valorPermissao: number;

    // Chave Estrangeira de ID Usuário
    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare ID_usuario: ForeignKey<Usuario["ID_usuario"]>;

    @BelongsTo(() => Usuario, "ID_usuario")
    declare usuario?: NonAttribute<Usuario>;

    // Chave Estrangeira de ID Projeto
    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare ID_projeto: ForeignKey<Projeto["ID_projeto"]>;

    @BelongsTo(() => Projeto, "ID_projeto")
    declare projeto?: NonAttribute<Projeto>;
};

export default Permissao;
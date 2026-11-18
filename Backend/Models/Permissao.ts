// Modelo Sequelize de Permissão de usuário
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table, Default, BelongsTo } from '@sequelize/core/decorators-legacy';
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

    @Attribute({ type: DataTypes.ENUM("R-PTA", "CRUD-A", "CRUD-TA") })
    @NotNull
    declare tipoPermissao: string

    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare valorPermissao: CreationOptional<number>

    @BelongsTo(() => Usuario, "ID_usuario")
    declare usuario?: NonAttribute<Usuario>

    @BelongsTo(() => Projeto, "ID_projeto")
    declare projeto?: NonAttribute<Projeto>
};

export default Permissao;
// Modelo Sequelize de Usuário
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table } from '@sequelize/core/decorators-legacy';
import { deflate } from 'node:zlib';

@Table({
    // Por padrão o Sequelize plurariza o nome das tabelas
    tableName: "usuario", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare ID_usuario: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare nomeUsuario: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Unique
    declare nicknameUsuario: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare senhaUsuario: string;
};

export default Usuario;
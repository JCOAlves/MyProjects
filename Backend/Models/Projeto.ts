// Modelo Sequelize de Projeto
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table } from '@sequelize/core/decorators-legacy';

@Table({
    tableName: "projeto", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Projeto extends Model<InferAttributes<Projeto>, InferCreationAttributes<Projeto>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare ID_projeto: CreationOptional<number>;

    // ...
};

export default Projeto;
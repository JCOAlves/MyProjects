// Modelo Sequelize de tarefa
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table } from '@sequelize/core/decorators-legacy';

@Table({
    tableName: "tarefa", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Tarefa extends Model<InferAttributes<Tarefa>, InferCreationAttributes<Tarefa>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare ID_tarefa: CreationOptional<number>;

    // ...
};

export default Tarefa;
// Modelo Sequelize de Anotação
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table } from '@sequelize/core/decorators-legacy';

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

    // ...
};

export default Anotacao;
// Modelo Sequelize de tabela intermediaria de usuários e Usuario_projetos
import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull, Unique, Table, Default } from '@sequelize/core/decorators-legacy';

@Table({
    tableName: "usuario_projeto", // Nome EXATO da tabela no seu MySQL
    freezeTableName: true, // Impede o Sequelize de pluralizar
    timestamps: false // Isso impede o Sequelize de tentar criar as colunas de data automaticamente
})
class Usuario_projeto extends Model<InferAttributes<Usuario_projeto>, InferCreationAttributes<Usuario_projeto>> {
    @Attribute({ type: DataTypes.INTEGER })
    @PrimaryKey
    @AutoIncrement
    declare ID_relacionamento: CreationOptional<number>;

    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare ID_usuario: CreationOptional<number>

    @Attribute({ type: DataTypes.INTEGER })
    @NotNull
    declare ID_projeto: CreationOptional<number>
};

export default Usuario_projeto;
import { Model, DataTypes } from 'sequelize'


class Fields {
  static IntegerField({ autoIncrement = false, primaryKey = false } = {}) {
        return {
            type: DataTypes.INTEGER,
            autoIncrement,
            primaryKey
        };
    }
    
    static StringField({ allowNull = true, unique = false } = {}) {
        return {
            type: DataTypes.STRING,
            allowNull,
            unique
        };
    }
    
    static Boolean({ allowNull = true, defaultValue = false } = {}) {
        return {
            type: DataTypes.BOOLEAN,
            allowNull,
            defaultValue
        };
    }
    
    static EmailField({ allowNull = false, unique = true } = {}) {
        return {
            type: DataTypes.STRING,
            allowNull,
            unique,
            validate: {
                isEmail: true
            }
        };
    }

}



export default Fields
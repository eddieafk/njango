import { sequelize, DataTypes, BaseModel } from './db.js';
import Fields from './fields.js'

class User extends BaseModel {}
User.init({
    id: Fields.IntegerField({ autoIncrement: true, primaryKey: true}),
    username: Fields.StringField({ allowNull: false, unique: true }),
    email: Fields.StringField({ allowNull: false, unique: true }),
    password: Fields.StringField({ allowNull: false }),
}, {
    sequelize, 
    modelName: 'User'
});
await User.syncModel();

class Token extends BaseModel {}
Token.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('access', 'refresh'),
        allowNull: false
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Token'
});
await Token.syncModel();

export { User, Token };

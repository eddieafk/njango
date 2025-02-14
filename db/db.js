import { Sequelize, DataTypes, Model } from 'sequelize';

const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: 'database.sqlite'
    });


// Django Model yapısına benzer bir BaseModel sınıfı
class BaseModel extends Model {
    static init(attributes, options) {
        if (!options || !options.sequelize) {
            throw new Error('Sequelize instance is missing in options.');
        }
        return super.init(attributes, options);
    }

    static async syncModel() {
        await this.sync({ alter: true });
    }
}


// Sequelize bağlantısını dışa aktar
export { sequelize, DataTypes, BaseModel };

import { Sequelize, DataTypes, Model } from 'sequelize';
import Fields from './fields.js'

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

        // Tüm modellere otomatik ID ekle
        const defineAttributes = {
            id: Fields.IntegerField({ autoIncrement: true, primaryKey: true }),
            ...attributes 
        };

        return super.init(defineAttributes, options);
    }

    static async syncModel() {
        await this.sync({ alter: true });
    }
}


// Sequelize bağlantısını dışa aktar
export { sequelize, DataTypes, BaseModel };

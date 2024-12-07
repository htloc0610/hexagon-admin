const { DataTypes } = require('sequelize');
const db = require('../../configs/db');

const Product = db.define('product', {
    productName: {
        type: DataTypes.STRING,
    },

    description: {
        type: DataTypes.STRING,
    },

    category: {
        type: DataTypes.STRING,
    },

    manufacturer: {
        type: DataTypes.STRING,
    },

    price: {
        type: DataTypes.DOUBLE,
    },

    rating: {
        type: DataTypes.INTEGER,
    },

    stock_quanity: {
        type: DataTypes.INTEGER,
    },

    url: { // thumbnail
        type: DataTypes.STRING,
        defaultValue: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOtjqFKVwZWNCqI33H1OWcsUaZYww6FLLFAw&s',
    },

    urls: {
        type: DataTypes.JSON, // Sử dụng JSON để lưu danh sách URL
        defaultValue: [],
    },
},
    {
        timestamps: true, // Kích hoạt timestamps
    }
)

module.exports = Product;
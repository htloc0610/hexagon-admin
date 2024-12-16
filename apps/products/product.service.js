const Product = require('./product.model'); // Đường dẫn tới model Product
const { Op } = require('sequelize');

const productService = {
    async getAllProducts() {
        try {
            const products = await Product.findAll();
            return products;
        } catch (error) {
            throw new Error('Error retrieving products: ' + error.message);
        }
    },

    async getAllCategories() {
        try {
            const categories = await Product.findAll({
                attributes: ['category'],
                group: ['category']
            });
            return categories.map(category => category.category);
        } catch (error) {
            throw new Error('Error retrieving categories: ' + error.message);
        }
    },

    async getAllManufacturers() {
        try {
            const manufacturers = await Product.findAll({
                attributes: ['manufacturer'],
                group: ['manufacturer']
            });
            return manufacturers.map(manufacturer => manufacturer.manufacturer);
        } catch (error) {
            throw new Error('Error retrieving manufacturers: ' + error.message);
        }
    },
    async getPaginatedProducts(offset, limit) {
        try {
            const products = await Product.findAll({
                offset,
                limit
            });
            return products.map(product => product.dataValues);
        } catch (error) {
            throw new Error('Error retrieving paginated products: ' + error.message);
        }
    }
};

module.exports = productService;
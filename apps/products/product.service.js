const Product = require('./product.model'); // Đường dẫn tới model Product
const { Op } = require('sequelize');

const productService = {

    async getProductById(id) {
        try {
            const product = await Product.findByPk(id);
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            throw new Error('Error retrieving product: ' + error.message);
        }
    },

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
    },
    // Tạo sản phẩm mới
    async createProduct(productData) {
        try {
            const newProduct = await Product.create(productData); // Tạo sản phẩm
            return newProduct;
        } catch (error) {
            throw new Error('Error creating product: ' + error.message);
        }
    }
};

module.exports = productService;
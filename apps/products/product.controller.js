const productService = require('./product.service');

const productController = {
    async getAllProducts() {
        try {
            const products = await productService.getAllProducts();
            return products;
        } catch (error) {
            throw new Error('Error retrieving products: ' + error.message);
        }
    },

    async getAllCategories() {
        try {
            const categories = await productService.getAllCategories();
            return categories;
        } catch (error) {
            throw new Error('Error retrieving categories: ' + error.message);
        }
    },
    async getAllManufacturers() {
        try {
            const manufacturers = await productService.getAllManufacturers();
            return manufacturers;
        } catch (error) {
            throw new Error('Error retrieving manufacturers: ' + error.message);
        }
    }
};

module.exports = productController;
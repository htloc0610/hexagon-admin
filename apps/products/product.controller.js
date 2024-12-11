const productService = require('./product.service');

const productController = {
    async getProducts(req, res) {
        const products = await productService.getProducts();
        res.json(products);
    }
};

module.exports = productController;
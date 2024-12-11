const Product = require('./product.model'); // Đường dẫn tới model Product
const { Op } = require('sequelize');

const productService = {
    async getProducts() {
        return Product.findAll();
    },
    async getProductById(id) {
        return Product.findByPk(id);
    },
    async createProduct(product) {
        return Product.create(product);
    },
    async updateProduct(id, product) {
        return Product.update(product, {
            where: {
                id
            }
        });
    },
    async deleteProduct(id) {
        return Product.destroy({
            where: {
                id
            }
        });
    },
    async searchProduct(keyword) {
        return Product.findAll({
            where: {
                name: {
                    [Op.like]: `%${keyword}%`
                }
            }
        });
    }
};

module.exports = productService;
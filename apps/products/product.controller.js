const productService = require('./product.service');

const productController = {

    async getProductById(id) {
        try {
            const product = await productService.getProductById(id);
            return product.dataValues;
        } catch (error) {
            throw new Error('Error retrieving product: ' + error.message);
        }
    },
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
    },
    async getPaginatedProducts(offset, limit) {
        try {
            const products = await productService.getPaginatedProducts(offset, limit);
            return products;
        } catch (error) {
            throw new Error('Error retrieving paginated products: ' + error.message);
        }
    },
    // Tạo sản phẩm mới
    async createProduct(req, res) {
        try {
            const productData = req.body; // Dữ liệu từ body của request
            const newProduct = await productService.createProduct(productData);
            res.status(201).json(newProduct); // Trả về sản phẩm mới với mã trạng thái 201
        } catch (error) {
            res.status(400).json({ message: error.message }); // Lỗi dữ liệu đầu vào
        }
    },
    async updateProduct(productData) {
        try {
            const updatedProduct = await productService.updateProduct(productData);
            return updatedProduct;
        } catch (error) {
            throw new Error('Error updating product: ' + error.message);
        }
    }
};

module.exports = productController;
const Product = require('./product.model'); // Đường dẫn tới model Product
const OrderItem = require('../orders/order_item.model');
const { Op, fn, col } = require('sequelize');

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
            const products = await Product.findAll({
                attributes: {
                    include: [
                    //   [fn('SUM', col('order_items.quantity')), 'totalPurchase']
                    ]
                  },
                  include: [
                    {
                      model: OrderItem,
                      as: 'order_items',
                      
                    }
                  ],
                //   group: ['product.id'], // Nhóm theo cột 'id' của bảng Product
            });

            products.map(product => {
                product.dataValues.totalPurchase = product.dataValues.order_items.reduce((total, item) => total + item.quantity, 0);
                return product;
            });

            // console.log(products);

            const data = products.map(product => ({
                id: product.dataValues.id,
                productName: product.dataValues.productName,
                totalPurchase: product.dataValues.totalPurchase,
                price: product.dataValues.price
            }));

            // console.log(data);

            return data;
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
                offset: offset,
                limit: limit,
                attributes: {
                    include: [
                    //   [fn('SUM', col('order_items.quantity')), 'totalPurchase']
                    ]
                  },
                  include: [
                    {
                      model: OrderItem,
                      as: 'order_items',
                      
                    }
                  ],
                //   group: ['product.id'], // Nhóm theo cột 'id' của bảng Product
            });

            const data = products.map(product => {
                product.dataValues.totalPurchase = product.dataValues.order_items.reduce((total, item) => total + item.quantity, 0);
                return product;
            });

            return data.map(product => product.dataValues);
        } catch (error) {
            throw new Error('Error retrieving paginated products: ' + error.message);
        }
    },

    async getFilteredAndSortedProducts({ offset, limit, filterName, filterCategory, filterManufacturer, sortKey, sortOrder }) {
        try {
          const whereConditions = {};
          if (filterName) {
            whereConditions.productName = { [Op.iLike]: `%${filterName}%` };
          }
          if (filterCategory) {
            whereConditions.category = { [Op.iLike]: `%${filterCategory}%` };
          }
          if (filterManufacturer) {
            whereConditions.manufacturer = { [Op.iLike]: `%${filterManufacturer}%` };
          }
      
          const order = [];
          if (sortKey) {
            order.push([sortKey, sortOrder === 'desc' ? 'DESC' : 'ASC']);
          }
      
          const products = await Product.findAll({
            where: whereConditions,
            include: [
              {
                model: OrderItem,
                as: 'order_items',
              },
            ],
          });
      
          const data = products.map(product => {
            product.dataValues.totalPurchase = product.dataValues.order_items.reduce((total, item) => total + item.quantity, 0);
            return product;
          });

          data.sort((a, b) => {
            if (sortKey === 'totalPurchase') {
              return sortOrder === 'desc' ? b.dataValues.totalPurchase - a.dataValues.totalPurchase : a.dataValues.totalPurchase - b.dataValues.totalPurchase;
            } else {
              const aValue = a.dataValues[sortKey];
              const bValue = b.dataValues[sortKey];
              if (aValue < bValue) {
                return sortOrder === 'desc' ? 1 : -1;
              }
              if (aValue > bValue) {
                return sortOrder === 'desc' ? -1 : 1;
              }
            }
            return 0;
          });

          const paginatedData = data.slice(offset, offset + limit);
      
          return paginatedData.map(product => product.dataValues);
        } catch (error) {
          throw new Error('Error retrieving filtered and sorted products: ' + error.message);
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
    },
    async updateProduct(productData) {
        try {
            const product = await Product.findByPk(productData.productId);
            if (!product) {
                throw new Error('Product not found');
            }
            await product.update(productData);
            return product;
        } catch (error) {
            throw new Error('Error updating product: ' + error.message);
        }
    },
};

module.exports = productService;
const Order = require('./order.model');
const OrderItem = require('./order_item.model');
const Product = require('../products/product.model');
const User = require('../users/user.model');
const moment = require('moment');
const sequelize = require('../../configs/db');
const { Sequelize, Op } = require('sequelize');


const orderService = {
    async createOrder(orderData) {
        const { userId, paymentMethod, shippingAddress, orderItems } = orderData;
        const transaction = await Order.sequelize.transaction();

        try {
            const newOrder = await Order.create({
                userId,
                paymentMethod,
                shippingAddress,
                totalCost: 0, // Will be updated later
            }, { transaction });

            let totalCost = 0;

            for (const item of orderItems) {
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }

                const orderItem = await OrderItem.create({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtPurchase: product.price,
                }, { transaction });

                totalCost += product.price * item.quantity;
            }

            newOrder.totalCost = totalCost;
            await newOrder.save({ transaction });

            await transaction.commit();
            return newOrder;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async getOrderById(orderId) {
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    { model: OrderItem, include: [Product] },
                    { model: User, attributes: ['firstName', 'lastName'] } // Include user data with first name and last name attributes
                ],
            });
            return order;
        } catch (error) {
            throw new Error('Error retrieving order: ' + error.message);
        }
    },

    async getAllOrders() {
        try {
            const orders = await Order.findAll({
                include: [
                    { model: OrderItem },
                    { model: User, attributes: ['firstName', 'lastName'] } // Include user data with first name and last name attributes
                ],
            });
            return orders;
        } catch (error) {
            throw new Error('Error retrieving orders: ' + error.message);
        }
    },

    async updateOrder(orderId, orderData) {
        const transaction = await Order.sequelize.transaction();

        try {
            const order = await Order.findByPk(orderId, {
                include: [OrderItem],
            });

            if (!order) {
                throw new Error('Order not found');
            }

            const { paymentMethod, shippingAddress, orderItems } = orderData;

            order.paymentMethod = paymentMethod;
            order.shippingAddress = shippingAddress;

            await OrderItem.destroy({ where: { orderId: order.id }, transaction });

            let totalCost = 0;

            for (const item of orderItems) {
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }

                const orderItem = await OrderItem.create({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtPurchase: product.price,
                }, { transaction });

                totalCost += product.price * item.quantity;
            }

            order.totalCost = totalCost;
            await order.save({ transaction });

            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async deleteOrder(orderId) {
        const transaction = await Order.sequelize.transaction();

        try {
            await OrderItem.destroy({ where: { orderId }, transaction });
            await Order.destroy({ where: { id: orderId }, transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw new Error('Error deleting order: ' + error.message);
        }
    },
    async updateOrderStatus(orderId, status) {
        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            order.paymentStatus = status;
            await order.save();
            return order;
        } catch (error) {
            throw new Error('Error updating order status: ' + error.message);
        }
    },
    async getRecentOrders(limit) {
        try {
            const orders = await Order.findAll({
                limit,
                order: [['createdAt', 'DESC']],
                include: [
                    { model: User, attributes: ['firstName', 'lastName', 'url'] }
                ]
            });
            return orders.map(order => ({
                ...order.dataValues,
                customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
                userAvatar: order.user ? order.user.url : 'img/default-avatar.png',
            }));
        } catch (error) {
            throw new Error('Error retrieving recent orders: ' + error.message);
        }
    },
    async getRevenueReport(startDate, endDate, timeRange) {
        try {
            let dateTruncUnit;
            switch (timeRange) {
                case 'day':
                    dateTruncUnit = 'day';
                    break;
                case 'week':
                    dateTruncUnit = 'week';
                    break;
                case 'month':
                default:
                    dateTruncUnit = 'month';
                    break;
            }
    
            const revenueData = await Order.findAll({
                where: {
                    orderDate: {
                        [Op.between]: [startDate, endDate],
                    },
                },
                attributes: [
                    [sequelize.fn('date_trunc', dateTruncUnit, sequelize.col('orderDate')), 'date'],
                    [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalRevenue'],
                ],
                group: ['date'],
                order: [['date', 'ASC']],
            });
    
            return revenueData.map(item => ({
                date: item.dataValues.date,
                totalRevenue: parseFloat(item.dataValues.totalRevenue),
            }));
        } catch (error) {
            throw new Error('Error retrieving revenue report: ' + error.message);
        }
    },
    
    async getTopRevenueProducts(startDate, endDate) {
        try {
            const topProducts = await sequelize.query(
                `
                SELECT 
                    p."productName" AS productName,
                    SUM(oi."priceAtPurchase" * oi.quantity) AS totalRevenue
                FROM 
                    order_items oi
                INNER JOIN 
                    products p
                ON 
                    oi."productId" = p.id
                WHERE 
                    oi."createdAt" BETWEEN :startDate AND :endDate
                GROUP BY 
                    p."productName"
                ORDER BY 
                    totalRevenue DESC
                LIMIT 10
                `,
                {
                    replacements: { startDate, endDate },
                    type: Sequelize.QueryTypes.SELECT,
                }
            );
            
    
            return topProducts.map(item => ({
                productName: item.productName,
                totalRevenue: parseFloat(item.totalRevenue),
            }));
        } catch (error) {
            throw new Error('Error retrieving top revenue products: ' + error.message);
        }
    },
    
    
};  

module.exports = orderService;
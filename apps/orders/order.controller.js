const orderService = require('./order.service');
const moment = require('moment');


const orderController = {
    async createOrder(req, res) {
        try {
            const orderData = req.body;
            const newOrder = await orderService.createOrder(orderData);
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getOrderById(req, res) {
        try {
            const orderId = req.params.id;
            const order = await orderService.getOrderById(orderId);
            const orderData = {
                ...order.dataValues,
                customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
                orderItems: order.order_items.map(item => ({
                    ...item.dataValues,
                    productName: item.product ? item.product.productName : 'Unknown'
                }))
            };
            res.render('orderDetail', { order: orderData });
        } catch (error) {
            res.status(400).send('Error retrieving order: ' + error.message);
        }
    },
    // const productData = products.map(product => product.dataValues);

    async getAllOrders(req, res) {
        try {
            const orders = await orderService.getAllOrders();
            const ordersData = orders.map(order => {
                return {
                    ...order.dataValues,
                    customerName: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown',
                    numberOfItems: order.order_items ? order.order_items.length : 0 // Count the number of items in the order
                };
            });
            res.render('orders', { orders: ordersData });
        } catch (error) {
            res.status(500).send('Error retrieving orders: ' + error.message);
        }
    },
    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            const updatedOrder = await orderService.updateOrderStatus(orderId, status);
            res.json({ message: 'Order status updated successfully', order: updatedOrder });
        } catch (error) {
            res.status(500).send('Error updating order status: ' + error.message);
        }
    },

    async updateOrder(req, res) {
        try {
            const orderId = req.params.id;
            const orderData = req.body;
            const updatedOrder = await orderService.updateOrder(orderId, orderData);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteOrder(req, res) {
        try {
            const orderId = req.params.id;
            await orderService.deleteOrder(orderId);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    async getDashboard(req, res) {
        try {
            const recentOrders = await orderService.getRecentOrders(5); // Fetch 5 most recent orders
            const revenueReport = await orderService.getRevenueReport('day'); // Default to day
            const topRevenueProducts = await orderService.getTopRevenueProducts('day'); // Default to day
            res.render('index', { recentOrders, revenueReport, topRevenueProducts });
        } catch (error) {
            res.status(500).send('Error retrieving dashboard data: ' + error.message);
        }
    },
};

module.exports = orderController;
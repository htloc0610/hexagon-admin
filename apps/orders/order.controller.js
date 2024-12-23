const orderService = require('./order.service');

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
            res.status(200).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
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
            // console.log(ordersData);
            res.render('orders', { orders: ordersData });
        } catch (error) {
            res.status(500).send('Error retrieving orders: ' + error.message);
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
};

module.exports = orderController;
const { DataTypes } = require('sequelize');
const db = require('../../configs/db');

const OrderItem = db.define('order_item', {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders', // Liên kết tới bảng Order
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // Liên kết tới bảng Product
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Mặc định là 1
    validate: {
      min: 1, // Số lượng ít nhất là 1
    },
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2), // Giá tại thời điểm mua
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = OrderItem;

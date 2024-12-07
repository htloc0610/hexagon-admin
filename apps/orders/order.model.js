const { DataTypes } = require('sequelize');
const db = require('../../configs/db');

const Order = db.define('order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Liên kết tới bảng User
      key: 'id',
    },
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['banking', 'cash_on_delivery']], // Các phương thức thanh toán hợp lệ
    },
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unpaid', // Trạng thái mặc định là "unpaid"
    validate: {
      isIn: [['unpaid', 'paid', 'refunded']], // Các trạng thái hợp lệ
    },
  },
  orderStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending', // Trạng thái mặc định là "pending"
    validate: {
      isIn: [['pending', 'processing', 'shipped', 'completed', 'cancelled']], // Các trạng thái hợp lệ
    },
  },
  orderCode: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: () => Math.floor(Math.random() * 1000000)
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Mặc định là thời gian hiện tại
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2), // Tổng giá trị đơn hàng
    allowNull: false,
    defaultValue: 0.00,
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

module.exports = Order;

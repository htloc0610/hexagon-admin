const { DataTypes } = require('sequelize');
const db = require('../../configs/db'); // Đường dẫn đến cấu hình cơ sở dữ liệu

const Cart = db.define('cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Bảng User
      key: 'id',
    },
  },
}, {
  timestamps: true, // Thêm createdAt và updatedAt
});

module.exports = Cart;

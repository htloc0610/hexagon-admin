const Product = require('./products/product.model');
const Review = require('./reviews/review.model');
const User = require('./users/user.model');

const Cart = require('./carts/cart.model');
const CartItem = require('./carts/cart_item.model');

const Order = require('./orders/order.model');
const OrderItem = require('./orders/order_item.model');

const Admin = require("./admin/admin.model")

// Product có nhiều Review
Product.hasMany(Review, {
  foreignKey: 'productId',
  onDelete: 'CASCADE',
});

// Review thuộc về một Product
Review.belongsTo(Product, {
  foreignKey: 'productId',
});

// Review thuộc về một User
Review.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'SET NULL', // Khi xóa User, giữ lại Review nhưng không có User liên kết
});

// User có nhiều Review
User.hasMany(Review, {
    foreignKey: 'userId',
});

// Mỗi User chỉ có một Cart
User.hasOne(Cart, {
  foreignKey: 'userId',
  onDelete: 'CASCADE', // Xóa User thì xóa luôn Cart
});

Cart.belongsTo(User, {
  foreignKey: 'userId',
});

// Một giỏ hàng có thể chứa nhiều sản phẩm (CartItem)
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// Mối quan hệ giữa CartItem và Product
CartItem.belongsTo(Product, {
  foreignKey: 'productId',
  onDelete: 'CASCADE', // Khi xóa Product thì xóa luôn CartItem liên quan
});
Product.hasMany(CartItem, {
  foreignKey: 'productId',
});

// Mối quan hệ giữa User và Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Mối quan hệ giữa Order và OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Mối quan hệ giữa OrderItem và Product
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });


module.exports = { Product, User, Review, Cart, CartItem, Order, OrderItem,  Admin };

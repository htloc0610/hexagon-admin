require('pg');
const express = require('express');
const path = require('path');
const { engine } = require("express-handlebars");
const hbs = require("handlebars");
const db = require('./configs/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');



const cors = require('cors');
const flash = require('connect-flash');

const { Product, User, Review, Cart, CartItem, Order, OrderItem,  Admin } = require('./apps/relationships');

const app = express();



// Để sử dụng biến môi trường trong file .env
require('dotenv').config();

// Passport config
require('./configs/passport')(passport);


// Sử dụng json parser
app.use(express.json());
// Sử dụng x-www-form-urlencoded parser
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Express session
// app.use(session({
//     store: MongoStore.create({
//         mongoUrl: process.env.SESSION_STORE_URI, // Ensure this is correctly set
//         ttl: 14 * 24 * 60 * 60, // 14 days
//         autoRemove: 'native'}),
//     secret: 'penguynSecret',
//     resave: false,
//     saveUninitialized: true,
// }));

app.use(session({
    secret: 'penguynSecret',
    resave: false,
    saveUninitialized: true,
}));

// Flash middlewares
app.use(flash());

// Passport middlewares
app.use(passport.session());
app.use(passport.initialize());


// Thiết lập view engine là Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('.hbs', engine({ defaultLayout: 'main', extname: '.hbs' }));

// Đăng ký các handlebars helpers
const hbs_helpers = require("./helpers/handlebars.helpers");

hbs.registerHelper('range', hbs_helpers.range);
hbs.registerHelper('add', hbs_helpers.add);
hbs.registerHelper('eq', hbs_helpers.eq);
hbs.registerHelper('getImage', hbs_helpers.getImage);
hbs.registerHelper('gt', hbs_helpers.gt);
hbs.registerHelper('lt', hbs_helpers.lt);
hbs.registerHelper('subtract', hbs_helpers.subtract);
hbs.registerHelper('times', hbs_helpers.times);
hbs.registerHelper('formatDate', hbs_helpers.formatDate);
hbs.registerHelper('isActive', hbs_helpers.isActive);
hbs.registerHelper('json', hbs_helpers.json);
hbs.registerHelper('formatPaymentMethod', hbs_helpers.formatPaymentMethod);
hbs.registerHelper('multiply', hbs_helpers.multiply);
hbs.registerHelper('timeAgo', hbs_helpers.timeAgo);

// Thiết lập thư mục tĩnh
app.use(express.static(path.join(__dirname, '/public')));

// Định nghĩa các routes
// app.use('/', require('./apps/dashboard/index.routes'));
// app.use('/users', require('./apps/users/user.routes'));
// app.use('/products', require('./apps/products/product.routes'));
// app.use('/cart', require('./apps/carts/cart.routes'));
// app.use('/orders', require('./apps/orders/order.routes'));
app.use('/', require('./index.routes'));


// APIs
// app.use('/api/products', require('./apps/products/product.api'));
// app.use('/api/cart', require('./apps/carts/cart.api'));
// app.use('/api/orders', require('./apps/orders/order.api'));

// Kết nối database
const connectDB = async () => {
    console.log('Check database connection...');

    try {
        await db.authenticate();
        // Đồng bộ các models
        await db.sync({ force: false });
        console.log('Database connection established');
    } catch (e) {
        console.log('Database connection failed', e);
    }
};

const PORT = process.env.PORT || 3000;

(async () => {
    await connectDB();
    // Khởi động server
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})();

module.exports = app;
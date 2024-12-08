const express = require('express');
const router = express.Router();
const adminController = require('./apps/admin/admin.controller');

router.get('/', (req, res) => {
    res.render('index', { currentRoute: '/' });
});

router.get('/login', (req, res) => {
    res.render('login', { layout: 'login-layout', currentRoute: '/login' });
});

router.get('/products', (req, res) => {
    res.render('products', { currentRoute: '/products' });
});

router.get('/edit-product', (req, res) => {
    res.render('edit-product', { currentRoute: '/edit-product' });
});


router.get('/add-product', (req, res) => {
    res.render('add-product', { currentRoute: '/add-product' });
});


router.get('/profile', (req, res) => {
    res.render('profile', { currentRoute: '/profile' });
});

router.post('/register', adminController.createAdmin);
router.post('/login', adminController.loginAdmin);


const accounts = [
    { username: 'user1', email: 'user1@example.com', registrationTime: '2023-01-01', role: 'User' },
    { username: 'admin1', email: 'admin1@example.com', registrationTime: '2023-01-02', role: 'Admin' },
    // Add more accounts as needed
];

router.get('/accounts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name || '';
    const email = req.query.email || '';
    const accountsPerPage = 5;

    const filteredAccounts = accounts.filter(account =>
        account.username.toLowerCase().includes(name.toLowerCase()) &&
        account.email.toLowerCase().includes(email.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
    const paginatedAccounts = filteredAccounts.slice((page - 1) * accountsPerPage, page * accountsPerPage);

    res.json({ accounts: paginatedAccounts, totalPages });
});


module.exports = router;

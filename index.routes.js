const express = require('express');
const router = express.Router();
const adminController = require('./apps/admin/admin.controller');
const { ensureAuthenticated } = require('./configs/auth');
const { uploadPhoto, resizeAndUploadImage } = require('./middlewares/imageUploadMiddleware');



router.get('/', ensureAuthenticated, (req, res) => {
    res.render('index', { currentRoute: '/' });
});

router.get('/login', (req, res) => {
    res.render('login', { layout: 'login-layout', currentRoute: '/login' });
});

router.get('/products', ensureAuthenticated, (req, res) => {
    res.render('products', { currentRoute: '/products' });
});

router.get('/edit-product', ensureAuthenticated, (req, res) => {
    res.render('edit-product', { currentRoute: '/edit-product' });
});


router.get('/add-product', ensureAuthenticated, (req, res) => {
    res.render('add-product', { currentRoute: '/add-product' });
});


router.post('/profileImg', uploadPhoto.array('profileImg', 1), resizeAndUploadImage, (req, res) => {
    if (!req.imageUrl) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('Uploaded to Cloudinary:', req.imageUrl);
    res.json({ message: 'Upload success', imageUrl: req.imageUrl });
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', {
        currentRoute: 'profile',
        name: req.user?.username,
        profileImg: req.user?.picture,
        email: req.user?.email,
        firstName: req.user?.firstName,
        lastName: req.user?.lastName
    });
});



router.post('/register', adminController.createAdmin);
router.post('/login', adminController.loginAdmin); 
router.get('/logout', adminController.logoutAdmin);
router.put('/profile', ensureAuthenticated, adminController.updateAdmin);
router.put('/password', ensureAuthenticated, adminController.changePassword);



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

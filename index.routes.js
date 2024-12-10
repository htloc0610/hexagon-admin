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


router.get('/accounts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const accounts = await adminController.getPaginatedAccounts(offset, limit);
        res.render('accounts', { accounts, page });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API route to fetch paginated accounts
router.get('/api/accounts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const accounts = await adminController.getPaginatedAccounts(offset, limit);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/account/:id', async (req, res) => {
    try {
        const account = await adminController.getAccountById(req.params.id);
        res.render('accountDetails', { account });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;

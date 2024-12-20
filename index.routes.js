const express = require('express');
const router = express.Router();
const adminController = require('./apps/admin/admin.controller');
const { ensureAuthenticated } = require('./configs/auth');
const { uploadPhoto, resizeAndUploadImage } = require('./middlewares/imageUploadMiddleware');
const productController = require('./apps/products/product.controller');


router.get('/', ensureAuthenticated, (req, res) => {
    res.render('index', { currentRoute: '/' });
});


// Login, register routes -----------------------------------------------------
router.get('/login', (req, res) => {
    res.render('login', { layout: 'login-layout', currentRoute: '/login' });
});
router.post('/register', adminController.createAdmin);
router.post('/login', adminController.loginAdmin); 
router.get('/logout', adminController.logoutAdmin);
router.put('/password', ensureAuthenticated, adminController.changePassword);


// Profile routes -----------------------------------------------------
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

router.put('/profile', ensureAuthenticated, adminController.updateAdmin);


router.post('/profileImg', uploadPhoto.array('profileImg', 1), resizeAndUploadImage, (req, res) => {
    if (!req.imageUrl) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ message: 'Upload success', imageUrl: req.imageUrl });
});



// Account routes-----------------------------------------------------
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
router.get('/api/accounts', ensureAuthenticated, async (req, res) => {
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

router.get('/account/:id', ensureAuthenticated, async (req, res) => {
    try {
        const account = await adminController.getAccountById(req.params.id);
        res.render('accountDetails', { account });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Products routes -----------------------------------------------------
router.get('/products', async (req, res) => {
    try {
        const products = await productController.getAllProducts();
        const categories = await productController.getAllCategories();
        const manufacturers = await productController.getAllManufacturers();

        const productData = products.map(product => product.dataValues);

        res.render('products', { products: productData, categories, manufacturers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const products = await productController.getPaginatedProducts(offset, limit);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/api/add', productController.createProduct);

router.get('/add-product', (req, res) => {
    res.render('add-product', { currentRoute: '/add-product' });
});

router.get('/edit-product', ensureAuthenticated, (req, res) => {
    res.render('edit-product', { currentRoute: '/edit-product' });
});





module.exports = router;

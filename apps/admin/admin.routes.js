const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");

const { ensureAuthenticated } = require("../../configs/auth");

const {
  uploadPhoto,
  resizeAndUploadImage,
} = require("../../middlewares/imageUploadMiddleware");

// [GET] /
router.get("/", ensureAuthenticated, adminController.renderHomePage);

// [GET] /login
router.get("/login", adminController.renderLoginPage);

// [GET] /products
router.get(
  "/products",
  ensureAuthenticated,
  adminController.renderProductsPage
);

// [GET] /edit-product
router.get(
  "/edit-product",
  ensureAuthenticated,
  adminController.renderEditProductPage
);

// [GET] /add-product
router.get("/add-product", adminController.renderAddProductPage);

// [POST] /profileImg
router.post(
  "/profileImg",
  uploadPhoto.array("profileImg", 1),
  resizeAndUploadImage,
  adminController.uploadImage
);

// [GET] /profile
router.get("/profile", ensureAuthenticated, adminController.renderProfilePage);

// [POST] /register
// router.post("/register", adminController.createAdmin);

// [POST] /login
router.post("/login", adminController.loginAdmin);

// [GET] /logout
router.get("/logout", adminController.logoutAdmin);

// [PUT] /profile
router.put("/profile", ensureAuthenticated, adminController.updateAdmin);

// [PUT] /password
router.put("/password", ensureAuthenticated, adminController.changePassword);

// [GET] /accounts
router.get("/accounts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const accounts = await adminController.getPaginatedAccounts(offset, limit);
    res.render("accounts", { accounts, page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// [GET] /api/accounts
router.get("/api/accounts", ensureAuthenticated, async (req, res) => {
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

// [GET] /account/:id
router.get("/account/:id", ensureAuthenticated, async (req, res) => {
  try {
    const account = await adminController.getAccountById(req.params.id);
    res.render("accountDetails", { account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

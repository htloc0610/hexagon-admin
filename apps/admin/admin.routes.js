const express = require('express');
const router = express.Router();
// const { ensureAuthenticated } = require('../../configs/auth');

const adminController = require('./admin.controller');

// router.get('/login', AdminController.renderLoginPage);
// router.get('/register', AdminController.renderSignupPage);

// router.post('/register', adminController.createAdmin);
// router.post('/login', adminController.loginAdmin);

// router.get('/logout', AdminController.logoutUser);

// router.get("/verify", AdminController.verifyAccount);

// // Route profile
// router.get('/profile', ensureAuthenticated, (req, res) => {
//     res.render('profile', {
//         currentView: 'profile',
//         name: req.user?.username,
//         profileImg: req.user?.picture,
//         email: req.user?.email,
//         firstName: req.user?.firstName,
//         lastName: req.user?.lastName
//     });
// });

// Route update profile
// router.put('/profile', ensureAuthenticated, userController.updateUser);
// router.put('/profile/password', ensureAuthenticated, userController.changePassword);

// router.get("/forgot-password", userController.renderForgotPasswordPage);
// router.post("/forgot-password", userController.forgotPassword);

// router.get("/reset-password", userController.renderResetPasswordPage);
// router.post("/reset-password", userController.resetPassword);

// // How to use http://localhost:3000/users/login/auth/google
// router.get("/login/auth/google", userController.loginWithGoogle);
// router.get("/login/auth/google/callback", userController.callbackGoogle);




module.exports = router;
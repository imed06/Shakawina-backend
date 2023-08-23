const { Router } = require('express');
const authController = require('../controllers/authController');

const authRouter = Router();

// sign up router
authRouter.post('/signup', authController.registerUser);

// login router
authRouter.post('/login', authController.loginUser);

// logout router
authRouter.get('/logout', authController.logoutUser);

// forgot password router
authRouter.post('/forgotpassword', authController.resetPasswordByEmail);

module.exports = authRouter;
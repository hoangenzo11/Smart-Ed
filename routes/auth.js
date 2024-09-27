const express = require('express');
const authRoutes = express.Router();
const authController = require('../controller/authController');
const {authenticate} = require("../auth/verifyToken");

authRoutes.post('/register', authController.register);
authRoutes.get('/verify-email', authController.verifyEmail);
authRoutes.post('/login', authController.login);
authRoutes.post('/logout', authenticate, authController.logout);
authRoutes.post('/request-password-reset', authController.requestPasswordReset);
authRoutes.post('/reset-password/:id', authenticate, authController.resetPassword);
authRoutes.post('/forgot-password', authController.forgotPassword);
module.exports= authRoutes;
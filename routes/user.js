const express = require('express');
const userRoutes = express.Router();
const userController = require('../controller/userController');
const {authenticate,restrict} = require('../auth/verifyToken');

userRoutes.get('/',authenticate,restrict(['admin']), userController.getAllUsers);
userRoutes.get('/:id',authenticate,restrict(['parent']), userController.getSingeUser);
userRoutes.put('/:id',authenticate,restrict(['parent']), userController.updateUser);
userRoutes.delete('/:id',authenticate,restrict(['parent', 'admin']), userController.deleteUser);

module.exports = userRoutes;
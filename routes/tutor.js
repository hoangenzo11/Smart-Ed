const express = require('express');
const tutorRoutes = express.Router();
const tutorController = require('../controller/tutorController');
const { authenticate, restrict } = require('../auth/verifyToken');

const reviewRoutes = require('./review');

tutorRoutes.use('/:tutorId/review', reviewRoutes);
tutorRoutes.get('/', tutorController.getAllTutors);
tutorRoutes.post('/apply/:id', authenticate, restrict(['tutor']), tutorController.submitApplication);
tutorRoutes.get('/applications',authenticate,restrict(['admin']), tutorController.getAllApplications);
tutorRoutes.get('/:id', tutorController.getSingeTutor);
tutorRoutes.put('/:id', authenticate, restrict(['admin']), tutorController.updateTutor);
tutorRoutes.delete('/:id', authenticate, restrict(['admin']), tutorController.deleteTutor);

tutorRoutes.put('/approval/:id', authenticate, restrict(['admin']), tutorController.updateTutorApproval);

module.exports = tutorRoutes;
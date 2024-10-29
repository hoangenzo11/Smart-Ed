// routes/booking.js
const express = require('express');
const bookingRoutes = express.Router();
const bookingController = require('../controller/bookingController');
const { authenticate, restrict } = require('../auth/verifyToken');

bookingRoutes.get('/all', authenticate, restrict(['admin']), bookingController.getAllBookings);
bookingRoutes.get('/my-bookings', authenticate, bookingController.getUserBookings);
bookingRoutes.post('/', authenticate, restrict(['parent']), bookingController.createBooking);
bookingRoutes.put('/approve/:id', authenticate, restrict(['admin']), bookingController.approveBooking);

module.exports = bookingRoutes;
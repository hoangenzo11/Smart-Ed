const express = require('express');
const reviewRoutes = express.Router({ mergeParams: true });
const reviewController = require('../controller/reviewController');
const {authenticate, restrict} = require("../auth/verifyToken");

reviewRoutes.route('/')
    .get(reviewController.getAllReviews)
    .post(authenticate,restrict(['parent']),reviewController.createReview);

module.exports = reviewRoutes;


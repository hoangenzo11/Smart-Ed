const express = require('express');
const reviewRoutes = express.Router({ mergeParams: true });
const reviewController = require('../controller/reviewController');
const {authenticate, restrict} = require("../auth/verifyToken");

reviewRoutes.route('/')
    .post(authenticate,restrict(['parent']),reviewController.createReview)
reviewRoutes.get('/my-reviews', authenticate, restrict(['parent']), reviewController.getMyReviews);
module.exports = reviewRoutes;


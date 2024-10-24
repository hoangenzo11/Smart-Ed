const Review = require("../models/reviewSchema");
const Tutor = require("../models/tutorSchema");

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({});
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const createReview = async (req, res) => {
    if (!req.body.tutor) req.body.tutor = req.params.tutorId;
    if (!req.body.user) req.body.user = req.params.userId;

    const newReview = new Review(req.body);
    try {
        const savedReview = await newReview.save();
        await Tutor.findByIdAndUpdate(req.body.tutor, {
            $push: { reviews: savedReview._id }
        });
        res.status(200).json({ success: true, message: 'Review submitted', data: savedReview });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const reviewController = {
    getAllReviews,
    createReview
};

module.exports = reviewController;
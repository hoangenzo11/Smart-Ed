const Review = require("../models/reviewSchema");
const Tutor = require("../models/tutorSchema");
const User = require("../models/userSchema");



const createReview = async (req, res) => {
    const userId = req.user._id; // Get the user ID from the decoded token
    const { tutorId, reviewText, rating } = req.body;

    const newReview = new Review({
        tutor: tutorId,
        user: userId,
        reviewText,
        rating
    });

    try {
        const savedReview = await newReview.save();
        await Tutor.findByIdAndUpdate(tutorId, {
            $push: { reviews: savedReview._id }
        });
        await User.findByIdAndUpdate(userId, {
            $push: { reviews: savedReview._id }
        });
        res.status(200).json({ success: true, message: 'Review submitted', data: savedReview });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the decoded token
        const role = req.user.role; // Get the role from the decoded token

        let reviews;
        if (role === 'parent') {
            reviews = await Review.find({ user: userId });
        } else if (role === 'tutor') {
            reviews = await Review.find({ tutor: userId });
        } else {
            return res.status(403).json({ success: false, error: 'Unauthorized access' });
        }

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const reviewController = {
    createReview,
    getMyReviews // Add the new function here
};

module.exports = reviewController;
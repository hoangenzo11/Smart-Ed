const jwt = require('jsonwebtoken');
const Tutor = require('../models/TutorSchema');
const User = require('../models/UserSchema');



const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided. Please authenticate.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        let user = await User.findById(decoded._id);
        if (!user) {
            user = await Tutor.findById(decoded._id);
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found. Please authenticate.' });
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token. Please authenticate.' });
    }
};
const restrict = roles => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not have access to this resource.' });
    }
    next();
};

// const restrict = roles => async (req, res, next) => {
//     const userId = req.userId;
//     let user;
//
//     const parent = await User.findById(userId);
//     const tutor = await Tutor.findById(userId);
//     if (parent) {
//         user = parent;
//     }
//     if (tutor) {
//         user = tutor;
//     }
//     if (!roles.includes(user.role)) {
//         return res.status(401).json({ success: false, error: 'Unauthorized' });
//     }
//     next();
// }

module.exports = {
    authenticate,
    restrict
};
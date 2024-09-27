const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tutorSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    price: { type: Number },
    gender: {type: String, enum: ["male", "female", "other"]},
    address: {type: String},
    age: {type: Number},
    role: {
        type: String,
        default: "tutor",
    },

    // Fields for doctors only
    specialization: {
        type: String,
        enum: [
            'Vietnamese',
            'Mathematics',
            'Science',
            'History and Geography',
            'Literature',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Geography',
            'English'
        ]
    },
    qualifications: [{
        img: { type: String, required: true },
        name: { type: String, required: true }
    }],

    experiences: {
        type: Array,
    },

    bio: { type: String, maxLength: 50 },
    about: { type: String },
    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
    booking : [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    isApproved: {
        type: String,
        enum: ["pending", "approved", "cancelled"],
        default: "pending",
    },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

const Tutor =   mongoose.models.Tutor || mongoose.model('Tutor', tutorSchema);


module.exports = Tutor;

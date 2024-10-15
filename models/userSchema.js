const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    role: {
        type: String,
        enum: ["parent", "admin"],
        default: "parent",
    },
    gender: {type: String, enum: ["male", "female", "other"]},
    address: {type: String},
    age: {type: Number},
    currentGrade: {type: Number},
    booking: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
    resetPasswordToken: {type: String},
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String }, // Added field for verification token
    verificationTokenExpiry: { type: Date }, // Added field for verification token expiry
    isVerified: { type: Boolean, default: false },
});


const User = mongoose.models.User || mongoose.model('User', userSchema);


module.exports = User;

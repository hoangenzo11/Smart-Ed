const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        tutor: {
            type: mongoose.Types.ObjectId,
            ref: "Tutor",
            required: true,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User", // Ensure this line correctly references the User model
            required: true,
        },

        appointmentDate: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "cancelled"],
            default: "pending",
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
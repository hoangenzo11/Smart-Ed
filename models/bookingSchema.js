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
            ref: "User",
            required: true,
        },
        appointmentDates: [
            {
                type: Date,
                required: true,
            }
        ],
        timeSlots: [
            {
                start: {
                    type: Date,
                    required: true,
                },
                end: {
                    type: Date,
                    required: true,
                },
            }
        ],
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
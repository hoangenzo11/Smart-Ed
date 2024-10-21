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
        appointmentDate: {
            type: Date,
            required: true,
        },

        timeSlot: {
            start: {
                type: Date,
                required: true,
            },
            end: {
                type: Date,
                required: true,
            },
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
// bookingSchema.pre("save", function (next) {
//     if (this.timeSlot.start) {
//         this.timeSlot.end = new Date(this.timeSlot.start.getTime() + 2 * 60 * 60 * 1000);
//     }
//     next();
// });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
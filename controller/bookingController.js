const Booking = require('../models/bookingSchema');
const Tutor = require('../models/tutorSchema');
const User = require('../models/userSchema');


const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('tutor', 'name price specialization')
            .populate('user', 'name email address');


        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getUserBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'tutor') {
            bookings = await Booking.find({ tutor: req.user._id })
                .populate('tutor', 'name')
                .populate('user', 'name email');
        } else {
            bookings = await Booking.find({ user: req.user._id })
                .populate('tutor', 'name price')
                .populate('user', 'name email');
        }
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const createBooking = async (req, res) => {
    const { tutor, appointmentDates, timeSlots } = req.body;
    const userId = req.params.userId; // Get the user ID from the request parameters

    if (appointmentDates.length !== timeSlots.length) {
        return res.status(400).json({ success: false, error: 'Appointment dates and time slots must have the same length' });
    }

    try {
        const bookings = [];

        for (let i = 0; i < appointmentDates.length; i++) {
            const newBooking = new Booking({
                tutor,
                user: userId,
                appointmentDates: [appointmentDates[i]],
                timeSlots: [timeSlots[i]],
                status: 'pending',
            });

            const savedBooking = await newBooking.save();

            // Update the Tutor and User models
            await Tutor.findByIdAndUpdate(tutor, { $push: { booking: savedBooking._id } });
            await User.findByIdAndUpdate(userId, { $push: { booking: savedBooking._id } });

            bookings.push(savedBooking);
        }

        res.status(200).json({
            success: true,
            message: 'Bookings created successfully',
            data: bookings,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const approveBooking = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updateData = { status };

        if (status === 'approved') {
            updateData.isPaid = true;
        } else if (status === 'cancelled') {
            updateData.isPaid = false;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // Add runValidators option here
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const message = status === 'cancelled' ? 'Booking rejected' : 'Booking approved successfully';

        res.status(200).json({
            success: true,
            message,
            data: updatedBooking,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
const bookingController = {
    getAllBookings,
    getUserBookings,
    createBooking,
    approveBooking,
};

module.exports = bookingController;
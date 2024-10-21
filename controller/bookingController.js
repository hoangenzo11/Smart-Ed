const Booking = require('../models/bookingSchema');
const Tutor = require('../models/tutorSchema');
const User = require('../models/userSchema');


const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('tutor', 'name price')
            .populate('user', 'name email');

        let totalSum = 0;
        bookings.forEach(booking => {
            if (booking.status === 'approved') {
                totalSum += booking.tutor.price;
            }
        });

        res.status(200).json({ success: true, data: bookings, totalSum });
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
    const { tutor,appointmentDate, timeSlot } = req.body;
    const userId = req.params.userId; // Get the user ID from the request parameters

    try {
        const newBooking = new Booking({
            tutor,
            user: userId,
            timeSlot,
            appointmentDate,
            status: 'pending',
        });

        const savedBooking = await newBooking.save();

        // Update the Tutor and User models
        await Tutor.findByIdAndUpdate(tutor, { $push: { booking: savedBooking._id } });
        await User.findByIdAndUpdate(userId, { $push: { booking: savedBooking._id } });

        const imageUrl = `${req.protocol}://${req.get('host')}/images/qrcode.png`;

        res.status(200).json({
            success: true,
            message: 'Booking created successfully',
            data: savedBooking,
            imageUrl,
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
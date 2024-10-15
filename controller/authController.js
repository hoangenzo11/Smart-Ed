require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const Tutor = require('../models/tutorSchema');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: '30d',
        }
    );
};

// register
const register = async (req, res) => {
    const { email, password, name, role, photo, gender } = req.body;
    let user = null;
    try {
        if (role === 'parent') {
            user = await User.findOne({ email });
        } else if (role === 'tutor') {
            user = await Tutor.findOne({ email });
        }
        if (user) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

        if (role === 'parent') {
            user = new User({
                email,
                password, // No hashing
                name,
                role,
                verificationToken,
                verificationTokenExpiry,
            });
        } else if (role === 'tutor') {
            user = new Tutor({
                email,
                password, // No hashing
                name,
                role,
                photo,
                gender,
                verificationToken,
                verificationTokenExpiry,
            });
        }

        // Send verification email
        const verificationUrl = `http://${req.headers.host}/api/auth/verify-email?token=${verificationToken}`;
        const msg = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: ${verificationUrl}`,
        };

        await sgMail.send(msg);

        await user.save();
        res.status(200).json({ success: true, message: 'User created successfully. Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        }) || await Tutor.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Verification token is invalid or has expired' });
        }

        // Clear the verification token fields and mark the user as verified
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        user.isVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Email has been verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    let user = null;
    try {
        const parent = await User.findOne({ email });
        const tutor = await Tutor.findOne({ email });
        if (parent) {
            user = parent;
        } else if (tutor) {
            user = tutor;
        }
        if (!user) {
            return res.status(400).json({ success: false, error: 'User does not exist' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ success: false, error: 'Email is not verified' });
        }
        if (password !== user.password) {
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        console.log('Token:', token);
        const { password: userPassword, role, appointments, ...rest } = user.toObject();

        res.status(200).json({
            status: true,
            message: 'User logged in successfully',
            token,
            role
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    let user = null;
    try {
        user = await User.findOne({ email }) || await Tutor.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: 'User does not exist' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER_RECOVERY,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                  Please click on the following link, or paste this into your browser to complete the process:\n\n
                  http://${req.headers.host}/reset/${resetToken}\n\n
                  If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Token sent', resetToken);

        res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findById(userId) || await Tutor.findById(userId);

        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        if (oldPassword !== user.password) {
            return res.status(400).json({ success: false, error: 'Old password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    console.log('Reset token:', token);

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }) || await Tutor.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Password reset token is invalid or has expired' });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const AuthController = {
    register,
    verifyEmail,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    forgotPassword
};

module.exports = AuthController;
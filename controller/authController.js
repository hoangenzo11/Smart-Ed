
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const nodemailer = require('nodemailer'); // Add this line


sgMail.setApiKey(process.env.SENDGRID_API_KEY);



const User = require('../models/UserSchema');
const Tutor = require('../models/TutorSchema');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const bcrypt = require('bcrypt');


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
}
// // register
// const register = async (req, res) => {
//     const { email, password, name, role, photo, gender } = req.body;
//     let user = null;
//     try {
//         if (role === 'parent') {
//             user = await User.findOne({ email });
//         } else if (role === 'tutor') {
//             user = await Tutor.findOne({ email });
//         }
//         if (user) {
//             return res.status(400).json({ success: false, error: 'User already exists' });
//         }
//         // hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashPassword = await bcrypt.hash(password, salt);
//
//         if (role === 'parent') {
//             user = new User({
//                 email,
//                 password: hashPassword,
//                 name,
//                 role,
//
//             });
//         }
//         if (role === 'tutor') {
//             user = new Tutor({
//                 email,
//                 password: hashPassword,
//                 name,
//                 role,
//                 photo,
//                 gender,
//             });
//         }
//         await user.save();
//         res.status(200).json({ success: true, message: 'User created successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

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
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

        if (role === 'parent') {
            user = new User({
                email,
                password: hashPassword,
                name,
                role,
                verificationToken,
                verificationTokenExpiry,
            });
        }
        if (role === 'tutor') {
            user = new Tutor({
                email,
                password: hashPassword,
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
            to: email, // Set to the user's email address
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
        user.isVerified = true; // Assuming you have an `isVerified` field in your schema
        await user.save();

        res.status(200).json({ success: true, message: 'Email has been verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// const verifyEmail = async (req, res) => {
//     const { token } = req.query;
//
//     try {
//         const user = await User.findOne({
//             verificationToken: token,
//             verificationTokenExpiry: { $gt: Date.now() }
//         }) || await Tutor.findOne({
//             verificationToken: token,
//             verificationTokenExpiry: { $gt: Date.now() }
//         });
//
//         if (!user) {
//             return res.status(400).json({ success: false, error: 'Verification token is invalid or has expired' });
//         }
//
//         // Clear the verification token fields and mark the user as verified
//         user.verificationToken = undefined;
//         user.verificationTokenExpiry = undefined;
//         user.isVerified = true; // Assuming you have an `isVerified` field in your schema
//         await user.save();
//
//         res.status(200).json({ success: true, message: 'Email has been verified successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };


// login
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
        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(400).json({ success: false, error: 'Email is not verified' });
        }
        // Check password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }
        // Create token
        const token = generateToken(user);
        console.log('Token:', token);
        const { password, role, appointments, ...rest } = user._doc;
        res.status(200).json({
            status: true,
            message: 'User logged in successfully',
            token,
            data: { ...rest },
            role
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// logout
const logout = (req, res) => {
    res.clearCookie('token'); // Assuming the token is stored in a cookie
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
// request password reset
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    let user = null;
    try {
        user = await User.findOne({ email }) || await Tutor.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: 'User does not exist' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send email
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

// reset password
const resetPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id; // Get the user ID from the request parameters

    try {
        const user = await User.findById(userId) || await Tutor.findById(userId);

        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        // Check if the old password matches
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, error: 'Old password is incorrect' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// forgot password
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

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password and clear the reset token fields
        user.password = hashPassword;
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
}

module.exports = AuthController;
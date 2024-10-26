const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const path = require('path');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/userSchema'); // Import the User model


// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tutorRoutes = require('./routes/tutor');
const reviewRoutes = require('./routes/review');
const bookingRoutes = require('./routes/booking');


dotenv.config();


const app = express();
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

const corsOptions = {
    origin: true
};
app.use('/images', express.static(path.join('D:', 'backend', 'images')));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// DB connection
mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {

        });
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

// Function to create an admin account
const createAdminAccount = async () => {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "123";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = new User({
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
    });
    await admin.save();
    console.log('Admin account created');
};

// Routes
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'images', 'check.jpg');
    res.sendFile(imagePath);
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/booking', bookingRoutes);

app.listen(new URL(baseUrl).port, () => {
    connectDB();
    // createAdminAccount()
    console.log(`Server is running at ${baseUrl}`);
});
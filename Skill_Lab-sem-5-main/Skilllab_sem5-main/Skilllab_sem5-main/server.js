// server.js
const express = require('express');
const mongoose = require('mongoose');
const userController = require('./controllers/userController');
const orderController = require('./controllers/orderController');
const foodController = require('./controllers/foodController');
const { authenticateUser } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.get('/api/user/:userId/orders', authenticateUser, userController.getUserOrders);
app.post('/api/user/:userId/send-otp', authenticateUser, orderController.sendOTP);
app.post('/api/food/:foodId/review', authenticateUser, foodController.postReview);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// foodController.js
const Food = require('C:\Users\HP\Downloads\Skill_Lab-sem-5-main\Skill_Lab-sem-5-main\Skilllab_sem5-main\Skilllab_sem5-main\models\Food.js');

exports.postReview = async (req, res) => {
  const { userId, foodId, review, rating } = req.body;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Save the review to the food item
    food.reviews.push({ userId, review, rating });
    await food.save();

    // Share review on Facebook
    await shareReviewOnFacebook(userId, review, rating, food);

    res.status(201).json({ message: 'Review posted successfully' });
  } catch (error) {
    console.error('Error posting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function shareReviewOnFacebook(userId, review, rating, food) {
  // Implement code to share review on Facebook using Facebook Graph API
  // You need to obtain an access token and make a POST request to Facebook's Graph API to share the review
}

// orderController.js
const nodemailer = require('nodemailer');
const Order = require('../models/Order');

exports.sendOTP = async (req, res) => {
  const { userId } = req.params;

  try {
    // Generate OTP
    const otp = generateOTP();

    // Save OTP to the user's order
    const order = new Order({ userId, otp });
    await order.save();

    // Send OTP through email
    const userEmail = 'amruta@gmail.com'; // Get user's email from database
    await sendEmail(userEmail, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

function generateOTP() {
  // Implement OTP generation logic here
  return '123456'; // Dummy OTP for demonstration
}

async function sendEmail(userEmail, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your_email@gmail.com',
      pass: 'your_password'
    }
  });

  const mailOptions = {
    from: 'your_email@gmail.com',
    to: userEmail,
    subject: 'Order OTP Verification',
    text: `Your OTP for order verification is: ${otp}`
  };

  await transporter.sendMail(mailOptions);
}
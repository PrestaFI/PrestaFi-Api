const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Authentication Middleware (JWT)
const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token'); // You might need to adjust the header name
  
    // Check if not token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
  
    try {
      const decoded = jwt.verify(token,
   process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid'});
    }
  };

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      address, 
      city, 
      state, 
      phoneNumber 
    } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      firstName, lastName, email, password, address, city, state, phoneNumber
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



//Send money
router.post('/send-money', authMiddleware, async (req, res) => {
  try {
    const { recipientWalletAddress, amount } = req.body;
    const sender = req.user.id;
    const feePercentage = 0.04; 

    const transaction = new Transaction({
      sender,
      recipientWalletAddress,
      amount,
    });
    // Calculate and create installments
    const totalWithFee = amount * (1 + feePercentage);
    const installmentAmount = totalWithFee / 4;
    for (let i = 0; i < 4; i++) {
      transaction.installments.push({
        dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000), 
        amount: installmentAmount,
      });
    }
    await transaction.save();
    res.json({ message: 'Transaction successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Pay Credit (Monthly Installment)
router.post('/pay-credit/:transactionId', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    // Find the next unpaid installment
    const unpaidInstallment = transaction.installments.find(
      (installment) => !installment.paid
    );
    if (!unpaidInstallment) {
      return res.status(400).json({ msg: 'All installments are paid' });
    }

    unpaidInstallment.paid = true; 
    await transaction.save();

    res.json({ message: 'Installment paid successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get Payment History
router.get('/payment-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; 
    const transactions = await Transaction.find({ sender: userId }).populate('sender');
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;


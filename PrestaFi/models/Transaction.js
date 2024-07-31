const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientWalletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  installments: [
    {
      dueDate: Date,
      amount: Number,
      paid: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model('Transaction', transactionSchema);

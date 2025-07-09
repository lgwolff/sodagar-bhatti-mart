const mongoose = require('mongoose');

const paymentProofSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.PaymentProof || mongoose.model('PaymentProof', paymentProofSchema);



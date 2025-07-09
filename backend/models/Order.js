const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: String,
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  paid: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['cod', 'paypal', 'bank'], default: 'cod' },
  shippingInfo: {
    name: String,
    phone: String,
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled', 'pending_payment'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);


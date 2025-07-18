const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ✅ Get cart
router.get('/', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const cart = await Cart.findOne({ userEmail: email }).populate('items.productId');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Add to cart
router.post('/add', async (req, res) => {
  const { email, productId, quantity } = req.body;
  if (!email || !productId) return res.status(400).json({ message: 'Missing data' });

  try {
    let cart = await Cart.findOne({ userEmail: email });
    if (!cart) {
      cart = new Cart({ userEmail: email, items: [{ productId, quantity }] });
    } else {
      const existing = cart.items.find(item => item.productId.toString() === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("❌ Failed to add to cart:", err);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

module.exports = router;

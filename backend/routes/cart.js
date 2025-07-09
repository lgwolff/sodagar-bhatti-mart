// Clean and fixed: routes/cart.js
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

// ✅ Remove item from cart
router.post('/remove', async (req, res) => {
  const { email, productId } = req.body;
  if (!email || !productId) return res.status(400).json({ message: "Missing data" });

  try {
    const cart = await Cart.findOne({ userEmail: email });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();
    res.json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// ✅ Update quantity (increase/decrease)
router.post('/update', async (req, res) => {
  const { email, productId, action } = req.body;
  if (!email || !productId || !['increase', 'decrease'].includes(action)) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const cart = await Cart.findOne({ userEmail: email });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (action === "increase") item.quantity += 1;
    if (action === "decrease" && item.quantity > 1) item.quantity -= 1;

    await cart.save();
    res.json({ message: "Quantity updated", cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quantity' });
  }
});
// ✅ Checkout route
// ✅ Checkout (place order)
router.post('/checkout', async (req, res) => {
  const { email, name, phone, address, paymentMethod } = req.body;

  if (!email || !name || !phone || !address || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const cart = await Cart.findOne({ userEmail: email }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let total = 0;
    const items = cart.items.map(item => {
      total += item.quantity * item.productId.price;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
      };
    });

    const paid = paymentMethod === 'cod'; // Only mark paid if COD

    const newOrder = new Order({
      userEmail: email,
      items,
      total,
      status: paid ? 'pending' : 'pending_payment',
      paid,
      shippingInfo: { name, phone, address },
      paymentMethod
    });

    await newOrder.save();

    // Clear user's cart
    await Cart.deleteOne({ userEmail: email });

    res.status(200).json({ message: 'Order placed successfully', orderId: newOrder._id });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ message: 'Checkout failed' });
  }
});


module.exports = router;


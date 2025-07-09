// Clean and fixed: routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Ensure this model exists

// ✅ GET /api/orders?status=pending|shipped|delivered
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
    const query = status ? { status } : {}; // All if no filter
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET payment overview summary
router.get('/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paid: true });
    const orders = await Order.find({ paid: true });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    res.json({ totalOrders, paidOrders, totalRevenue });
  } catch (err) {
    console.error("❌ Summary error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ GET orders by user email
router.get('/user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const orders = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ["pending", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ Status update failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


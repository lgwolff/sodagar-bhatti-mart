const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require('../models/Order');


// 🧾 Get all pending sellers
router.get("/sellers/pending", async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller", sellerApproved: false });
    res.json(sellers);
  } catch (err) {
    console.error("❌ Error fetching sellers:", err);
    res.status(500).json({ message: "Failed to fetch sellers." });
  }
});

// 🧾 Monthly Report
router.get('/report/monthly', async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1); // 1st day of the month
    start.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      status: 'delivered',
      createdAt: { $gte: start }
    });

    const report = calculateReport(orders);
    res.json({ period: 'monthly', ...report });

  } catch (err) {
    res.status(500).json({ message: 'Failed to generate monthly report' });
  }
});

// 📊 Yearly Report
router.get('/report/yearly', async (req, res) => {
  try {
    const start = new Date(new Date().getFullYear(), 0, 1);

    const orders = await Order.find({
      status: 'delivered',
      createdAt: { $gte: start }
    });

    const report = calculateReport(orders);
    res.json({ period: 'yearly', ...report });

  } catch (err) {
    res.status(500).json({ message: 'Failed to generate yearly report' });
  }
});

// 📌 Helper
function calculateReport(orders) {
  let totalRevenue = 0;
  let totalOrders = orders.length;
  let totalProductsSold = 0;

  orders.forEach(order => {
    totalRevenue += order.totalAmount || 0;
    order.items?.forEach(item => {
      totalProductsSold += item.quantity || 0;
    });
  });

  return {
    totalRevenue,
    totalOrders,
    totalProductsSold
  };
}

// ✅ Approve seller
router.patch("/sellers/:id/approve", async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(req.params.id, { sellerApproved: true }, { new: true });
    if (!seller) return res.status(404).json({ message: "Seller not found." });
    res.json({ success: true, seller });
  } catch (err) {
    console.error("❌ Error approving seller:", err);
    res.status(500).json({ message: "Failed to approve seller." });
  }
});

// 📦 Get pending products
router.get("/products/pending", async (req, res) => {
  try {
    const products = await Product.find({ status: "pending" });
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products." });
  }
});

// ✅ Approve product
router.patch("/products/:id/approve", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error approving product:", err);
    res.status(500).json({ message: "Failed to approve product." });
  }
});
// 🔢 Monthly income (this year)
router.get('/income/monthly', async (req, res) => {
  try {
    const start = new Date(new Date().getFullYear(), 0, 1); // Jan 1
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: start }, status: "delivered" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(income); // [{ _id: 1, total: 12345 }, ...]
  } catch (err) {
    console.error("Monthly income error:", err);
    res.status(500).json({ message: "Failed to get monthly income" });
  }
});

// 📆 Yearly income (last 5 years)
router.get('/income/yearly', async (req, res) => {
  try {
    const income = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: { $year: "$createdAt" },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    res.json(income); // [{ _id: 2025, total: 9999 }, ...]
  } catch (err) {
    console.error("Yearly income error:", err);
    res.status(500).json({ message: "Failed to get yearly income" });
  }
});
router.post('/update-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Replace with your secure password storage logic
    const ADMIN_EMAIL = "help@sodagarbhatti.infy.uk";
    const ADMIN_PASS_FILE = path.join(__dirname, "../admin-password.txt");

    fs.writeFileSync(ADMIN_PASS_FILE, password, "utf8");

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Failed to update password." });
  }
});


module.exports = router;


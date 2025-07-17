// auth.js (Fixed & Clean)
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🚀 Customer Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password });
    await user.save();

    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ✅ Customer Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ user: userData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// 🔐 Admin Login
router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  const ADMIN_EMAIL = "help@sodagarbhatti.infy.uk";
  const ADMIN_PASSWORD = "A9211420a@";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  return res.status(200).json({
    user: {
      name: "Admin",
      email: ADMIN_EMAIL,
      role: "admin"
    }
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');


// 🚀 Customer Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password }); // Defaults to role: customer
    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// 🔐 Admin Login
router.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  const ADMIN_EMAIL = "help@sodagarbhatti.infy.uk";
  const ADMIN_PASSWORD = "A9211420a@"; // change this!

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


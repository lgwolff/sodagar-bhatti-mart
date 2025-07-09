const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

// POST /api/support
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const supportMessage = new SupportMessage({ name, email, message });
    await supportMessage.save();
    res.status(201).json({ message: 'Message received successfully.' });
  } catch (err) {
    console.error("Support message error:", err);
    res.status(500).json({ message: 'Error saving message.' });
  }
});

module.exports = router;


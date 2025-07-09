const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const PaymentProof = require('../models/PaymentProof');
const path = require('path');

// 🔽 Upload payment proof
router.post('/upload-proof', upload.single('proof'), async (req, res) => {
  const { email, orderId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const proof = new PaymentProof({
      userEmail: email,
      orderId,
      filePath: `uploads/${file.filename}`
    });

    await proof.save();
    res.json({ message: "Proof uploaded", proof });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ message: "Failed to upload proof" });
  }
});

module.exports = router;


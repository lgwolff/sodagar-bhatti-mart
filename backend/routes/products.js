const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// ✅ Admin: Get all products
router.get('/admin/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔍 Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Public: Get visible products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true, status: 'active' });
    console.log("📦 Public products:", products.length);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Upload product
router.post('/add', upload.array('images', 7), async (req, res) => {
  try {
    const images = req.files.map(file => path.join('uploads', file.filename));

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      weight: req.body.weight,
      dimensions: {
        length: req.body.length,
        width: req.body.width,
        height: req.body.height,
      },
      images,
      active: true,
      status: 'active',
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to upload product' });
  }
});

// ✅ Update product by ID (with optional image replacement)
router.put('/:id', upload.array('images', 7), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Handle existing and new images
    const existingImages = JSON.parse(req.body.existingImages || '[]');
    const newUploadedImages = req.files.map(file => path.join('uploads', file.filename));
    const finalImages = [...existingImages, ...newUploadedImages];

    // Remove deleted images from disk
    const removedImages = product.images.filter(img => !existingImages.includes(img));
    removedImages.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      fs.unlink(filePath, err => {
        if (err) console.warn('❌ Failed to delete image:', err.message);
      });
    });

    // Update fields
    product.name = req.body.name;
    product.description = req.body.description;
    product.category = req.body.category;
    product.price = req.body.price;
    product.stock = req.body.stock;
    product.weight = req.body.weight;
    product.dimensions = {
      length: req.body.length,
      width: req.body.width,
      height: req.body.height
    };
    product.images = finalImages;

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error('❌ Update failed:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// ✅ Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete image files
    if (product.images && product.images.length > 0) {
      product.images.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        fs.unlink(filePath, err => {
          if (err) console.error('Image delete failed:', err.message);
        });
      });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Toggle active/inactive
router.patch('/:id/status', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.active = !product.active;
    product.status = product.active ? 'active' : 'inactive';
    await product.save();

    res.json({ message: 'Product status updated', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add this route at the bottom of routes/products.js
router.get('/categories', (req, res) => {
  res.json(['electronics', 'clothing', 'beauty', 'home', 'other']);
});

module.exports = router;

module.exports = router;


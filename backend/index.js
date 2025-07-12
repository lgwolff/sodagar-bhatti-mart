// backend/index.js

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3000;
const productRoutes = require('./routes/products');

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/support', require('./routes/support'));
app.use('/api/products', require('./routes/products'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/admin", require("./routes/admin"));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', productRoutes);


// ✅ API Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');
const PaymentProof = require('./models/PaymentProof');
const paymentRoutes = require('./routes/payments');


app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/support', require('./routes/support'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/payments', paymentRoutes);

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Fallback route for HTML pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


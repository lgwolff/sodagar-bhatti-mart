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
function setupProceedToCheckout() {
  const checkoutBtn = document.getElementById("proceedToCheckoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) {
        alert("Please log in to proceed to checkout.");
        window.location.href = "login.html";
      } else {
        window.location.href = "payment.html";
      }
    });
  }
}
function renderCart(cartItems) {
  const cartContainer = document.getElementById("cartContainer");
  const subtotalEl = document.getElementById("subtotal");
  const cartSummary = document.getElementById("cartSummary");
  
  if (!cartItems.length) {
    cartContainer.innerHTML = "<p>🛒 Your cart is empty.</p>";
    cartSummary.classList.add("hidden");
    return;
  }

  let total = 0;
  cartContainer.innerHTML = "";

  cartItems.forEach(item => {
    const product = item.productId;
    const quantity = item.quantity;
    const itemTotal = quantity * product.price;
    total += itemTotal;

    const row = document.createElement("div");
    row.className = "flex items-center gap-4 border-b pb-4";
    row.innerHTML = `
      <img src="/${product.images?.[0] || 'fallback.jpg'}" class="w-16 h-16 object-cover rounded" />
      <div class="flex-1">
        <p class="font-semibold">${product.name}</p>
        <p class="text-sm text-gray-500">Rs. ${product.price} × ${quantity} = Rs. ${itemTotal}</p>
      </div>
    `;

    cartContainer.appendChild(row);
  });

  subtotalEl.textContent = total;
  cartSummary.classList.remove("hidden");

  setupProceedToCheckout(); // <-- add this
}

module.exports = router;

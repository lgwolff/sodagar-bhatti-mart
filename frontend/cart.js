document.addEventListener("DOMContentLoaded", loadCart);

async function loadCart() {
  const user = JSON.parse(localStorage.getItem("user"));
  let cartItems = [];

  if (user?.email) {
    const res = await fetch(`/api/cart?email=${user.email}`);
    const data = await res.json();
    cartItems = data.items || [];
  } else {
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    for (const item of guestCart) {
      const res = await fetch(`/api/products/${item.productId}`);
      const product = await res.json();
      cartItems.push({ productId: product, quantity: item.quantity });
    }
  }

  renderCart(cartItems);
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
}

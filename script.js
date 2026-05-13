// ===================================================
//  URBAN KICKS — script.js
//  Full rewrite: cart, checkout, filters, pagination
// ===================================================

const PRODUCTS_PER_PAGE = 14;
let currentPage = 1;
let selectedGender = "all";
let selectedCategory = "all";
let cart = [];
let searchQuery = "";

// ── DOM refs ─────────────────────────────────────
const container             = document.getElementById("product-container");
const categoryBtnsContainer = document.getElementById("category-buttons-container");
const searchInput           = document.getElementById("product-search");
const searchBtn             = document.getElementById("search-btn");
const cartModal             = document.getElementById("cart-modal");
const cartItemsEl           = document.getElementById("cart-items");
const cartTotalEl           = document.getElementById("cart-total");
const closeCartBtn          = document.getElementById("close-cart");
const checkoutBtn           = document.getElementById("checkout-whatsapp");
const cartBtn               = document.getElementById("cart-button");
const cartCountEl           = document.getElementById("cart-count");

// ── Lightbox ──────────────────────────────────────
const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = `<span class="close-lightbox">x</span><img class="lightbox-img">`;
document.body.appendChild(lightbox);
const lightboxImg      = lightbox.querySelector(".lightbox-img");
const closeLightboxBtn = lightbox.querySelector(".close-lightbox");
closeLightboxBtn.onclick = () => lightbox.style.display = "none";
lightbox.onclick = e => { if (e.target === lightbox) lightbox.style.display = "none"; };

// ── Cart open / close ─────────────────────────────
if (cartBtn) {
  cartBtn.addEventListener("click", () => cartModal.classList.remove("cart-hidden"));
}
if (closeCartBtn) {
  closeCartBtn.addEventListener("click", () => cartModal.classList.add("cart-hidden"));
}
if (cartModal) {
  cartModal.addEventListener("click", e => {
    if (e.target === cartModal) cartModal.classList.add("cart-hidden");
  });
}

// ── Hide category buttons initially ───────────────
categoryBtnsContainer.style.display = "none";

// ── Initial load ──────────────────────────────────
container.innerHTML = `<div style="text-align:center;padding:60px;color:#888;font-size:16px;"><p>Loading products...</p></div>`;
loadProductsFromAPI();

// ── Gender filter ─────────────────────────────────
function selectGender(gender) {
  selectedGender = gender;
  selectedCategory = "all";
  currentPage = 1;
  renderCategoryButtons();
  renderProducts();
}

// ── Category buttons ──────────────────────────────
function renderCategoryButtons() {
  categoryBtnsContainer.style.display = "block";
  categoryBtnsContainer.innerHTML = "";

  const visible = selectedGender === "all"
    ? products
    : products.filter(p => p.gender.toLowerCase() === selectedGender.toLowerCase());

  const cats = ["all", ...new Set(visible.map(p => p.category))];

  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.className = cat === selectedCategory ? "active" : "";
    btn.onclick = () => {
      selectedCategory = cat;
      currentPage = 1;
      renderCategoryButtons();
      renderProducts();
    };
    categoryBtnsContainer.appendChild(btn);
  });
}

// ── Search ────────────────────────────────────────
function filterProducts() {
  currentPage = 1;
  searchQuery = searchInput.value.toLowerCase();
  renderProducts();
}
searchInput.addEventListener("input", filterProducts);
searchBtn.addEventListener("click", filterProducts);

// ── Render products ───────────────────────────────
function renderProducts() {
  container.innerHTML = "";

  let list = [...products];

  if (searchQuery) {
    list = list.filter(p => p.name.toLowerCase().includes(searchQuery));
  }
  if (selectedGender !== "all") {
    list = list.filter(p => p.gender.toLowerCase() === selectedGender.toLowerCase());
  }
  if (selectedCategory !== "all") {
    list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }

  list.sort((a, b) => (a.new && !b.new ? -1 : !a.new && b.new ? 1 : 0));

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:#888;"><p>No products found.</p></div>`;
    renderPagination(0);
    return;
  }

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = list.slice(start, start + PRODUCTS_PER_PAGE);

  pageProducts.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    if (product.discount) {
      const badge = document.createElement("span");
      badge.className = "discount-badge";
      badge.textContent = product.discount + "% OFF";
      card.appendChild(badge);
    }
    if (product.new) {
      const badge = document.createElement("span");
      badge.className = "new-badge";
      badge.textContent = "NEW";
      card.appendChild(badge);
    }

    const img = document.createElement("img");
    img.src = product.image || "images/placeholder.jpg";
    img.alt = product.name;
    img.loading = "lazy";
    img.onerror = () => { img.src = "images/placeholder.jpg"; };
    img.onclick = () => {
      lightboxImg.src = img.src;
      lightbox.style.display = "flex";
    };

    const name = document.createElement("h2");
    name.textContent = product.name;

    const priceEl = document.createElement("p");
    const rawPrice = product.rawPrice
      || parseFloat(String(product.price || "0").replace(/[^0-9.]/g, ""))
      || 0;

    if (rawPrice > 0) {
      if (product.discount) {
        const discounted = Math.round(rawPrice * (100 - product.discount) / 100);
        priceEl.innerHTML =
          "<span class='original-price'>KSh " + rawPrice.toLocaleString() + "</span> " +
          "<span class='discounted-price'>KSh " + discounted.toLocaleString() + "</span>";
      } else {
        priceEl.textContent = "KSh " + rawPrice.toLocaleString();
      }
    } else {
      priceEl.textContent = "Price unavailable";
    }

    const sizeSelect = document.createElement("select");
    (product.sizes || []).forEach(size => {
      const opt = document.createElement("option");
      opt.value = size;
      opt.textContent = size;
      sizeSelect.appendChild(opt);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add to Cart";
    addBtn.className = "order-btn";
    addBtn.onclick = () => {
      const finalPrice = product.discount
        ? Math.round(rawPrice * (100 - product.discount) / 100)
        : rawPrice;
      addToCart(product, sizeSelect.value, finalPrice);
      addBtn.textContent = "Added!";
      addBtn.style.background = "#27ae60";
      setTimeout(() => {
        addBtn.textContent = "Add to Cart";
        addBtn.style.background = "";
      }, 1500);
    };

    card.append(img, name, priceEl, sizeSelect, addBtn);
    container.appendChild(card);

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 50 + index * 60);
  });

  renderPagination(list.length);
}

// ── Pagination ────────────────────────────────────
function renderPagination(total) {
  let pag = document.getElementById("pagination");
  if (!pag) {
    pag = document.createElement("div");
    pag.id = "pagination";
    container.after(pag);
  }
  pag.innerHTML = "";

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "<";
  prev.disabled = currentPage === 1;
  prev.onclick = () => { currentPage--; renderProducts(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  pag.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = (function(page) {
      return function() { currentPage = page; renderProducts(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    })(i);
    pag.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = ">";
  next.disabled = currentPage === totalPages;
  next.onclick = () => { currentPage++; renderProducts(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  pag.appendChild(next);
}

// ── Cart functions ────────────────────────────────
function addToCart(product, size, price) {
  const existing = cart.find(i => i.productName === product.name && i.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      productId:   product.id || "unknown",
      productName: product.name,
      image:       product.image || "",
      size:        size,
      price:       price,
      qty:         1
    });
  }
  updateCartUI();
  if (cartBtn) {
    cartBtn.style.transform = "scale(1.2)";
    setTimeout(() => cartBtn.style.transform = "", 300);
  }
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCartUI();
}

function updateCartUI() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p style='text-align:center;color:#888;padding:20px;'>Your cart is empty</p>";
    cartTotalEl.textContent = "0";
    if (cartCountEl) cartCountEl.textContent = "0";
    return;
  }

  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #eee;gap:10px;";
    div.innerHTML =
      "<div>" +
        "<strong>" + item.productName + "</strong><br>" +
        "<small>Size: " + item.size + " &nbsp;|&nbsp; Qty: " + item.qty + "</small>" +
      "</div>" +
      "<div style='display:flex;align-items:center;gap:10px;'>" +
        "<span>KSh " + (item.price * item.qty).toLocaleString() + "</span>" +
        "<button onclick='removeFromCart(" + idx + ")' style='background:none;border:1px solid #ff4444;color:#ff4444;cursor:pointer;border-radius:50%;width:24px;height:24px;font-size:14px;padding:0;'>x</button>" +
      "</div>";
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = total.toLocaleString();
  if (cartCountEl) {
    cartCountEl.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
  }
}

// ── WhatsApp Checkout ─────────────────────────────
checkoutBtn.addEventListener("click", function() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some products first.");
    return;
  }

  var message = "Hello Derick's Urban Kicks! I'd like to order:\n\n";
  var total = 0;

  cart.forEach(function(item, i) {
    total += item.price * item.qty;
    message += (i + 1) + ". " + item.productName + "\n";
    message += "   Size: " + item.size + " | Qty: " + item.qty + " | KSh " + (item.price * item.qty).toLocaleString() + "\n\n";
  });

  message += "Total: KSh " + total.toLocaleString() + "\n\nPlease confirm availability and delivery details. Thank you!";

  // Save order to backend (fire and forget)
  try {
    fetch(API_URL + "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "WhatsApp Customer",
        phone: "via WhatsApp",
        items: cart.map(function(item) {
          return {
            productId: item.productId || "unknown",
            name:      item.productName,
            price:     item.price,
            size:      item.size,
            quantity:  item.qty
          };
        }),
        paymentMethod: "whatsapp",
        notes: cart.map(function(i) { return i.productName + " x" + i.qty + " (size " + i.size + ")"; }).join(", ")
      })
    }).catch(function() {});
  } catch(e) {}

  var waURL = "https://wa.me/254713691804?text=" + encodeURIComponent(message);
  window.open(waURL, "_blank");
});

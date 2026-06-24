"use strict";

const products = [
  { id: 1, title: "QuietWave Wireless Headphones", category: "electronics", price: 2999, originalPrice: 4499, rating: 4.6, reviews: 1842, badge: "32% off", position: "0% 0%", description: "Comfortable over-ear headphones with balanced sound, soft memory-foam cushions and up to 36 hours of listening time." },
  { id: 2, title: "Terra Ceramic Table Lamp", category: "home", price: 1899, originalPrice: 2499, rating: 4.4, reviews: 628, badge: "New", position: "33.333% 0%", description: "A warm terracotta lamp with a linen-look shade, designed to bring a gentle evening glow to bedside tables and reading corners." },
  { id: 3, title: "Sage Everyday Overshirt", category: "fashion", price: 1299, originalPrice: 1999, rating: 4.5, reviews: 934, badge: "Best seller", position: "66.666% 0%", description: "A breathable cotton overshirt with an easy regular fit, garment-washed finish and versatile sage colour." },
  { id: 4, title: "Arc Pro Wireless Mouse", category: "electronics", price: 1499, originalPrice: 2199, rating: 4.7, reviews: 2175, badge: "Top rated", position: "100% 0%", description: "A precise, low-latency wireless mouse with an ergonomic shell, quiet switches and customizable sensitivity." },
  { id: 5, title: "Aura S2 Smart Watch", category: "electronics", price: 3799, originalPrice: 5499, rating: 4.8, reviews: 3104, badge: "Prime pick", position: "0% 100%", description: "A refined everyday smart watch with health tracking, message alerts, workout modes and a bright all-day display." },
  { id: 6, title: "Courtline Everyday Sneakers", category: "fashion", price: 2299, originalPrice: 3299, rating: 4.5, reviews: 1260, badge: "30% off", position: "33.333% 100%", description: "Clean low-top sneakers made with cushioned insoles and a flexible rubber outsole for comfortable daily wear." },
  { id: 7, title: "Mori Oak Side Table", category: "home", price: 2699, originalPrice: 3499, rating: 4.3, reviews: 421, badge: "Limited deal", position: "66.666% 100%", description: "A compact round side table in a warm oak finish, with solid tapered legs and a softly rounded edge." },
  { id: 8, title: "Daytrip Canvas Backpack", category: "fashion", price: 1599, originalPrice: 2299, rating: 4.6, reviews: 879, badge: "Popular", position: "100% 100%", description: "A lightweight canvas backpack with padded straps, a roomy main compartment and quick-access front pocket." }
];

const state = {
  category: "all",
  search: "",
  sort: "featured",
  cart: loadCart(),
  lastFocus: null
};

const elements = {
  productContainer: document.querySelector("#productContainer"),
  emptyResults: document.querySelector("#emptyResults"),
  resultsSummary: document.querySelector("#resultsSummary"),
  filterList: document.querySelector("#filterList"),
  categorySelect: document.querySelector("#categorySelect"),
  searchInput: document.querySelector("#searchInput"),
  searchForm: document.querySelector("#searchForm"),
  sortSelect: document.querySelector("#sortSelect"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  cartButton: document.querySelector("#cartButton"),
  cartDrawer: document.querySelector("#cartDrawer"),
  closeCartButton: document.querySelector("#closeCartButton"),
  pageOverlay: document.querySelector("#pageOverlay"),
  cartCount: document.querySelector("#cartCount"),
  cartItems: document.querySelector("#cartItems"),
  cartTotal: document.querySelector("#cartTotal"),
  checkoutButton: document.querySelector("#checkoutButton"),
  productDialog: document.querySelector("#productDialog"),
  dialogContent: document.querySelector("#dialogContent"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  mobileMenuButton: document.querySelector("#mobileMenuButton"),
  primaryNav: document.querySelector("#primaryNav"),
  themeButton: document.querySelector("#themeButton"),
  toast: document.querySelector("#toast"),
  floatingTop: document.querySelector("#floatingTop"),
  backToTop: document.querySelector("#backToTop"),
  newsletterForm: document.querySelector("#newsletterForm"),
  locationButton: document.querySelector("#locationButton"),
  locationDialog: document.querySelector("#locationDialog"),
  closeLocationButton: document.querySelector("#closeLocationButton"),
  locationForm: document.querySelector("#locationForm"),
  pinCodeInput: document.querySelector("#pinCodeInput"),
  deliveryLocation: document.querySelector("#deliveryLocation")
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
let toastTimer;

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem("amazonCloneCart"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0).map(item => ({ id: item.id, quantity: Math.min(item.quantity, 10) }));
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("amazonCloneCart", JSON.stringify(state.cart));
}

function productImageMarkup(product, className = "product-image") {
  return `<span class="${className}" role="img" aria-label="${product.title}" style="background-position:${product.position}"></span>`;
}

function stars(rating) {
  const rounded = Math.round(rating);
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
}

function categoryLabel(category) {
  return category === "home" ? "Home & Living" : category.charAt(0).toUpperCase() + category.slice(1);
}

function getVisibleProducts() {
  const query = state.search.trim().toLowerCase();
  const visible = products.filter(product => {
    const matchesCategory = state.category === "all" || product.category === state.category;
    const matchesQuery = !query || `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return visible.sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "rating") return b.rating - a.rating;
    return a.id - b.id;
  });
}

function renderProducts() {
  const visible = getVisibleProducts();
  elements.productContainer.innerHTML = visible.map(product => `
    <article class="product-card">
      <button class="product-image-button" type="button" data-view-product="${product.id}" aria-label="View ${product.title} details">
        <span class="product-badge">${product.badge}</span>
        ${productImageMarkup(product)}
      </button>
      <div class="product-body">
        <p class="product-category">${categoryLabel(product.category)}</p>
        <h3 class="product-title">${product.title}</h3>
        <div class="rating-row" aria-label="${product.rating} out of 5 stars, ${product.reviews} reviews"><span class="stars" aria-hidden="true">${stars(product.rating)}</span><small>${product.rating} (${product.reviews.toLocaleString("en-IN")})</small></div>
        <div class="price-row">
          <div class="price"><strong>${currency.format(product.price)}</strong><del>${currency.format(product.originalPrice)}</del></div>
          <button class="add-button" type="button" data-add-product="${product.id}" aria-label="Add ${product.title} to cart">+</button>
        </div>
      </div>
    </article>`).join("");

  elements.emptyResults.hidden = visible.length > 0;
  elements.productContainer.hidden = visible.length === 0;
  elements.resultsSummary.textContent = `${visible.length} ${visible.length === 1 ? "product" : "products"}`;
}

function setCategory(category, scroll = false) {
  state.category = products.some(product => product.category === category) || category === "all" ? category : "all";
  elements.categorySelect.value = state.category;
  document.querySelectorAll("[data-category]").forEach(button => {
    const active = button.dataset.category === state.category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
  if (scroll) document.querySelector("#products").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function resetFilters() {
  state.search = "";
  state.sort = "featured";
  elements.searchInput.value = "";
  elements.sortSelect.value = "featured";
  setCategory("all");
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  const existing = state.cart.find(item => item.id === productId);
  if (existing) existing.quantity = Math.min(existing.quantity + 1, 10);
  else state.cart.push({ id: productId, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${product.title} added to cart`);
}

function updateQuantity(productId, change) {
  const item = state.cart.find(entry => entry.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) state.cart = state.cart.filter(entry => entry.id !== productId);
  item.quantity = Math.min(item.quantity, 10);
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  const product = products.find(item => item.id === productId);
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
  if (product) showToast(`${product.title} removed`);
}

function renderCart() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => {
    const product = products.find(entry => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  elements.cartCount.textContent = totalItems > 99 ? "99+" : totalItems;
  elements.cartButton.setAttribute("aria-label", `Open shopping cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`);
  elements.cartTotal.textContent = currency.format(totalPrice);
  elements.checkoutButton.disabled = totalItems === 0;

  if (!state.cart.length) {
    elements.cartItems.innerHTML = `<div class="cart-empty"><span aria-hidden="true">🛒</span><h3>Your cart is empty</h3><p>Add something you love. It can live here.</p></div>`;
    return;
  }

  elements.cartItems.innerHTML = state.cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `<article class="cart-item">
      ${productImageMarkup(product, "cart-item-image")}
      <div><h3>${product.title}</h3><span class="cart-item-price">${currency.format(product.price)}</span>
        <div class="quantity-control" aria-label="Quantity for ${product.title}">
          <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease quantity">−</button>
          <span aria-live="polite">${item.quantity}</span>
          <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-button" type="button" data-cart-action="remove" data-product-id="${product.id}" aria-label="Remove ${product.title}">×</button>
    </article>`;
  }).join("");
}

function openCart() {
  closeMobileMenu();
  state.lastFocus = document.activeElement;
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  showOverlay();
  document.body.classList.add("no-scroll");
  window.setTimeout(() => elements.closeCartButton.focus(), 50);
}

function closeCart() {
  if (!elements.cartDrawer.classList.contains("open")) return;
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  hideOverlay();
  document.body.classList.remove("no-scroll");
  state.lastFocus?.focus();
}

function openProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  elements.dialogContent.innerHTML = `<div class="dialog-grid">
    ${productImageMarkup(product, "dialog-product-image")}
    <div class="dialog-info">
      <p class="product-category">${categoryLabel(product.category)}</p><h2 id="dialogTitle">${product.title}</h2>
      <div aria-label="${product.rating} out of 5 stars"><span class="stars" aria-hidden="true">${stars(product.rating)}</span> <small>${product.rating} · ${product.reviews.toLocaleString("en-IN")} ratings</small></div>
      <div class="dialog-price">${currency.format(product.price)}</div><p class="dialog-description">${product.description}</p>
      <div class="dialog-meta"><span>Availability <strong>In stock</strong></span><span>Delivery <b>Usually in 1–2 days</b></span><span>Returns <b>30-day eligible</b></span></div>
      <button class="primary-button dialog-add" type="button" data-dialog-add="${product.id}">Add to cart</button>
    </div></div>`;
  state.lastFocus = document.activeElement;
  elements.productDialog.showModal();
}

function closeProductDialog() {
  elements.productDialog.close();
  state.lastFocus?.focus();
}

function showOverlay() {
  elements.pageOverlay.hidden = false;
  requestAnimationFrame(() => elements.pageOverlay.classList.add("visible"));
}

function hideOverlay() {
  elements.pageOverlay.classList.remove("visible");
  window.setTimeout(() => {
    if (!elements.cartDrawer.classList.contains("open") && !elements.primaryNav.classList.contains("open")) elements.pageOverlay.hidden = true;
  }, 250);
}

function toggleMobileMenu() {
  const opening = !elements.primaryNav.classList.contains("open");
  closeCart();
  elements.primaryNav.classList.toggle("open", opening);
  elements.mobileMenuButton.setAttribute("aria-expanded", String(opening));
  elements.mobileMenuButton.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
  document.body.classList.toggle("no-scroll", opening);
  opening ? showOverlay() : hideOverlay();
}

function closeMobileMenu() {
  if (!elements.primaryNav.classList.contains("open")) return;
  elements.primaryNav.classList.remove("open");
  elements.mobileMenuButton.setAttribute("aria-expanded", "false");
  elements.mobileMenuButton.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("no-scroll");
  hideOverlay();
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function setTheme(theme) {
  const dark = theme === "dark";
  document.body.classList.toggle("dark-theme", dark);
  elements.themeButton.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
  localStorage.setItem("amazonCloneTheme", theme);
}

function initializeTheme() {
  const stored = localStorage.getItem("amazonCloneTheme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(stored || preferred);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

elements.productContainer.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add-product]");
  const viewButton = event.target.closest("[data-view-product]");
  if (addButton) addToCart(Number(addButton.dataset.addProduct));
  if (viewButton) openProduct(Number(viewButton.dataset.viewProduct));
});

elements.filterList.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

elements.searchForm.addEventListener("submit", event => {
  event.preventDefault();
  state.search = elements.searchInput.value;
  setCategory(elements.categorySelect.value);
});
elements.searchInput.addEventListener("input", () => { state.search = elements.searchInput.value; renderProducts(); });
elements.categorySelect.addEventListener("change", () => setCategory(elements.categorySelect.value));
elements.sortSelect.addEventListener("change", () => { state.sort = elements.sortSelect.value; renderProducts(); });
elements.clearFiltersButton.addEventListener("click", resetFilters);

document.addEventListener("click", event => {
  const categoryLink = event.target.closest("[data-category-link]");
  const shopButton = event.target.closest("[data-shop-category]");
  const demoButton = event.target.closest("[data-demo]");
  if (categoryLink) { closeMobileMenu(); setCategory(categoryLink.dataset.categoryLink, true); }
  if (shopButton) setCategory(shopButton.dataset.shopCategory, true);
  if (demoButton) showToast(`${demoButton.dataset.demo} is ready for backend integration`);
});

elements.cartButton.addEventListener("click", openCart);
elements.closeCartButton.addEventListener("click", closeCart);
elements.pageOverlay.addEventListener("click", () => { closeCart(); closeMobileMenu(); });
elements.cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const productId = Number(button.dataset.productId);
  if (button.dataset.cartAction === "increase") updateQuantity(productId, 1);
  if (button.dataset.cartAction === "decrease") updateQuantity(productId, -1);
  if (button.dataset.cartAction === "remove") removeFromCart(productId);
});
elements.checkoutButton.addEventListener("click", () => showToast("Checkout is ready for payment integration"));

elements.closeDialogButton.addEventListener("click", closeProductDialog);
elements.productDialog.addEventListener("click", event => {
  if (event.target === elements.productDialog) closeProductDialog();
  const addButton = event.target.closest("[data-dialog-add]");
  if (addButton) addToCart(Number(addButton.dataset.dialogAdd));
});
elements.productDialog.addEventListener("cancel", event => { event.preventDefault(); closeProductDialog(); });

elements.mobileMenuButton.addEventListener("click", toggleMobileMenu);
elements.themeButton.addEventListener("click", () => setTheme(document.body.classList.contains("dark-theme") ? "light" : "dark"));
elements.backToTop.addEventListener("click", scrollToTop);
elements.floatingTop.addEventListener("click", scrollToTop);
window.addEventListener("scroll", () => elements.floatingTop.classList.toggle("visible", window.scrollY > 600), { passive: true });
window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMobileMenu(); });

elements.newsletterForm.addEventListener("submit", event => {
  event.preventDefault();
  showToast("You're on the list — welcome!");
  elements.newsletterForm.reset();
});

elements.locationButton.addEventListener("click", () => {
  elements.pinCodeInput.value = localStorage.getItem("amazonClonePin") || "";
  elements.locationDialog.showModal();
});
elements.closeLocationButton.addEventListener("click", () => elements.locationDialog.close());
elements.locationForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!elements.locationForm.reportValidity()) return;
  const pin = elements.pinCodeInput.value;
  localStorage.setItem("amazonClonePin", pin);
  elements.deliveryLocation.textContent = `PIN ${pin}`;
  elements.locationDialog.close();
  showToast("Delivery location updated");
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeCart(); closeMobileMenu(); }
  if (event.key === "Tab" && elements.cartDrawer.classList.contains("open")) {
    const focusable = [...elements.cartDrawer.querySelectorAll("button:not(:disabled), [href], input, select")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.querySelector("#currentYear").textContent = new Date().getFullYear();
const savedPin = localStorage.getItem("amazonClonePin");
if (savedPin) elements.deliveryLocation.textContent = `PIN ${savedPin}`;
initializeTheme();
renderProducts();
renderCart();

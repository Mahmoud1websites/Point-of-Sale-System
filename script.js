// ---------- DATA ----------
// Add a real photo by putting a path in `image`, e.g. image: "img/almond.jpg".
// If `image` is empty, the emoji is shown on a coloured tile instead.
const products = [
  { id: 1, name: "Almond Brown Sugar Croissant", desc: "Sweet croissant with topping almonds and brown sugar", price: 12.98, unit: "3 pcs", category: "Croissant", emoji: "🥐", color: "#fde3c8", image: "" },
  { id: 2, name: "Smoke Tenderloin Slice Croissant", desc: "Plain croissant with smoked tenderloin beef and vegetables", price: 10.01, unit: "2 pcs", category: "Croissant", emoji: "🥐", color: "#f9d5b8", image: "" },
  { id: 3, name: "Berry Whipped Cream Croissant", desc: "Sweet croissant with blueberries and strawberries inside", price: 8.92, unit: "3 pcs", category: "Croissant", emoji: "🍓", color: "#fbd6dc", image: "" },
  { id: 4, name: "Sweet Granulated Sugar Croissant", desc: "Croissant dusted with granulated sugar", price: 5.58, unit: "1 pc", category: "Croissant", emoji: "🥐", color: "#e6eef5", image: "" },
  { id: 5, name: "Chocolate Chocochips Croissant", desc: "Croissant filled with chocolate and chocochips", price: 11.03, unit: "2 pcs", category: "Croissant", emoji: "🍫", color: "#e7d8cf", image: "" },
  { id: 6, name: "Basic Croissant La Ta Dhore", desc: "Classic butter croissant", price: 3.2, unit: "1 pc", category: "Croissant", emoji: "🥐", color: "#eceae6", image: "" },
  { id: 7, name: "Signature Maple Box", desc: "Chef's box of three maple glazed pastries", price: 14.5, unit: "box", category: "Signature", emoji: "🎁", color: "#fff0c9", image: "" },
  { id: 8, name: "Belgian Waffle", desc: "Crispy waffle with maple syrup and butter", price: 6.75, unit: "1 pc", category: "Waffle", emoji: "🧇", color: "#fbe7bd", image: "" },
  { id: 9, name: "Strawberry Waffle", desc: "Waffle topped with fresh strawberries and cream", price: 8.25, unit: "1 pc", category: "Waffle", emoji: "🧇", color: "#fcd9de", image: "" },
  { id: 10, name: "Cappuccino", desc: "Espresso with steamed milk foam", price: 3.5, unit: "cup", category: "Coffee", emoji: "☕", color: "#e9dccf", image: "" },
  { id: 11, name: "Iced Latte", desc: "Cold espresso with milk over ice", price: 4.0, unit: "cup", category: "Coffee", emoji: "🧋", color: "#e4ecef", image: "" },
  { id: 12, name: "Vanilla Ice Cream", desc: "Two scoops of vanilla bean ice cream", price: 4.75, unit: "2 scoops", category: "Ice Cream", emoji: "🍨", color: "#fff4d6", image: "" }
];

const categories = [
  { name: "All", icon: "✦" },
  { name: "Signature", icon: "★" },
  { name: "Croissant", icon: "🥐" },
  { name: "Waffle", icon: "🧇" },
  { name: "Coffee", icon: "☕" },
  { name: "Ice Cream", icon: "🍨" }
];

let order = [];            // items: { id, name, price, quantity, emoji, color, image }
let salesHistory = [];
let activeCategory = "All";
let nextCustomId = 1000;
let lastSale = null;

const DISCOUNT_LIMIT = 100;
const DISCOUNT_RATE = 0.1;
const TAX_RATE = 0.06;     // set to 0 if you do not want tax

// ---------- DOM ELEMENTS ----------
const productsEl = document.querySelector("#products");
const categoriesEl = document.querySelector("#categories");
const searchEl = document.querySelector("#search");
const orderListEl = document.querySelector("#order-list");
const emptyMessageEl = document.querySelector("#empty-message");
const receiptOverlayEl = document.querySelector("#receipt-overlay");

// ---------- HELPERS ----------
function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

function findProduct(id) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === id) return products[i];
  }
  return null;
}

function findOrderItem(id) {
  for (let i = 0; i < order.length; i++) {
    if (order[i].id === id) return order[i];
  }
  return null;
}

function calculateSubtotal() {
  let sum = 0;
  for (let i = 0; i < order.length; i++) {
    sum += order[i].price * order[i].quantity;
  }
  return sum;
}

function countItems() {
  let count = 0;
  for (let i = 0; i < order.length; i++) count += order[i].quantity;
  return count;
}

function calculateDiscount(subtotal) {
  if (subtotal > DISCOUNT_LIMIT) return subtotal * DISCOUNT_RATE;
  return 0;
}

// returns an object with every number the screen and receipt need
function calculateTotals() {
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  const tax = (subtotal - discount) * TAX_RATE;
  return { subtotal: subtotal, discount: discount, tax: tax, total: subtotal - discount + tax };
}

function thumbHTML(item) {
  if (item.image !== "") {
    return '<div class="thumb"><img src="' + item.image + '" alt=""></div>';
  }
  return '<div class="thumb" style="background:' + item.color + '">' + item.emoji + "</div>";
}

// ---------- RENDERING ----------
function renderCategories() {
  categoriesEl.innerHTML = "";
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const btn = document.createElement("button");
    btn.className = c.name === activeCategory ? "pill active" : "pill";
    btn.setAttribute("data-cat", c.name);
    btn.textContent = c.icon + " " + c.name;
    categoriesEl.appendChild(btn);
  }
}

function renderProducts() {
  const text = searchEl.value.trim().toLowerCase();
  productsEl.innerHTML = "";
  let shown = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const matchesName = p.name.toLowerCase().includes(text);
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    if (matchesName && matchesCategory) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        thumbHTML(p) +
        '<button class="add-btn" data-add="' + p.id + '" aria-label="Add ' + p.name + ' to order">🛒</button>' +
        '<div class="name">' + p.name + "</div>" +
        '<div class="desc">' + p.desc + "</div>" +
        '<div class="price">' + formatMoney(p.price) + " <small>/ " + p.unit + "</small></div>";
      productsEl.appendChild(card);
      shown++;
    }
  }
  if (shown === 0) {
    productsEl.innerHTML = '<p class="empty">No products match your search.</p>';
  }
}

function renderOrder() {
  orderListEl.innerHTML = "";
  emptyMessageEl.style.display = order.length === 0 ? "block" : "none";

  for (let i = 0; i < order.length; i++) {
    const item = order[i];
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML =
      thumbHTML(item) +
      '<div class="info">' +
        '<div class="iname">' + item.name + "</div>" +
        '<div class="row2">' +
          '<span class="iprice">' + formatMoney(item.price * item.quantity) + "</span>" +
          '<div class="qty">' +
            '<button class="plus" data-inc="' + item.id + '" aria-label="Increase quantity">+</button>' +
            "<span>" + item.quantity + "</span>" +
            '<button data-dec="' + item.id + '" aria-label="Decrease quantity">−</button>' +
          "</div>" +
        "</div>" +
        '<button class="remove" data-remove="' + item.id + '">Remove</button>' +
      "</div>";
    orderListEl.appendChild(li);
  }
  updateTotals();
}

function updateTotals() {
  const t = calculateTotals();
  document.querySelector("#item-count").textContent = countItems();
  document.querySelector("#subtotal").textContent = formatMoney(t.subtotal);
  document.querySelector("#discount").textContent = "-" + formatMoney(t.discount);
  document.querySelector("#tax").textContent = formatMoney(t.tax);
  document.querySelector("#final-total").textContent = formatMoney(t.total);
}

function renderHistory() {
  const list = document.querySelector("#history-list");
  list.innerHTML = "";
  document.querySelector("#history-empty").style.display =
    salesHistory.length === 0 ? "block" : "none";

  for (let i = 0; i < salesHistory.length; i++) {
    const sale = salesHistory[i];
    const li = document.createElement("li");
    li.textContent = "Sale #" + (i + 1) + " - " + sale.date + " - " +
      sale.itemCount + " items - " + formatMoney(sale.total);
    list.appendChild(li);
  }
}

// ---------- ORDER ACTIONS ----------
function addToOrder(product) {
  const existing = findOrderItem(product.id);
  if (existing) {
    existing.quantity++;
  } else {
    order.push({
      id: product.id, name: product.name, price: product.price, quantity: 1,
      emoji: product.emoji, color: product.color, image: product.image
    });
  }
  renderOrder();
}

function removeFromOrder(id) {
  for (let i = 0; i < order.length; i++) {
    if (order[i].id === id) {
      order.splice(i, 1);
      break;
    }
  }
  renderOrder();
}

function changeQuantity(id, change) {
  const item = findOrderItem(id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromOrder(id);
  } else {
    renderOrder();
  }
}

function clearOrder() {
  if (order.length === 0) return;
  if (confirm("Cancel the current order and remove all items?")) {
    order = [];
    renderOrder();
  }
}

function addCustomProduct() {
  const nameInput = document.querySelector("#custom-name");
  const priceInput = document.querySelector("#custom-price");
  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (name === "" || isNaN(price) || price < 0) {
    alert("Enter a name and a valid price for the custom item.");
    return;
  }
  const product = {
    id: nextCustomId, name: name, desc: "Custom item", price: price, unit: "1 pc",
    category: "Custom", emoji: "🛍️", color: "#eeeeee", image: ""
  };
  nextCustomId++;
  products.push(product);
  addToOrder(product);
  renderProducts();
  nameInput.value = "";
  priceInput.value = "";
}

// ---------- SALE / RECEIPT ----------
function completeSale() {
  if (order.length === 0) {
    alert("The order is empty. Add products first.");
    return;
  }
  const t = calculateTotals();
  const date = new Date().toLocaleString();

  let html = "";
  for (let i = 0; i < order.length; i++) {
    const item = order[i];
    html += '<div class="receipt-line"><span>' + item.quantity + " x " + item.name +
      "</span><span>" + formatMoney(item.price * item.quantity) + "</span></div>";
  }

  document.querySelector("#receipt-date").textContent = date;
  document.querySelector("#receipt-items").innerHTML = html;
  document.querySelector("#r-subtotal").textContent = formatMoney(t.subtotal);
  document.querySelector("#r-discount").textContent = "-" + formatMoney(t.discount);
  document.querySelector("#r-tax").textContent = formatMoney(t.tax);
  document.querySelector("#r-total").textContent = formatMoney(t.total);
  document.querySelector("#amount-paid").value = "";
  document.querySelector("#r-change").textContent = formatMoney(0);
  document.querySelector("#paid-error").textContent = "";

  lastSale = { date: date, itemCount: countItems(), total: t.total };
  receiptOverlayEl.classList.remove("hidden");
}

function updateChange() {
  const paid = parseFloat(document.querySelector("#amount-paid").value);
  let change = 0;
  if (!isNaN(paid) && paid >= lastSale.total) change = paid - lastSale.total;
  document.querySelector("#r-change").textContent = formatMoney(change);
}

function startNewOrder() {
  const paid = parseFloat(document.querySelector("#amount-paid").value);
  if (!isNaN(paid) && paid < lastSale.total) {
    document.querySelector("#paid-error").textContent = "Amount paid is less than the total.";
    return;
  }
  salesHistory.push(lastSale);
  order = [];
  receiptOverlayEl.classList.add("hidden");
  renderOrder();
  renderHistory();
}

function togglePanel(id) {
  document.querySelector(id).classList.toggle("hidden");
}

function updateClock() {
  document.querySelector("#clock").textContent = new Date().toLocaleString();
}

// ---------- EVENTS ----------
productsEl.addEventListener("click", function (event) {
  const btn = event.target.closest("[data-add]");
  if (btn) addToOrder(findProduct(Number(btn.getAttribute("data-add"))));
});

categoriesEl.addEventListener("click", function (event) {
  const btn = event.target.closest("[data-cat]");
  if (btn) {
    activeCategory = btn.getAttribute("data-cat");
    renderCategories();
    renderProducts();
  }
});

orderListEl.addEventListener("click", function (event) {
  const inc = event.target.getAttribute("data-inc");
  const dec = event.target.getAttribute("data-dec");
  const rem = event.target.getAttribute("data-remove");
  if (inc !== null) changeQuantity(Number(inc), 1);
  if (dec !== null) changeQuantity(Number(dec), -1);
  if (rem !== null) removeFromOrder(Number(rem));
});

searchEl.addEventListener("input", renderProducts);
document.querySelector("#reset-filters").addEventListener("click", function () {
  searchEl.value = "";
  activeCategory = "All";
  renderCategories();
  renderProducts();
});
document.querySelector("#clear-btn").addEventListener("click", clearOrder);
document.querySelector("#pay-btn").addEventListener("click", completeSale);
document.querySelector("#add-custom").addEventListener("click", addCustomProduct);
document.querySelector("#custom-btn").addEventListener("click", function () { togglePanel("#custom-box"); });
document.querySelector("#history-btn").addEventListener("click", function () { togglePanel("#history-box"); });
document.querySelector("#amount-paid").addEventListener("input", updateChange);
document.querySelector("#new-order-btn").addEventListener("click", startNewOrder);

// ---------- START ----------
document.querySelector("#tax-rate").textContent = (TAX_RATE * 100) + "%";
renderCategories();
renderProducts();
renderOrder();
renderHistory();
updateClock();
setInterval(updateClock, 1000);
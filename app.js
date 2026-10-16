/* Embrava · shared: helpers, basket and home page.
   Catalogue data lives in data.js. */

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const money = (n) => `${CURRENCY}${Number.isInteger(n) ? n : n.toFixed(2)}`;
const img = (file) => `assets/img/${file.includes(".") ? file : file + ".jpg"}`;
const waveSvg = (cls = "") => `<svg class="${cls}" viewBox="0 0 164 164" aria-hidden="true"><use href="#symbol"/></svg>`;
const firstColor = (p) => p.default || Object.keys(p.variants)[0];
const productUrl = (id, colour) => `product.html?p=${id}${colour ? `&colour=${colour}` : ""}`;
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);
const addProduct = (p, c, qty = 1) => addToCart({ key: `${p.id}-${c}`, name: p.name, meta: COLORS[c].label, price: p.price, img: img(p.variants[c]) }, qty);
const addKit = (k) => addToCart({ key: k.id, name: k.name, meta: k.items.join(" · "), price: k.price, img: img(k.img) });

const store = {
  get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* no storage */ } },
};

let toastTimer;
function toast(msg) {
  const t = $("[data-toast]");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2200);
}

/* ---------- cart ---------- */
let cart = store.get("embrava-cart", []);

function addToCart(item, qty = 1) {
  const found = cart.find((l) => l.key === item.key);
  if (found) found.qty += qty;
  else cart.push({ ...item, qty });
  saveCart();
  const btn = $(".cart-btn");
  btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  toast(`${item.name} added to your basket`);
}

function saveCart() {
  store.set("embrava-cart", cart);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, l) => s + l.qty, 0);
  const total = cart.reduce((s, l) => s + l.qty * l.price, 0);
  $("[data-cart-count]").textContent = count;
  $("[data-cart-total]").textContent = money(total);
  $("[data-checkout]").disabled = count === 0;

  const left = FREE_SHIPPING - total;
  const pct = Math.min(100, (total / FREE_SHIPPING) * 100);
  $("[data-ship]").innerHTML =
    (left > 0 ? `You're <strong>${money(left)}</strong> away from free delivery` : `<strong>You've got free delivery</strong>`) +
    `<div class="cart__ship-bar"><span style="width:${pct}%"></span></div>`;

  const list = $("[data-cart-items]");
  if (!cart.length) {
    list.innerHTML = `<li class="cart__empty">${waveSvg()}Your basket is empty.<br>Start with a kit.</li>`;
    return;
  }
  list.innerHTML = cart.map((l, i) => `
    <li class="line">
      <img src="${l.img}" alt="">
      <div>
        <div class="line__name">${l.name}</div>
        ${l.meta ? `<div class="line__meta">${l.meta}</div>` : ""}
        <div class="qty">
          <button type="button" data-qty="${i}" data-d="-1" aria-label="Remove one">−</button>
          <span>${l.qty}</span>
          <button type="button" data-qty="${i}" data-d="1" aria-label="Add one">+</button>
        </div>
      </div>
      <div>
        <div class="line__price">${money(l.qty * l.price)}</div>
        <button type="button" class="line__remove" data-remove="${i}">Remove</button>
      </div>
    </li>`).join("");
}

function openCart(open) {
  const c = $("[data-cart]"), o = $("[data-overlay]");
  c.classList.toggle("is-open", open);
  c.setAttribute("aria-hidden", String(!open));
  o.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  if (open) $("[data-close-cart]").focus();
}

/* ---------- kits ---------- */
function renderKits() {
  $("[data-kits]").innerHTML = KITS.map((k) => {
    const pieces = k.products.map((id) => PRODUCTS.find((p) => p.id === id));
    return `
    <article class="kit">
      <div class="kit__media">
        <img src="${img(k.img)}" alt="${k.name}: ${k.items.join(", ")}" loading="lazy">
        <span class="card__tag">Save ${Math.round((1 - k.price / k.full) * 100)}%</span>
        ${k.items.map((name, i) => `<span class="kit__pin kit__pin--${i}" aria-hidden="true">${name}</span>`).join("")}
      </div>
      <div class="kit__body">
        <p class="kit__for">${k.for}</p>
        <h3>${k.name}</h3>
        <ul class="kit__list">
          ${pieces.map((p, i) => `<li><span>${k.items[i]}</span><span>${money(p.price)}</span></li>`).join("")}
        </ul>
        <p class="kit__items">${k.items.join(" · ")}</p>
        <div class="kit__total">
          <span><s>${money(k.full)}</s><strong>${money(k.price)}</strong></span>
          <span class="kit__save">You save ${money(Math.round((k.full - k.price) * 100) / 100)}</span>
        </div>
        <button class="btn btn--dark" type="button" data-add-kit="${k.id}">Add kit</button>
      </div>
    </article>`;
  }).join("");
}

/* ---------- catalogue ---------- */
let activeCat = "all";
let gridExpanded = false; // phones show the first four pieces until "View all"
const selected = Object.fromEntries(PRODUCTS.map((p) => [p.id, firstColor(p)]));

function renderFilters() {
  $("[data-filters]").innerHTML = CATEGORIES.map((c) =>
    `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${c.id === activeCat}">${c.label}</button>`).join("");
}

function swatchesHtml(p, attr) {
  const colors = Object.keys(p.variants);
  return `<div class="swatches" role="radiogroup" aria-label="${p.name} colour">${colors.map((c) =>
    `<button type="button" class="swatch" role="radio" style="--c:${COLORS[c].hex}" ${attr}="${p.id}" data-color="${c}"
      aria-checked="${selected[p.id] === c}" aria-label="${COLORS[c].label}" title="${COLORS[c].label}"></button>`).join("")}</div>`;
}

function renderGrid() {
  const items = PRODUCTS.filter((p) => activeCat === "all" || p.cat === activeCat);
  const more = $("[data-grid-more]");
  $("[data-grid]").classList.toggle("is-collapsed", !gridExpanded);
  more.hidden = gridExpanded || items.length <= 4;
  more.textContent = `View all ${items.length} pieces`;
  $("[data-grid]").innerHTML = items.map((p) => {
    const c = selected[p.id];
    return `
    <article class="card" data-card="${p.id}">
      <a class="card__media" href="${productUrl(p.id, c)}" data-product-link>
        <img src="${img(p.variants[c])}" alt="${p.name} in ${COLORS[c].label}" loading="lazy">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
      </a>
      <div class="card__body">
        <div class="card__top"><h3><a href="${productUrl(p.id, c)}" data-product-link>${p.name}</a></h3><span class="card__price">${money(p.price)}</span></div>
        <span class="card__color" data-color-label>${COLORS[c].label}${Object.keys(p.variants).length > 1 ? ` · ${Object.keys(p.variants).length} colours` : ""}</span>
        <div class="card__foot">
          ${Object.keys(p.variants).length > 1 ? swatchesHtml(p, "data-swatch") : ""}
          <button class="add-btn" type="button" data-add="${p.id}">Add +</button>
        </div>
      </div>
    </article>`;
  }).join("");
}

function setColor(id, color) {
  selected[id] = color;
  const p = PRODUCTS.find((x) => x.id === id);
  const card = $(`[data-card="${id}"]`);
  if (!card) return;
  const image = $(".card__media img", card);
  image.classList.add("is-fading");
  setTimeout(() => {
    image.src = img(p.variants[color]);
    image.alt = `${p.name} in ${COLORS[color].label}`;
    image.onload = () => image.classList.remove("is-fading");
  }, 150);
  card.querySelectorAll("[data-product-link]").forEach((a) => { a.href = productUrl(id, color); });
  card.querySelectorAll("[data-swatch]").forEach((s) => s.setAttribute("aria-checked", String(s.dataset.color === color)));
  $("[data-color-label]", card).textContent =
    `${COLORS[color].label}${Object.keys(p.variants).length > 1 ? ` · ${Object.keys(p.variants).length} colours` : ""}`;
}

/* ---------- builder ---------- */
const picks = new Map(); // id -> color
let lastPicked = null; // animates only the piece just added to the tray

function renderBuilder() {
  // Keep keyboard focus after re-rendering (a removed slot hands it to that piece in the list)
  const el = document.activeElement;
  const refocus = el?.closest("[data-builder], [data-builder-slots]") && Object.entries(el.dataset).map(([k, v]) => `[data-${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}="${v}"]`).join("");

  $("[data-builder]").innerHTML = PRODUCTS.map((p) => {
    const on = picks.has(p.id);
    const c = picks.get(p.id) || firstColor(p);
    return `
    <li class="pick${on ? " is-on" : ""}">
      <button type="button" class="pick__main" data-pick="${p.id}" aria-pressed="${on}">
        <img src="${img(p.variants[c])}" alt="" loading="lazy">
        <span class="pick__text">
          <span class="pick__name">${p.name}</span>
          <span class="pick__price">${money(p.price)}</span>
        </span>
        <span class="pick__check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg></span>
      </button>
      ${Object.keys(p.variants).length > 1 ? swatchesHtml(p, "data-pick-swatch") : ""}
    </li>`;
  }).join("");

  const slots = Math.max(BUILDER_MIN, picks.size + 1);
  const filled = [...picks].map(([id, c]) => {
    const p = findProduct(id);
    return `
    <li class="slot slot--on${id === lastPicked ? " is-new" : ""}">
      <img src="${img(p.variants[c])}" alt="">
      <span class="slot__name">${p.name}</span>
      <span class="slot__meta">${COLORS[c].label} · ${money(p.price)}</span>
      <button type="button" class="slot__remove" data-pick="${id}" aria-label="Remove ${p.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>
      </button>
    </li>`;
  });
  const empty = Array.from({ length: slots - picks.size }, (_, i) => `
    <li class="slot${picks.size + i >= BUILDER_MIN ? " slot--extra" : ""}" aria-hidden="true">
      <span class="slot__plus">+</span>
      <span class="slot__hint">${picks.size + i >= BUILDER_MIN ? "Add more" : `Piece ${picks.size + i + 1}`}</span>
    </li>`);
  $("[data-builder-slots]").innerHTML = filled.join("") + empty.join("");

  syncBuilderSwatches();
  updateBuilder();
  if (refocus) $(`[data-builder] ${refocus}`)?.focus();
}

function syncBuilderSwatches() {
  document.querySelectorAll("[data-pick-swatch]").forEach((s) => {
    const id = s.dataset.pickSwatch;
    s.setAttribute("aria-checked", String((picks.get(id) || firstColor(findProduct(id))) === s.dataset.color));
  });
}

function togglePick(p, color) {
  lastPicked = picks.has(p.id) ? null : p.id;
  if (color) picks.set(p.id, color);
  else if (picks.has(p.id)) picks.delete(p.id);
  else picks.set(p.id, selected[p.id] || firstColor(p));
  renderBuilder();
}

function builderTotals() {
  const sum = [...picks.keys()].reduce((s, id) => s + findProduct(id).price, 0);
  const active = picks.size >= BUILDER_MIN;
  return { sum, total: active ? Math.round(sum * (1 - BUILDER_DISCOUNT) * 100) / 100 : sum, active };
}

function updateBuilder() {
  const { sum, total, active } = builderTotals();
  const n = picks.size;
  $("[data-builder-bar]").style.width = `${Math.min(100, (n / BUILDER_MIN) * 100)}%`;
  $("[data-builder-status]").textContent = active
    ? `${n} pieces · ${BUILDER_DISCOUNT * 100}% off applied`
    : n === 0 ? `Pick ${BUILDER_MIN} pieces to unlock your discount`
    : `${BUILDER_MIN - n === 1 ? "1 more piece" : `${BUILDER_MIN - n} more pieces`} to unlock your discount`;
  $("[data-builder-old]").textContent = active ? money(sum) : "";
  $("[data-builder-total]").textContent = money(total);
  $("[data-builder-add]").disabled = !active;
}

/* ---------- gift card ---------- */
let giftAmount = 50;
let giftDesign = "terracotta";
function renderGift() {
  $("[data-gift-designs]").innerHTML = Object.entries(GIFT_DESIGNS).map(([k, d]) =>
    `<button type="button" class="swatch" role="radio" style="--c:${d.hex}" data-gift-design="${k}" aria-checked="${k === giftDesign}" aria-label="${d.label}" title="${d.label}"></button>`).join("");
  $("[data-gift-design-label]").textContent = GIFT_DESIGNS[giftDesign].label;
  $("[data-gift-card]").dataset.design = giftDesign;
  $("[data-gift-options]").innerHTML = GIFT_AMOUNTS.map((a) =>
    `<button type="button" class="chip" role="radio" data-gift="${a}" aria-checked="${a === giftAmount}">${money(a)}</button>`).join("");
  $("[data-gift-amount]").textContent = money(giftAmount);
}

/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button, a");
  if (!t) return;
  const d = t.dataset;

  if (d.cat) { activeCat = d.cat; renderFilters(); renderGrid(); }
  else if ("gridMore" in d) { gridExpanded = true; renderGrid(); }
  else if (d.swatch) setColor(d.swatch, d.color);
  else if (d.add) {
    const p = findProduct(d.add);
    addProduct(p, selected[p.id]);
  }
  else if (d.addKit) {
    addKit(KITS.find((x) => x.id === d.addKit));
  }
  else if (d.pick) togglePick(findProduct(d.pick));
  else if (d.pickSwatch) togglePick(findProduct(d.pickSwatch), d.color);
  else if ("builderAdd" in d) {
    const { total } = builderTotals();
    const parts = [...picks].map(([id, c]) => `${PRODUCTS.find((p) => p.id === id).name} (${COLORS[c].label})`);
    const [firstId, firstC] = [...picks][0];
    addToCart({ key: `custom-${[...picks].map(([i, c]) => i + c).join("-")}`, name: "My Embrava kit",
      meta: parts.join(" · "), price: total, img: img(PRODUCTS.find((p) => p.id === firstId).variants[firstC]) });
    picks.clear(); renderBuilder();
  }
  else if (d.gift) { giftAmount = Number(d.gift); renderGift(); }
  else if (d.giftDesign) { giftDesign = d.giftDesign; renderGift(); }
  else if ("giftAdd" in d) addToCart({ key: `gift-${giftDesign}-${giftAmount}`, name: "Gift card", meta: `${GIFT_DESIGNS[giftDesign].label} · ${money(giftAmount)}`, price: giftAmount, img: "assets/logo/favicon_180.png" });
  else if (d.qty) {
    const l = cart[Number(d.qty)]; l.qty += Number(d.d);
    if (l.qty <= 0) cart.splice(Number(d.qty), 1);
    saveCart();
  }
  else if (d.remove) { cart.splice(Number(d.remove), 1); saveCart(); }
  else if ("openCart" in d) openCart(true);
  else if ("closeCart" in d) openCart(false);
  else if ("checkout" in d) toast("This is a demo store, so checkout is turned off");
});

$("[data-overlay]").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") openCart(false); });

$("[data-news]")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#news-email");
  $("[data-news-msg]").textContent = "Thanks. We'll let you know about new drops.";
  input.value = "";
});

/* ---------- init ---------- */
if ($("[data-kits]")) renderKits();
if ($("[data-grid]")) { renderFilters(); renderGrid(); }
if ($("[data-builder]")) renderBuilder();
if ($("[data-gift-options]")) renderGift();
renderCart();

/* Embrava · shared: helpers, basket and home page.
   Catalogue data lives in data.js. */

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const money = (n) => `${CURRENCY}${Number.isInteger(n) ? n : n.toFixed(2)}`;
const img = (file) => `assets/img/${file.includes(".") ? file : file + ".jpg"}`;
const waveSvg = (cls = "") => `<svg class="${cls}" viewBox="0 0 509.26 262.08" aria-hidden="true"><use href="#wave"/></svg>`;
const firstColor = (p) => Object.keys(p.variants)[0];
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
  $("[data-kits]").innerHTML = KITS.map((k) => `
    <article class="kit kit--${k.theme}">
      <img class="kit__img" src="${img(k.img)}" alt="${k.name}: ${k.items.join(", ")}" loading="lazy">
      <div class="kit__body">
        <span class="kit__badge">Save ${Math.round((1 - k.price / k.full) * 100)}%</span>
        <h3>${k.name}</h3>
        <p class="kit__for">${k.for}</p>
        <ul class="kit__items">${k.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        <div class="kit__foot">
          <div class="kit__price"><s>${money(k.full)}</s><strong>${money(k.price)}</strong></div>
          <button class="btn" type="button" data-add-kit="${k.id}">Add</button>
        </div>
      </div>
    </article>`).join("") + `
    <a class="kit kit--custom" href="#build">
      ${waveSvg()}
      <h3>Build your kit</h3>
      <p>Pick 3 or more pieces in any colours you like and save 15%.</p>
      <span class="link">Start building</span>
    </a>`;
}

/* ---------- catalogue ---------- */
let activeCat = "all";
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
          ${swatchesHtml(p, "data-swatch")}
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

function renderBuilder() {
  $("[data-builder]").innerHTML = PRODUCTS.map((p) => {
    const c = picks.get(p.id) || firstColor(p);
    return `
    <div>
      <button type="button" class="pick" data-pick="${p.id}" aria-pressed="${picks.has(p.id)}">
        <img src="${img(p.variants[c])}" alt="" loading="lazy">
        <span class="pick__check"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span>
        <span class="pick__name">${p.name}</span>
        <span class="pick__price">${money(p.price)}</span>
      </button>
      ${Object.keys(p.variants).length > 1 ? `<div style="margin:10px 4px 0">${swatchesHtml(p, "data-pick-swatch")}</div>` : ""}
    </div>`;
  }).join("");
  syncBuilderSwatches();
  updateBuilder();
}

function syncBuilderSwatches() {
  document.querySelectorAll("[data-pick-swatch]").forEach((s) => {
    const id = s.dataset.pickSwatch;
    const p = PRODUCTS.find((x) => x.id === id);
    s.setAttribute("aria-checked", String((picks.get(id) || firstColor(p)) === s.dataset.color));
  });
}

function builderTotals() {
  const sum = [...picks.keys()].reduce((s, id) => s + PRODUCTS.find((p) => p.id === id).price, 0);
  const active = picks.size >= BUILDER_MIN;
  return { sum, total: active ? Math.round(sum * (1 - BUILDER_DISCOUNT) * 100) / 100 : sum, active };
}

function updateBuilder() {
  const { sum, total, active } = builderTotals();
  const n = picks.size;
  $("[data-builder-bar]").style.width = `${Math.min(100, (n / BUILDER_MIN) * 100)}%`;
  $("[data-builder-status]").textContent = active
    ? `${n} pieces · 15% off applied`
    : n === 0 ? `Pick ${BUILDER_MIN} pieces to unlock your discount`
    : `${BUILDER_MIN - n === 1 ? "1 more piece" : `${BUILDER_MIN - n} more pieces`} to unlock your discount`;
  $("[data-builder-old]").textContent = active ? money(sum) : "";
  $("[data-builder-total]").textContent = money(total);
  $("[data-builder-add]").disabled = !active;
}

/* ---------- gift card ---------- */
let giftAmount = 50;
function renderGift() {
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
  else if (d.swatch) setColor(d.swatch, d.color);
  else if (d.add) {
    const p = findProduct(d.add);
    addProduct(p, selected[p.id]);
  }
  else if (d.addKit) {
    addKit(KITS.find((x) => x.id === d.addKit));
  }
  else if (d.pick) {
    const p = PRODUCTS.find((x) => x.id === d.pick);
    if (picks.has(p.id)) picks.delete(p.id); else picks.set(p.id, selected[p.id] || firstColor(p));
    t.setAttribute("aria-pressed", String(picks.has(p.id)));
    updateBuilder();
  }
  else if (d.pickSwatch) {
    const p = PRODUCTS.find((x) => x.id === d.pickSwatch);
    picks.set(p.id, d.color);
    const btn = $(`[data-pick="${p.id}"]`);
    btn.setAttribute("aria-pressed", "true");
    $("img", btn).src = img(p.variants[d.color]);
    syncBuilderSwatches();
    updateBuilder();
  }
  else if ("builderAdd" in d) {
    const { total } = builderTotals();
    const parts = [...picks].map(([id, c]) => `${PRODUCTS.find((p) => p.id === id).name} (${COLORS[c].label})`);
    const [firstId, firstC] = [...picks][0];
    addToCart({ key: `custom-${[...picks].map(([i, c]) => i + c).join("-")}`, name: "My Embrava kit",
      meta: parts.join(" · "), price: total, img: img(PRODUCTS.find((p) => p.id === firstId).variants[firstC]) });
    picks.clear(); renderBuilder();
  }
  else if (d.gift) { giftAmount = Number(d.gift); renderGift(); }
  else if ("giftAdd" in d) addToCart({ key: `gift-${giftAmount}`, name: "Gift card", meta: money(giftAmount), price: giftAmount, img: "assets/logo/favicon_180.png" });
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

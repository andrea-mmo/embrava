/* Embrava · product page (product.html?p=<id>&colour=<colour>) */

(() => {
  const params = new URLSearchParams(location.search);
  const product = findProduct(params.get("p"));
  const root = $("[data-pdp]");

  if (!product) {
    root.innerHTML = `
      <div class="wrap pdp__missing">
        ${waveSvg()}
        <h1>We couldn't find that piece</h1>
        <p>It may have sold out or moved. Have a look at the rest of the range.</p>
        <a class="btn btn--dark" href="index.html#shop">Back to the shop</a>
      </div>`;
    document.title = "Not found · Embrava";
    return;
  }

  const colours = Object.keys(product.variants);
  let colour = colours.includes(params.get("colour")) ? params.get("colour") : colours[0];
  let qty = 1;

  /* ---------- static content ---------- */
  document.title = `${product.name} · Embrava`;
  document.querySelector('meta[name="description"]').content = `${product.name}. ${product.lead}`;
  $("[data-crumb]").textContent = product.name;
  $("[data-name]").textContent = product.name;
  $("[data-lead]").textContent = product.lead;
  $("[data-price]").textContent = money(product.price);
  $("[data-description]").textContent = product.description;
  $("[data-details]").innerHTML = product.details.map((d) => `<li>${d}</li>`).join("");
  $("[data-sticky-name]").textContent = product.name;
  $("[data-sticky-price]").textContent = money(product.price);
  if (product.tag) { const t = $("[data-tag]"); t.textContent = product.tag; t.hidden = false; }

  const left = FREE_SHIPPING - product.price;
  $("[data-pdp-ship]").innerHTML = left > 0
    ? `Add ${money(left)} more for <strong>free UK delivery</strong>`
    : `This piece ships <strong>free</strong> in the UK`;

  /* ---------- colour ---------- */
  $("[data-swatches]").innerHTML = `<div class="swatches swatches--lg" role="radiogroup" aria-label="Colour">${colours.map((c) =>
    `<button type="button" class="swatch" role="radio" style="--c:${COLORS[c].hex}" data-pdp-colour="${c}"
      aria-label="${COLORS[c].label}" title="${COLORS[c].label}"></button>`).join("")}</div>`;

  $("[data-thumbs]").innerHTML = colours.length > 1 ? colours.map((c) =>
    `<button type="button" class="pdp__thumb" data-pdp-colour="${c}" aria-label="Show ${COLORS[c].label}">
      <img src="${img(product.variants[c])}" alt="" loading="lazy"></button>`).join("") : "";

  function setColour(c, push = true) {
    colour = c;
    const main = $("[data-main-img]");
    const src = img(product.variants[c]);
    if (main.getAttribute("src") && main.getAttribute("src") !== src) {
      main.classList.add("is-fading");
      setTimeout(() => { main.src = src; main.onload = () => main.classList.remove("is-fading"); }, 150);
    } else main.src = src;
    main.alt = `${product.name} in ${COLORS[c].label}`;
    $("[data-sticky-img]").src = src;
    $("[data-colour-label]").textContent = COLORS[c].label;
    document.querySelectorAll("[data-pdp-colour]").forEach((el) => {
      const on = el.dataset.pdpColour === c;
      el.setAttribute(el.classList.contains("swatch") ? "aria-checked" : "aria-pressed", String(on));
    });
    if (push) history.replaceState(null, "", productUrl(product.id, c));
  }

  /* ---------- kit upsell ---------- */
  const kit = KITS.find((k) => k.products.includes(product.id));
  if (kit) {
    $("[data-kit-upsell]").innerHTML = `
      <div class="upsell upsell--${kit.theme}">
        <img src="${img(kit.img)}" alt="" loading="lazy">
        <div class="upsell__body">
          <p class="upsell__eyebrow">Save ${Math.round((1 - kit.price / kit.full) * 100)}% in the ${kit.name}</p>
          <p class="upsell__items">${kit.items.join(" + ")}</p>
          <p class="upsell__price"><s>${money(kit.full)}</s> <strong>${money(kit.price)}</strong></p>
        </div>
        <button class="btn btn--light" type="button" data-add-kit="${kit.id}">Add kit</button>
      </div>`;
  }

  /* ---------- related ---------- */
  const related = [
    ...PRODUCTS.filter((p) => p.id !== product.id && kit?.products.includes(p.id)),
    ...PRODUCTS.filter((p) => p.id !== product.id && !kit?.products.includes(p.id)),
  ].slice(0, 3);
  $("[data-related]").innerHTML = related.map((p) => {
    const c = Object.keys(p.variants).includes(colour) ? colour : firstColor(p);
    return `
    <article class="card">
      <a class="card__media" href="${productUrl(p.id, c)}">
        <img src="${img(p.variants[c])}" alt="${p.name} in ${COLORS[c].label}" loading="lazy">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
      </a>
      <div class="card__body">
        <div class="card__top"><h3><a href="${productUrl(p.id, c)}">${p.name}</a></h3><span class="card__price">${money(p.price)}</span></div>
        <span class="card__color">${COLORS[c].label}${Object.keys(p.variants).length > 1 ? ` · ${Object.keys(p.variants).length} colours` : ""}</span>
        <div class="card__foot">
          <a class="link-arrow" href="${productUrl(p.id, c)}">View</a>
          <button class="add-btn" type="button" data-quick-add="${p.id}" data-colour="${c}">Add +</button>
        </div>
      </div>
    </article>`;
  }).join("");

  /* ---------- events ---------- */
  root.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    const d = t.dataset;
    if (d.pdpColour) setColour(d.pdpColour);
    else if (d.pdpQty) {
      qty = Math.max(1, Math.min(10, qty + Number(d.pdpQty)));
      $("[data-pdp-qty-value]").textContent = qty;
    }
    else if ("pdpAdd" in d) addProduct(product, colour, qty);
    else if (d.quickAdd) addProduct(findProduct(d.quickAdd), d.colour);
  });

  /* Mobile sticky bar appears once the main button scrolls away */
  const sticky = $("[data-sticky]");
  new IntersectionObserver(([entry]) => {
    const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    sticky.classList.toggle("is-on", show);
    sticky.setAttribute("aria-hidden", String(!show));
    document.body.classList.toggle("has-sticky", show);
    $("button", sticky).tabIndex = show ? 0 : -1;
  }).observe($(".pdp__add"));

  setColour(colour, false);
})();

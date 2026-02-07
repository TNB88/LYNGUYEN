(() => {
  "use strict";

  // =========================
  // CONFIG
  // =========================
  const ZALO_PHONE = "0939617080";
  const TIKTOK_URL = "https://www.tiktok.com/@tho.ly.nguyn32";
  const ZALO_CHAT_URL = `https://zalo.me/${ZALO_PHONE}`;

  // =========================
  // HELPERS
  // =========================
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const fmtVND = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // SVG data-uri => luôn có ảnh, khỏi lo path
  function svgDataUri({ title, code, colors }) {
    const [c1, c2] = colors;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1706" height="2560" viewBox="0 0 1706 2560">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${c1}"/>
            <stop offset="1" stop-color="${c2}"/>
          </linearGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18"/>
          </filter>
        </defs>
        <rect width="1706" height="2560" fill="url(#g)"/>
        <circle cx="260" cy="420" r="220" fill="rgba(255,255,255,.18)" filter="url(#blur)"/>
        <circle cx="1460" cy="720" r="260" fill="rgba(255,255,255,.14)" filter="url(#blur)"/>
        <circle cx="920" cy="2000" r="360" fill="rgba(0,0,0,.18)" filter="url(#blur)"/>
        <text x="90" y="240" fill="rgba(255,255,255,.92)" font-size="90" font-family="Inter, Arial" font-weight="900">Ly Shop</text>
        <text x="90" y="340" fill="rgba(255,255,255,.85)" font-size="56" font-family="Inter, Arial" font-weight="800">${escapeXml(title)}</text>
        <text x="90" y="430" fill="rgba(255,255,255,.78)" font-size="44" font-family="Inter, Arial" font-weight="800">Mã: ${escapeXml(code)}</text>
        <text x="90" y="2420" fill="rgba(255,255,255,.88)" font-size="46" font-family="Inter, Arial" font-weight="900">Chốt đơn qua Zalo: ${ZALO_PHONE}</text>
      </svg>
    `.trim();

    // encode for data-uri
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");

    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }

  function escapeXml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function buildZaloMessage(items) {
    // items: [{code, name, color, size, qty}]
    const lines = [
      "Ly ơi chốt đơn giúp em nhé ❤️",
      "",
      ...items.map((it, i) => {
        const c = it.color ? ` | Màu: ${it.color}` : "";
        const s = it.size ? ` | Size: ${it.size}` : "";
        return `${i + 1}) ${it.code} - ${it.name}${c}${s} | SL: ${it.qty}`;
      }),
      "",
      "Địa chỉ nhận hàng: ...",
      "SĐT người nhận: ...",
    ];
    return lines.join("\n");
  }

  function openZaloWithText(text) {
    // Zalo.me support text param varies; safest: copy to clipboard + open chat.
    // We'll do both: copy + open chat.
    copyText(text);
    window.open(ZALO_CHAT_URL, "_blank", "noopener");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã copy nội dung. Mở Zalo dán vào là xong ✅");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Đã copy nội dung (fallback) ✅");
    }
  }

  // tiny toast
  let toastTimer = null;
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "18px";
      el.style.transform = "translateX(-50%)";
      el.style.zIndex = "9999";
      el.style.padding = "12px 14px";
      el.style.borderRadius = "999px";
      el.style.background = "rgba(0,0,0,.55)";
      el.style.border = "1px solid rgba(255,255,255,.18)";
      el.style.backdropFilter = "blur(8px)";
      el.style.color = "white";
      el.style.fontWeight = "900";
      el.style.maxWidth = "92vw";
      el.style.textAlign = "center";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = "0"), 2400);
  }

  // =========================
  // PRODUCTS (12 items)
  // =========================
  const products = [
  {
    id: "P01",
    code: "V01",
    name: "Áo Khoác Lông Nâu",
    category: "dress",
    price: 189000,
    hot: 98,
    color: "Nâu",
    size: "S/M/L",
    image: "./images/v01.jpg"
  },
  {
    id: "P02",
    code: "V02",
    name: "Áo Khoác Lông Caro Trắng Đen ",
    category: "dress",
    price: 229000,
    hot: 92,
    color: "Đen",
    size: "S/M/L",
    image: "./images/v02.jpg"
  },
  {
    id: "P03",
    code: "V03",
    name: "Váy Hoa Vintage",
    category: "dress",
    price: 209000,
    hot: 88,
    color: "Kem",
    size: "S/M",
    image: "./images/v03.jpg"
  },
  {
    id: "P04",
    code: "V04",
    name: "Váy Trễ Vai",
    category: "dress",
    price: 199000,
    hot: 86,
    color: "Trắng",
    size: "S/M/L",
    image: "./images/v04.jpg"
  },

  {
    id: "P05",
    code: "A01",
    name: "Áo Thun Oversize",
    category: "top",
    price: 149000,
    hot: 90,
    color: "Trắng",
    size: "Free",
    image: "./images/v05.jpg"
  },
  {
    id: "P06",
    code: "A02",
    name: "Áo Croptop Gân",
    category: "top",
    price: 129000,
    hot: 87,
    color: "Đen",
    size: "S/M",
    image: "./images/v06.jpg"
  },
  {
    id: "P07",
    code: "A03",
    name: "Áo Sơ Mi Form Rộng",
    category: "top",
    price: 219000,
    hot: 83,
    color: "Xanh",
    size: "S/M/L",
    image: "./images/v07.jpg"
  },

  {
    id: "P08",
    code: "Q01",
    name: "Quần Ống Suông",
    category: "pants",
    price: 239000,
    hot: 89,
    color: "Be",
    size: "S/M/L",
    image: "./images/v08.jpg"
  },
  {
    id: "P09",
    code: "Q02",
    name: "Quần Jeans Lưng Cao",
    category: "pants",
    price: 259000,
    hot: 85,
    color: "Xanh Jeans",
    size: "S/M/L",
    image: "./images/v09.jpg"
  },
  {
    id: "P10",
    code: "Q03",
    name: "Quần Short Kaki",
    category: "pants",
    price: 169000,
    hot: 80,
    color: "Kem",
    size: "S/M",
    image: "./images/v10.jpg"
  },

  {
    id: "P11",
    code: "S01",
    name: "Set Áo",
    category: "set",
    price: 319000,
    hot: 94,
    color: "Trắng",
    size: "S/M",
    image: "./images/v11.jpg"
  },
  {
    id: "P12",
    code: "S02",
    name: "Set Thể Thao",
    category: "set",
    price: 289000,
    hot: 82,
    color: "Đen",
    size: "Free",
    image: "./images/v12.jpg"
  }
];

  // =========================
  // STATE
  // =========================
  const state = {
    filter: "all",
    q: "",
    sort: "hot",
    cart: loadCart(),
  };

  function loadCart() {
    try {
      const raw = localStorage.getItem("lyshop_cart");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem("lyshop_cart", JSON.stringify(state.cart));
  }

  function cartCount() {
    return Object.values(state.cart).reduce((sum, it) => sum + it.qty, 0);
  }

  function cartSubtotal() {
    return Object.values(state.cart).reduce((sum, it) => sum + it.qty * it.price, 0);
  }

  // =========================
  // RENDER
  // =========================
  function renderProducts() {
    const grid = $("#productGrid");
    if (!grid) return;

    const list = products
      .filter(p => state.filter === "all" ? true : p.category === state.filter)
      .filter(p => {
        const q = state.q.trim().toLowerCase();
        if (!q) return true;
        const hay = `${p.name} ${p.code} ${p.color} ${p.size} ${p.category}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (state.sort === "priceAsc") return a.price - b.price;
        if (state.sort === "priceDesc") return b.price - a.price;
        return (b.hot ?? 0) - (a.hot ?? 0);
      });

    grid.innerHTML = list.map(p => `
      <article class="card glass">
        <div class="card__img">
          <img src="${p.image}" alt="${escapeXml(p.name)}" loading="lazy">
        </div>

        <div class="card__row">
          <div>
            <div class="card__title">${escapeXml(p.name)}</div>
            <div class="card__meta">
              <span class="kicker">Mã: <b>${escapeXml(p.code)}</b></span>
              <div style="margin-top:8px;">
                Màu: <b>${escapeXml(p.color)}</b> • Size: <b>${escapeXml(p.size)}</b>
              </div>
            </div>
          </div>
          <div class="price">${fmtVND(p.price)}</div>
        </div>

        <div class="card__actions">
          <button class="smallbtn smallbtn--primary" data-add="${p.id}">➕ Thêm giỏ</button>
          <button class="smallbtn" data-buy="${p.id}">⚡ Mua nhanh</button>
        </div>
      </article>
    `).join("");

    // bind buttons
    $$("[data-add]", grid).forEach(btn => {
      btn.addEventListener("click", () => addToCart(btn.dataset.add));
    });
    $$("[data-buy]", grid).forEach(btn => {
      btn.addEventListener("click", () => quickBuy(btn.dataset.buy));
    });
  }

  function renderCartUI() {
    $("#cartCount").textContent = String(cartCount());
    $("#cartCountMobile").textContent = String(cartCount());
    $("#cartSubtotal").textContent = fmtVND(cartSubtotal());

    const wrap = $("#cartItems");
    if (!wrap) return;

    const items = Object.values(state.cart);
    if (items.length === 0) {
      wrap.innerHTML = `<div class="muted" style="padding:10px 0; font-weight:900;">Chưa có sản phẩm nào trong giỏ.</div>`;
      $("#zaloCheckout").href = ZALO_CHAT_URL;
      return;
    }

    wrap.innerHTML = items.map(it => `
      <div class="cartitem">
        <div>
          <div class="cartitem__name">${escapeXml(it.name)} <span class="muted">(${escapeXml(it.code)})</span></div>
          <div class="cartitem__meta">
            Màu: <b>${escapeXml(it.color)}</b> • Size: <b>${escapeXml(it.size)}</b><br/>
            Giá: <b>${fmtVND(it.price)}</b>
          </div>
        </div>
        <div class="qty">
          <button data-dec="${it.id}" aria-label="Giảm">−</button>
          <div style="min-width:22px;text-align:center;font-weight:1000;">${it.qty}</div>
          <button data-inc="${it.id}" aria-label="Tăng">+</button>
        </div>
      </div>
    `).join("");

    $$("[data-inc]", wrap).forEach(b => b.addEventListener("click", () => inc(b.dataset.inc)));
    $$("[data-dec]", wrap).forEach(b => b.addEventListener("click", () => dec(b.dataset.dec)));

    // update checkout click: copy message then open zalo chat
    const text = buildZaloMessage(items.map(it => ({
      code: it.code, name: it.name, color: it.color, size: it.size, qty: it.qty
    })));

    const checkout = $("#zaloCheckout");
    checkout.onclick = (e) => {
      e.preventDefault();
      openZaloWithText(text);
    };
  }

  // =========================
  // CART ACTIONS
  // =========================
  function addToCart(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;

    const existed = state.cart[p.id];
    state.cart[p.id] = existed
      ? { ...existed, qty: existed.qty + 1 }
      : { id: p.id, code: p.code, name: p.name, price: p.price, color: p.color, size: p.size, qty: 1 };

    saveCart();
    renderCartUI();
    toast(`Đã thêm: ${p.code} ✅`);
  }

  function quickBuy(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;

    const msg = buildZaloMessage([{ code: p.code, name: p.name, color: p.color, size: p.size, qty: 1 }]);
    openZaloWithText(msg);
  }

  function inc(id) {
    if (!state.cart[id]) return;
    state.cart[id].qty += 1;
    saveCart();
    renderCartUI();
  }

  function dec(id) {
    if (!state.cart[id]) return;
    state.cart[id].qty -= 1;
    if (state.cart[id].qty <= 0) delete state.cart[id];
    saveCart();
    renderCartUI();
  }

  function clearCart() {
    state.cart = {};
    saveCart();
    renderCartUI();
    toast("Đã xóa giỏ ✅");
  }

  // =========================
  // UI: drawer / menu / filters
  // =========================
  function openDrawer() {
    const d = $("#cartDrawer");
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    const d = $("#cartDrawer");
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
  }

  function setupFilters() {
    const chips = $$(".filters .chipbtn");
    chips.forEach(btn => {
      btn.addEventListener("click", () => {
        chips.forEach(x => x.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filter = btn.dataset.filter || "all";
        renderProducts();
      });
    });
  }

  function setupSearchSort() {
    $("#searchInput").addEventListener("input", (e) => {
      state.q = e.target.value || "";
      renderProducts();
    });
    $("#sortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value || "hot";
      renderProducts();
    });
  }

  function setupMobileMenu() {
    const ham = $("#hamburger");
    const menu = $("#mobileMenu");
    ham.addEventListener("click", () => {
      const open = menu.hasAttribute("hidden") === false;
      if (open) {
        menu.hidden = true;
        ham.setAttribute("aria-expanded", "false");
      } else {
        menu.hidden = false;
        ham.setAttribute("aria-expanded", "true");
      }
    });

    // close on click
    $$("a", menu).forEach(a => a.addEventListener("click", () => {
      menu.hidden = true;
      ham.setAttribute("aria-expanded", "false");
    }));
  }

  // Theme (auto/light/dark)
  function applyTheme(mode) {
    const html = document.documentElement;
    let theme = mode;

    if (mode === "auto") {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }

    html.classList.add("theme-anim");
    html.setAttribute("data-theme", theme);

    const icon = theme === "light" ? "☀️" : "🌙";
    const text = theme === "light" ? "Sáng" : "Tối";
    $("#themeIcon").textContent = icon;
    $("#themeText").textContent = text;
    $("#themeTextMobile").textContent = text;

    localStorage.setItem("lyshop_theme_mode", mode);
    setTimeout(() => html.classList.remove("theme-anim"), 260);
  }

  function setupTheme() {
    const btn = $("#themeBtn");
    const menu = $("#themeMenu");

    const saved = localStorage.getItem("lyshop_theme_mode") || "dark";
    applyTheme(saved);

    btn.addEventListener("click", () => {
      const isOpen = !menu.hidden;
      menu.hidden = isOpen;
      btn.setAttribute("aria-expanded", String(!isOpen));
    });

    // click outside
    document.addEventListener("click", (e) => {
      if (!menu) return;
      if (menu.hidden) return;
      if (menu.contains(e.target) || btn.contains(e.target)) return;
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    });

    $$("[data-theme-mode]").forEach(opt => {
      opt.addEventListener("click", () => {
        const mode = opt.dataset.themeMode;
        applyTheme(mode);
        if (!menu.hidden) {
          menu.hidden = true;
          btn.setAttribute("aria-expanded", "false");
        }
      });
    });

    // auto mode react to system changes
    window.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", () => {
      const mode = localStorage.getItem("lyshop_theme_mode") || "dark";
      if (mode === "auto") applyTheme("auto");
    });
  }

  // reveal
  function setupReveal() {
    const els = $$(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add("in");
      });
    }, { threshold: 0.12 });

    els.forEach(el => {
      const d = el.getAttribute("data-delay") || "0";
      el.style.setProperty("--d", `${d}ms`);
      io.observe(el);
    });
  }

  // tilt card
  function setupTilt() {
    const card = $("#tiltCard");
    if (!card) return;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rotY = (x - 0.5) * 10;
      const rotX = -(y - 0.5) * 10;
      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
  }

  // particles (nhẹ)
  function setupParticles() {
    const c = $("#particles");
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = 0, h = 0;
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: 1.2 + Math.random() * 1.8
    }));

    const resize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(255,255,255,.65)";

      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;
        if (d.y < 0) d.y = 1;
        if (d.y > 1) d.y = 0;

        const px = d.x * w, py = d.y * h;
        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // hero button: copy phone
  function setupCopyButtons() {
    const bind = (id) => {
      const b = $(id);
      if (!b) return;
      b.addEventListener("click", () => {
        const phone = b.dataset.phone || ZALO_PHONE;
        copyText(phone);
        toast("Đã copy SĐT/Zalo ✅");
      });
    };
    bind("#copyPhone");
    bind("#copyPhone2");
  }

  // cart buttons
  function setupCartButtons() {
    $("#openCart").addEventListener("click", openDrawer);
    $("#openCartMobile").addEventListener("click", openDrawer);
    $("#closeCart").addEventListener("click", closeDrawer);
    $("#drawerBackdrop").addEventListener("click", closeDrawer);
    $("#clearCart").addEventListener("click", clearCart);

    // ESC close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  // quick add: add hottest
  function setupQuickAdd() {
    $("#quickAdd").addEventListener("click", () => {
      const hot = [...products].sort((a,b)=> (b.hot??0)-(a.hot??0))[0];
      addToCart(hot.id);
      openDrawer();
    });
  }

  // mouse highlight for primary button
  function setupBtnGlow() {
    $$(".btn--primary").forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        btn.style.setProperty("--mx", `${mx}%`);
        btn.style.setProperty("--my", `${my}%`);
      });
    });
  }

  // =========================
  // INIT
  // =========================
  function init() {
    $("#year").textContent = String(new Date().getFullYear());

    setupTheme();
    setupMobileMenu();
    setupReveal();
    setupTilt();
    setupParticles();
    setupCopyButtons();
    setupCartButtons();
    setupFilters();
    setupSearchSort();
    setupQuickAdd();
    setupBtnGlow();

    renderProducts();
    renderCartUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

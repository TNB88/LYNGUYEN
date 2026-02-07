(() => {
  "use strict";

  const ZALO_PHONE = "0939617080";
  const ZALO_CHAT_URL = `https://zalo.me/${ZALO_PHONE}`;

  // ====== LIVE CONFIG ======
  // Đổi giờ live tại đây (24h). Ví dụ 20:00 => { hour: 20, minute: 0 }
  const LIVE_SCHEDULE = [
    { hour: 20, minute: 0 },  // mỗi ngày 20:00
    // { hour: 14, minute: 0 }, // nếu muốn thêm ca live khác
  ];

  // Nhắc trước bao nhiêu phút (mặc định 10 phút)
  const REMIND_BEFORE_MINUTES = 10;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const fmtVND = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

  // ===== PRODUCTS (12) =====
  const products = [
    { id: "P01", code: "V01", name: "Váy Babydoll Nơ", category: "dress", price: 189000, hot: 98, color: "Hồng", size: "S/M/L", image: "./images/v01.jpg" },
    { id: "P02", code: "V02", name: "Váy Body Dài", category: "dress", price: 229000, hot: 92, color: "Đen", size: "S/M/L", image: "./images/v02.jpg" },
    { id: "P03", code: "V03", name: "Váy Hoa Vintage", category: "dress", price: 209000, hot: 88, color: "Kem", size: "S/M", image: "./images/v03.jpg" },
    { id: "P04", code: "V04", name: "Váy Trễ Vai", category: "dress", price: 199000, hot: 86, color: "Trắng", size: "S/M/L", image: "./images/v04.jpg" },

    { id: "P05", code: "A01", name: "Áo Thun Oversize", category: "top", price: 149000, hot: 90, color: "Trắng", size: "Free", image: "./images/a01.jpg" },
    { id: "P06", code: "A02", name: "Áo Croptop Gân", category: "top", price: 129000, hot: 87, color: "Đen", size: "S/M", image: "./images/a02.jpg" },
    { id: "P07", code: "A03", name: "Áo Sơ Mi Form Rộng", category: "top", price: 219000, hot: 83, color: "Xanh", size: "S/M/L", image: "./images/a03.jpg" },

    { id: "P08", code: "Q01", name: "Quần Ống Suông", category: "pants", price: 239000, hot: 89, color: "Be", size: "S/M/L", image: "./images/q01.jpg" },
    { id: "P09", code: "Q02", name: "Quần Jeans Lưng Cao", category: "pants", price: 259000, hot: 85, color: "Xanh Jeans", size: "S/M/L", image: "./images/q02.jpg" },
    { id: "P10", code: "Q03", name: "Quần Short Kaki", category: "pants", price: 169000, hot: 80, color: "Kem", size: "S/M", image: "./images/q03.jpg" },

    { id: "P11", code: "S01", name: "Set Áo + Chân Váy", category: "set", price: 319000, hot: 94, color: "Hồng", size: "S/M", image: "./images/s01.jpg" },
    { id: "P12", code: "S02", name: "Set Thể Thao", category: "set", price: 289000, hot: 82, color: "Đen", size: "Free", image: "./images/s02.jpg" },
  ];

  // ===== STATE =====
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
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildZaloMessage(items) {
    const lines = [
      "Ly ơi chốt đơn giúp em nhé ❤️",
      "",
      ...items.map((it, i) => `${i + 1}) ${it.code} - ${it.name} | Màu: ${it.color} | Size: ${it.size} | SL: ${it.qty}`),
      "",
      "Địa chỉ nhận hàng: ...",
      "SĐT người nhận: ...",
    ];
    return lines.join("\n");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã copy ✅");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Đã copy ✅");
    }
  }

  let toastTimer = null;
  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      Object.assign(el.style, {
        position: "fixed",
        left: "50%",
        bottom: "18px",
        transform: "translateX(-50%)",
        zIndex: "9999",
        padding: "12px 14px",
        borderRadius: "999px",
        background: "rgba(0,0,0,.55)",
        border: "1px solid rgba(255,255,255,.18)",
        backdropFilter: "blur(8px)",
        color: "white",
        fontWeight: "900",
        maxWidth: "92vw",
        textAlign: "center",
      });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = "0"), 2200);
  }

  // ===== PRODUCTS RENDER =====
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
      <article class="card">
        <div class="card__img">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy"
               onerror="this.onerror=null;this.src='./images/placeholder.jpg';">
        </div>

        <div class="card__row">
          <div>
            <div class="card__title">${escapeHtml(p.name)}</div>
            <div class="card__meta">
              <span class="kicker">Mã: <b>${escapeHtml(p.code)}</b></span>
              <div style="margin-top:8px;">Màu: <b>${escapeHtml(p.color)}</b> • Size: <b>${escapeHtml(p.size)}</b></div>
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

    $$("[data-add]", grid).forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.add)));
    $$("[data-buy]", grid).forEach(btn => btn.addEventListener("click", () => quickBuy(btn.dataset.buy)));
  }

  // ===== CART =====
  function renderCartUI() {
    const sub = $("#cartSubtotal"); if (sub) sub.textContent = fmtVND(cartSubtotal());
    const wrap = $("#cartItems");
    if (!wrap) return;

    const items = Object.values(state.cart);
    if (items.length === 0) {
      wrap.innerHTML = `<div class="muted" style="padding:10px 0; font-weight:900;">Chưa có sản phẩm nào trong giỏ.</div>`;
      const checkout = $("#zaloCheckout");
      if (checkout) { checkout.href = ZALO_CHAT_URL; checkout.onclick = null; }
      return;
    }

    wrap.innerHTML = items.map(it => `
      <div class="cartitem">
        <div>
          <div class="cartitem__name">${escapeHtml(it.name)} <span class="muted">(${escapeHtml(it.code)})</span></div>
          <div class="cartitem__meta">
            Màu: <b>${escapeHtml(it.color)}</b> • Size: <b>${escapeHtml(it.size)}</b><br/>
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

    const text = buildZaloMessage(items.map(it => ({
      code: it.code, name: it.name, color: it.color, size: it.size, qty: it.qty
    })));

    const checkout = $("#zaloCheckout");
    if (checkout) {
      checkout.onclick = (e) => {
        e.preventDefault();
        copyText(text);
        window.open(ZALO_CHAT_URL, "_blank", "noopener");
      };
    }
  }

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
    openDrawer();
  }

  function quickBuy(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;

    const msg = buildZaloMessage([{ code: p.code, name: p.name, color: p.color, size: p.size, qty: 1 }]);
    copyText(msg);
    window.open(ZALO_CHAT_URL, "_blank", "noopener");
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

  function openDrawer() {
    const d = $("#cartDrawer");
    if (!d) return;
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    const d = $("#cartDrawer");
    if (!d) return;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
  }

  // ===== NEW DROP ROTATE =====
  function setupNewDropRotator() {
    const slots = [$("#nd1"), $("#nd2"), $("#nd3")].filter(Boolean);
    if (slots.length !== 3) return;

    const pool = [
      "./images/nd1.jpg",
      "./images/nd2.jpg",
      "./images/nd3.jpg",
      "./images/nd4.jpg",
      "./images/nd5.jpg",
      "./images/nd6.jpg",
    ];

    const intervalMs = 10000; // đổi 5000 nếu muốn 5 giây

    const safeSetSrc = (img, src) => new Promise((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });

    function pickNext(exclude) {
      const cand = pool.filter(p => !exclude.includes(p));
      const list = cand.length ? cand : pool;
      return list[Math.floor(Math.random() * list.length)];
    }

    slots.forEach(img => img.classList.add("is-show", "kenburns"));

    let idx = 0;
    setInterval(() => {
      const img = slots[idx % 3];
      idx++;

      const current = slots.map(x => x.getAttribute("src"));
      const nextSrc = pickNext(current);

      img.classList.add("is-fading");

      setTimeout(async () => {
        await safeSetSrc(img, nextSrc);
        img.classList.remove("is-fading");
        img.classList.add("is-show");
      }, 450);
    }, intervalMs);
  }

  // ===== LIVE COUNTDOWN + NOTIFY =====
  function nextLiveDate(now = new Date()) {
    const candidates = LIVE_SCHEDULE.map(s => {
      const d = new Date(now);
      d.setHours(s.hour, s.minute, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 1);
      return d;
    });
    candidates.sort((a,b)=>a-b);
    return candidates[0];
  }

  function fmtTime(d) {
    const hh = String(d.getHours()).padStart(2,"0");
    const mm = String(d.getMinutes()).padStart(2,"0");
    return `${hh}:${mm}`;
  }

  function tickLive() {
    const now = new Date();
    const next = nextLiveDate(now);
    const diff = next - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const cd = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    const cdEl = $("#liveCountdown"); if (cdEl) cdEl.textContent = cd;

    const tEl = $("#liveTimeText");
    if (tEl) tEl.textContent = LIVE_SCHEDULE.map(x => `${String(x.hour).padStart(2,"0")}:${String(x.minute).padStart(2,"0")}`).join(" / ");
  }

  function scheduleReminder() {
    // lưu trạng thái nhắc vào localStorage
    localStorage.setItem("lyshop_live_remind", "1");
    toast(`Đã bật nhắc live trước ${REMIND_BEFORE_MINUTES} phút ✅`);
  }

  function cancelReminder() {
    localStorage.removeItem("lyshop_live_remind");
    toast("Đã tắt nhắc live ✅");
  }

  function maybeNotify() {
    const enabled = localStorage.getItem("lyshop_live_remind") === "1";
    if (!enabled) return;

    const now = new Date();
    const next = nextLiveDate(now);
    const diffMin = Math.floor((next - now) / 60000);

    // Chỉ notify 1 lần cho mỗi buổi live
    const key = "lyshop_live_notified_at";
    const last = localStorage.getItem(key);

    const should = diffMin === REMIND_BEFORE_MINUTES;
    const stamp = next.toISOString().slice(0,16); // unique for session

    if (should && last !== stamp) {
      localStorage.setItem(key, stamp);
      showNotification(`Sắp live rồi!`, `Còn ${REMIND_BEFORE_MINUTES} phút nữa shop lên live (${fmtTime(next)}).`);
    }
  }

  async function showNotification(title, body) {
    if (!("Notification" in window)) {
      toast("Máy bạn không hỗ trợ thông báo.");
      return;
    }

    if (Notification.permission === "default") {
      const p = await Notification.requestPermission();
      if (p !== "granted") {
        toast("Bạn chưa cho phép thông báo.");
        return;
      }
    }
    if (Notification.permission !== "granted") {
      toast("Bạn chưa cho phép thông báo.");
      return;
    }

    const n = new Notification(title, { body });
    n.onclick = () => window.open("https://www.tiktok.com/@tho.ly.nguyn32", "_blank", "noopener");
  }

  // ===== Bind UI =====
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
    const si = $("#searchInput");
    if (si) si.addEventListener("input", (e) => { state.q = e.target.value || ""; renderProducts(); });

    const ss = $("#sortSelect");
    if (ss) ss.addEventListener("change", (e) => { state.sort = e.target.value || "hot"; renderProducts(); });
  }

  function setupCartButtons() {
    const bd = $("#drawerBackdrop"); if (bd) bd.addEventListener("click", closeDrawer);
    const cc = $("#closeCart"); if (cc) cc.addEventListener("click", closeDrawer);
    const cl = $("#clearCart"); if (cl) cl.addEventListener("click", clearCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
  }

  function setupQuickAdd() {
    const qa = $("#quickAdd");
    if (!qa) return;
    qa.addEventListener("click", () => {
      const hot = [...products].sort((a,b)=> (b.hot??0)-(a.hot??0))[0];
      addToCart(hot.id);
    });
  }

  function setupLiveUI() {
    const btn = $("#notifyBtn");
    if (!btn) return;

    const refreshBtnText = () => {
      const on = localStorage.getItem("lyshop_live_remind") === "1";
      btn.textContent = on ? "🔕 Tắt nhắc" : "⏰ Nhắc tôi";
      btn.classList.toggle("btn--soft", on);
      btn.classList.toggle("btn--primary", !on);
    };

    refreshBtnText();

    btn.addEventListener("click", async () => {
      const on = localStorage.getItem("lyshop_live_remind") === "1";
      if (on) {
        cancelReminder();
        refreshBtnText();
        return;
      }

      // xin quyền notification
      if ("Notification" in window && Notification.permission === "default") {
        const p = await Notification.requestPermission();
        if (p !== "granted") {
          toast("Bạn chưa cho phép thông báo.");
          return;
        }
      }
      scheduleReminder();
      refreshBtnText();
    });

    // copy zalo
    const cz = $("#copyZalo");
    if (cz) cz.addEventListener("click", () => copyText(cz.dataset.phone || ZALO_PHONE));
  }

  function init() {
    const year = $("#year"); if (year) year.textContent = String(new Date().getFullYear());

    setupFilters();
    setupSearchSort();
    setupCartButtons();
    setupQuickAdd();
    setupNewDropRotator();

    renderProducts();
    renderCartUI();

    // live countdown
    tickLive();
    setInterval(() => {
      tickLive();
      maybeNotify();
    }, 1000);

    setupLiveUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

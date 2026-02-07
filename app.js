// ===== Helpers =====
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const VND = (n) => n.toLocaleString("vi-VN") + "đ";
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// ===== Static shop info =====
const SHOP = {
  name: "Ly Shop",
  phone: "0939617080",
  zaloLink: "https://zalo.me/0939617080",
  zaloGroup: "https://zalo.me/g/bugggx505",
  tiktokUrl: "https://www.tiktok.com/@tho.ly.nguyn32",
  tiktokId: "@tho.ly.nguyn32",
  tiktokName: "Ly Hệ rú Bỳ🌸"
};

// ===== Year =====
$("#year") && ($("#year").textContent = new Date().getFullYear());

/* =========================
   THEME: auto + light + dark
========================= */
const THEME_KEY = "lyshop_theme_mode"; // auto | light | dark
let mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

function themeLabel(mode, resolvedTheme){
  if(mode === "auto") return { text: "Auto", icon: "🪄" };
  if(resolvedTheme === "light") return { text: "Sáng", icon: "☀️" };
  return { text: "Tối", icon: "🌙" };
}
function setThemeResolved(theme){
  document.documentElement.setAttribute("data-theme", theme);
}
function setThemeMode(mode){
  localStorage.setItem(THEME_KEY, mode);
  applyThemeMode(mode, true);
}
function applyThemeMode(mode, animate=false){
  const resolved = (mode === "auto")
    ? (mql && mql.matches ? "light" : "dark")
    : mode;

  if(animate){
    document.documentElement.classList.add("theme-anim");
    setTimeout(()=> document.documentElement.classList.remove("theme-anim"), 260);
  }

  setThemeResolved(resolved);

  const { text, icon } = themeLabel(mode, resolved);
  $("#themeIcon") && ($("#themeIcon").textContent = icon);
  $("#themeText") && ($("#themeText").textContent = text);
  $("#themeTextMobile") && ($("#themeTextMobile").textContent = text);

  // highlight mobile chips
  $$(".mobile-theme [data-theme-mode]").forEach(b => b.classList.remove("is-active"));
  $$(".mobile-theme [data-theme-mode]").forEach(b => {
    if(b.dataset.themeMode === mode) b.classList.add("is-active");
  });
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  const mode = (saved === "auto" || saved === "light" || saved === "dark") ? saved : "auto";
  applyThemeMode(mode, false);

  // if auto -> respond to system changes
  if(mql){
    mql.addEventListener?.("change", () => {
      const currentMode = localStorage.getItem(THEME_KEY) || "auto";
      if(currentMode === "auto") applyThemeMode("auto", true);
    });
  }
}
initTheme();

// Desktop theme menu
const themeBtn = $("#themeBtn");
const themeMenu = $("#themeMenu");
function toggleThemeMenu(force){
  if(!themeMenu) return;
  const open = force ?? themeMenu.hidden;
  themeMenu.hidden = !open;
}
themeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleThemeMenu();
});
document.addEventListener("click", () => toggleThemeMenu(false));
themeMenu?.addEventListener("click", (e) => e.stopPropagation());

$$(".theme__opt").forEach(btn => {
  btn.addEventListener("click", () => {
    setThemeMode(btn.dataset.themeMode);
    toggleThemeMenu(false);
  });
});

// Mobile theme buttons
$$(".mobile-theme [data-theme-mode]").forEach(btn => {
  btn.addEventListener("click", () => setThemeMode(btn.dataset.themeMode));
});

/* =========================
   MOBILE MENU
========================= */
const hamburger = $("#hamburger");
const mobileMenu = $("#mobileMenu");
hamburger?.addEventListener("click", () => {
  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
});
$$(".mobile-menu a").forEach(a => {
  a.addEventListener("click", () => {
    hamburger?.setAttribute("aria-expanded", "false");
    if(mobileMenu) mobileMenu.hidden = true;
  });
});

/* =========================
   BUTTON GLOW
========================= */
$$(".btn--primary").forEach(btn => {
  btn.addEventListener("pointermove", (e) => {
    const r = btn.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    btn.style.setProperty("--mx", mx + "%");
    btn.style.setProperty("--my", my + "%");
  });
});

/* =========================
   REVEAL (IntersectionObserver)
========================= */
let io = null;
function initReveal(){
  const revealEls = $$(".reveal");
  revealEls.forEach(el => {
    const d = el.dataset.delay ? `${el.dataset.delay}ms` : "0ms";
    el.style.setProperty("--d", d);
  });

  if(!("IntersectionObserver" in window)){
    revealEls.forEach(el => el.classList.add("in"));
    return;
  }

  io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => io.observe(el));
}
initReveal();

/* =========================
   TILT
========================= */
const tilt = $("#tiltCard");
if(tilt){
  tilt.addEventListener("pointermove", (e) => {
    const r = tilt.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 12;
    tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    const shine = tilt.querySelector(".card__shine");
    if(shine){
      shine.style.transform = `translate3d(${(px - 0.5) * 40}px, ${(py - 0.5) * 30}px, 40px)`;
    }
  });
  tilt.addEventListener("pointerleave", () => {
    tilt.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
    const shine = tilt.querySelector(".card__shine");
    if(shine) shine.style.transform = "translate3d(0,0,40px)";
  });
}

/* =========================
   COPY PHONE
========================= */
function bindCopy(btnId){
  const btn = document.getElementById(btnId);
  if(!btn) return;
  btn.addEventListener("click", async () => {
    const phone = btn.dataset.phone || SHOP.phone;
    const old = btn.textContent;
    try{
      await navigator.clipboard.writeText(phone);
      btn.textContent = "Đã copy: " + phone;
    }catch{
      const ta = document.createElement("textarea");
      ta.value = phone;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      btn.textContent = "Đã copy: " + phone;
    }
    setTimeout(()=> btn.textContent = old, 1200);
  });
}
bindCopy("copyPhone");
bindCopy("copyPhone2");

/* =========================
   PRODUCTS (12 SẢN PHẨM)
   Ảnh: assets/products/p1.jpg ... p12.jpg
========================= */
const PRODUCTS = [
  { id:"p1",  code:"LY01", name:"Váy baby-doll phối nơ",         cat:"dress", price:199000, hot:98, note:"Màu: kem/đen • Size: S/M/L",     img:"assets/products/p1.jpg" },
  { id:"p2",  code:"LY02", name:"Áo croptop rib basic",          cat:"top",   price:119000, hot:93, note:"Màu: trắng/đen/hồng • Freesize",  img:"assets/products/p2.jpg" },
  { id:"p3",  code:"LY03", name:"Quần ống suông cạp cao",        cat:"pants", price:229000, hot:90, note:"Màu: đen/xám • Size: S/M/L",     img:"assets/products/p3.jpg" },
  { id:"p4",  code:"LY04", name:"Set áo + chân váy tennis",      cat:"set",   price:269000, hot:97, note:"Màu: trắng/đen • Size: S/M",     img:"assets/products/p4.jpg" },
  { id:"p5",  code:"LY05", name:"Váy body tôn dáng",             cat:"dress", price:239000, hot:89, note:"Màu: đen/đỏ • Size: S/M/L",       img:"assets/products/p5.jpg" },
  { id:"p6",  code:"LY06", name:"Áo sơ mi form rộng",            cat:"top",   price:199000, hot:84, note:"Màu: trắng/xanh • Freesize",      img:"assets/products/p6.jpg" },
  { id:"p7",  code:"LY07", name:"Chân váy chữ A basic",          cat:"dress", price:149000, hot:86, note:"Màu: đen/nâu • Size: S/M/L",      img:"assets/products/p7.jpg" },
  { id:"p8",  code:"LY08", name:"Áo thun oversize in chữ",       cat:"top",   price:129000, hot:88, note:"Màu: trắng/đen • Freesize",       img:"assets/products/p8.jpg" },
  { id:"p9",  code:"LY09", name:"Quần jean nữ ống đứng",         cat:"pants", price:259000, hot:92, note:"Màu: xanh nhạt/đậm • Size: S/M/L", img:"assets/products/p9.jpg" },
  { id:"p10", code:"LY10", name:"Set len tăm ôm dáng",           cat:"set",   price:289000, hot:85, note:"Màu: be/đen • Size: S/M",          img:"assets/products/p10.jpg" },
  { id:"p11", code:"LY11", name:"Váy hoa vintage cổ vuông",      cat:"dress", price:219000, hot:91, note:"Màu: hoa xanh/hoa hồng • Size: S/M/L", img:"assets/products/p11.jpg" },
  { id:"p12", code:"LY12", name:"Áo cardigan mỏng phối nút",      cat:"top",   price:179000, hot:83, note:"Màu: be/hồng/đen • Freesize",     img:"assets/products/p12.jpg" }
];

const CAT_LABEL = { all:"Tất cả", dress:"Váy", top:"Áo", pants:"Quần", set:"Set" };

// ===== Render products =====
const grid = $("#productGrid");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");
const filterBtns = $$(".chipbtn[data-filter]");

let state = { filter: "all", q: "", sort: "hot" };

function cardTemplate(p){
  const imgHtml = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy"
         onerror="this.remove(); this.parentElement.insertAdjacentHTML('beforeend','<div class=img-fallback></div>')">`
    : `<div class="img-fallback"></div>`;

  return `
    <article class="card glass reveal" data-reveal="1" data-id="${p.id}" data-cat="${p.cat}">
      <div class="card__img">${imgHtml}</div>
      <div class="card__row">
        <div>
          <div class="card__title">${p.name}</div>
          <div class="card__meta">Mã: <b>${p.code || p.id}</b> • ${CAT_LABEL[p.cat]} • ${p.note}</div>
        </div>
        <div>
          <div class="kicker">Hot</div>
          <div class="price">${VND(p.price)}</div>
        </div>
      </div>
      <div class="card__actions">
        <button class="smallbtn smallbtn--primary" data-add="${p.id}" type="button">Thêm giỏ</button>
        <button class="smallbtn" data-buy="${p.id}" type="button">Mua nhanh</button>
      </div>
    </article>
  `;
}

function applyFilters(list){
  const q = state.q.trim().toLowerCase();
  let out = list.filter(p => (state.filter === "all" ? true : p.cat === state.filter));
  if(q){
    out = out.filter(p => (p.name + " " + p.note + " " + (p.code||"") + " " + CAT_LABEL[p.cat]).toLowerCase().includes(q));
  }
  if(state.sort === "hot") out.sort((a,b)=> b.hot - a.hot);
  if(state.sort === "priceAsc") out.sort((a,b)=> a.price - b.price);
  if(state.sort === "priceDesc") out.sort((a,b)=> b.price - a.price);
  return out;
}

function render(){
  if(!grid) return;
  const items = applyFilters([...PRODUCTS]);
  grid.innerHTML = items.map(cardTemplate).join("");

  // observe new reveals
  const newReveals = $$("[data-reveal='1']");
  if(io){
    newReveals.forEach(el => io.observe(el));
  }else{
    newReveals.forEach(el => el.classList.add("in"));
  }
}
render();

searchInput?.addEventListener("input", (e) => { state.q = e.target.value || ""; render(); });
sortSelect?.addEventListener("change", (e) => { state.sort = e.target.value; render(); });

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.filter = btn.dataset.filter;
    render();
  });
});

/* =========================
   CART
========================= */
let cart = new Map(); // id -> qty

const cartDrawer = $("#cartDrawer");
const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const cartCountMobile = $("#cartCountMobile");
const cartSubtotal = $("#cartSubtotal");
const zaloCheckout = $("#zaloCheckout");

function openDrawer(){
  if(!cartDrawer) return;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  if(!cartDrawer) return;
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#openCart")?.addEventListener("click", openDrawer);
$("#openCartMobile")?.addEventListener("click", openDrawer);
$("#closeCart")?.addEventListener("click", closeDrawer);
$("#drawerBackdrop")?.addEventListener("click", closeDrawer);

$("#clearCart")?.addEventListener("click", () => {
  cart.clear();
  syncCartUI();
});

function addToCart(id, qty=1){
  cart.set(id, (cart.get(id) || 0) + qty);
  syncCartUI();
}
function removeFromCart(id){ cart.delete(id); syncCartUI(); }
function setQty(id, qty){ qty <= 0 ? cart.delete(id) : cart.set(id, qty); syncCartUI(); }

function cartList(){
  const arr = [];
  for(const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if(p) arr.push({ ...p, qty });
  }
  return arr;
}

function buildZaloMessage(items, subtotal){
  const lines = [
    `Hi ${SHOP.name}, mình muốn đặt đơn:`,
    ...items.map((it, idx)=> `${idx+1}) ${it.name} (Mã ${it.code || it.id}) • SL: ${it.qty} • Giá: ${VND(it.price)} • ${it.note}`),
    `Tạm tính: ${VND(subtotal)}`,
    `Ghi chú: (màu/size/địa chỉ giúp mình)`,
    `—`,
    `TikTok: ${SHOP.tiktokName} (${SHOP.tiktokId})`
  ];
  return lines.join("\n");
}

function syncCartUI(){
  const items = cartList();
  const count = items.reduce((s,it)=> s + it.qty, 0);
  const subtotal = items.reduce((s,it)=> s + it.qty*it.price, 0);

  if(cartCount) cartCount.textContent = String(count);
  if(cartCountMobile) cartCountMobile.textContent = String(count);
  if(cartSubtotal) cartSubtotal.textContent = VND(subtotal);

  if(cartItems){
    if(items.length === 0){
      cartItems.innerHTML = `
        <div class="glass" style="padding:14px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);">
          Giỏ hàng đang trống. Chọn vài món “hot” bên dưới nhé ✨
        </div>
      `;
    } else {
      cartItems.innerHTML = items.map(it => `
        <div class="cartitem">
          <div>
            <div class="cartitem__name">${it.name}</div>
            <div class="cartitem__meta">Mã <b>${it.code || it.id}</b> • ${CAT_LABEL[it.cat]} • ${VND(it.price)} • ${it.note}</div>
            <div class="cartitem__meta"><b>Thành tiền:</b> ${VND(it.price * it.qty)}</div>
          </div>
          <div class="qty">
            <button type="button" data-dec="${it.id}">−</button>
            <b style="min-width:18px;text-align:center;">${it.qty}</b>
            <button type="button" data-inc="${it.id}">＋</button>
            <button type="button" data-del="${it.id}" title="Xóa" aria-label="Xóa">🗑️</button>
          </div>
        </div>
      `).join("");

      $$("[data-inc]").forEach(b => b.onclick = () => addToCart(b.dataset.inc, 1));
      $$("[data-dec]").forEach(b => b.onclick = () => setQty(b.dataset.dec, (cart.get(b.dataset.dec) || 1) - 1));
      $$("[data-del]").forEach(b => b.onclick = () => removeFromCart(b.dataset.del));
    }
  }

  const msg = buildZaloMessage(items, subtotal);
  const zaloUrl = `${SHOP.zaloLink}?chat&msg=${encodeURIComponent(msg)}`;
  if(zaloCheckout) zaloCheckout.href = zaloUrl;
}
syncCartUI();

$("#quickAdd")?.addEventListener("click", () => {
  addToCart("p4", 1);
  openDrawer();
});

document.addEventListener("click", (e) => {
  const t = e.target;
  const addId = t?.dataset?.add;
  const buyId = t?.dataset?.buy;
  if(addId){ addToCart(addId, 1); return; }
  if(buyId){ addToCart(buyId, 1); openDrawer(); return; }
});

/* =========================
   PARTICLES (Canvas)
========================= */
const canvas = $("#particles");
const ctx = canvas?.getContext?.("2d", { alpha: true });

if(canvas && ctx){
  let W = 0, H = 0, DPR = 1;
  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  const rand = (a,b)=> a + Math.random()*(b-a);
  const colors = [
    "rgba(255,77,141,.55)",
    "rgba(124,58,237,.45)",
    "rgba(6,182,212,.35)",
    "rgba(255,255,255,.22)"
  ];

  let mouse = { x: W/2, y: H/2, active:false };
  window.addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive:true });
  window.addEventListener("pointerleave", () => mouse.active = false, { passive:true });

  const COUNT = Math.floor(clamp((W*H)/24000, 40, 110));
  const particles = Array.from({length: COUNT}).map(() => ({
    x: rand(0, W),
    y: rand(0, H),
    r: rand(1.2, 3.2),
    vx: rand(-0.38, 0.38),
    vy: rand(-0.28, 0.28),
    c: colors[Math.floor(Math.random()*colors.length)]
  }));

  function step(){
    ctx.clearRect(0,0,W,H);

    const g = ctx.createRadialGradient(W*0.5, H*0.4, 50, W*0.5, H*0.4, Math.max(W,H)*0.85);
    g.addColorStop(0, "rgba(255,255,255,.03)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    for (const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if(mouse.active){
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx,dy);
        if(dist < 160){
          p.x -= dx * 0.002;
          p.y -= dy * 0.002;
        }
      }

      if(p.x < -20) p.x = W + 20;
      if(p.x > W + 20) p.x = -20;
      if(p.y < -20) p.y = H + 20;
      if(p.y > H + 20) p.y = -20;

      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx,dy);
        if(d < 120){
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d/120) * 0.10})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  step();
}

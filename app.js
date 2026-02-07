const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const VND = (n) => n.toLocaleString("vi-VN") + "đ";

const SHOP = {
  name: "Ly Shop",
  phone: "0939617080",
  zaloLink: "https://zalo.me/0939617080",
  zaloGroup: "https://zalo.me/g/bugggx505",
  tiktokUrl: "https://www.tiktok.com/@tho.ly.nguyn32",
  tiktokId: "@tho.ly.nguyn32",
  tiktokName: "Ly Hệ rú Bỳ🌸"
};

$("#year") && ($("#year").textContent = new Date().getFullYear());

/* ========= THEME ========= */
const THEME_KEY = "lyshop_theme_mode";
const mql = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(mode){
  const resolved = mode === "auto" ? (mql.matches ? "light" : "dark") : mode;
  document.documentElement.setAttribute("data-theme", resolved);

  const text = mode === "auto" ? "Auto" : (resolved === "light" ? "Sáng" : "Tối");
  const icon = mode === "auto" ? "🪄" : (resolved === "light" ? "☀️" : "🌙");
  $("#themeText") && ($("#themeText").textContent = text);
  $("#themeIcon") && ($("#themeIcon").textContent = icon);
  $("#themeTextMobile") && ($("#themeTextMobile").textContent = text);
}

function setTheme(mode){
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
}

(function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "auto";
  applyTheme(saved);

  mql.addEventListener("change", () => {
    const current = localStorage.getItem(THEME_KEY) || "auto";
    if(current === "auto") applyTheme("auto");
  });
})();

const themeBtn = $("#themeBtn");
const themeMenu = $("#themeMenu");

themeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  themeMenu.hidden = !themeMenu.hidden;
});
document.addEventListener("click", () => { if(themeMenu) themeMenu.hidden = true; });

$$(".theme__opt").forEach(btn => {
  btn.addEventListener("click", () => {
    setTheme(btn.dataset.themeMode);
    themeMenu.hidden = true;
  });
});

$$(".mobile-theme [data-theme-mode]").forEach(btn => {
  btn.addEventListener("click", () => setTheme(btn.dataset.themeMode));
});

/* ========= MOBILE MENU ========= */
const hamburger = $("#hamburger");
const mobileMenu = $("#mobileMenu");
hamburger?.addEventListener("click", () => {
  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", String(!expanded));
  mobileMenu.hidden = expanded;
});

/* ========= COPY PHONE ========= */
function bindCopy(id){
  const btn = document.getElementById(id);
  if(!btn) return;
  btn.addEventListener("click", async () => {
    const phone = btn.dataset.phone || SHOP.phone;
    const old = btn.textContent;
    try{ await navigator.clipboard.writeText(phone); }
    catch{
      const ta = document.createElement("textarea");
      ta.value = phone; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
    }
    btn.textContent = "Đã copy: " + phone;
    setTimeout(()=> btn.textContent = old, 1200);
  });
}
bindCopy("copyPhone");
bindCopy("copyPhone2");

/* ========= PRODUCTS ========= */
const PRODUCTS = [
  { id:"p1", code:"LY01", name:"Váy baby-doll phối nơ", cat:"dress", price:199000, note:"Màu: kem/đen • Size S/M/L", img:"assets/products/p1.jpg" },
  { id:"p2", code:"LY02", name:"Áo croptop rib basic", cat:"top", price:119000, note:"Trắng/đen/hồng", img:"assets/products/p2.jpg" },
  { id:"p3", code:"LY03", name:"Quần ống suông cạp cao", cat:"pants", price:229000, note:"Đen/xám", img:"assets/products/p3.jpg" },
  { id:"p4", code:"LY04", name:"Set áo + chân váy tennis", cat:"set", price:269000, note:"Trắng/đen", img:"assets/products/p4.jpg" }
];

const CAT_LABEL = { dress:"Váy", top:"Áo", pants:"Quần", set:"Set" };
const grid = $("#productGrid");

function cardTemplate(p){
  return `
    <article class="card glass">
      <div class="card__img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="card__row">
        <div>
          <div class="card__title">${p.name}</div>
          <div class="card__meta">Mã <b>${p.code}</b> • ${CAT_LABEL[p.cat]} • ${p.note}</div>
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

function renderProducts(){
  if(!grid) return;
  grid.innerHTML = PRODUCTS.map(cardTemplate).join("");
}
renderProducts();

/* ========= CART ========= */
let cart = new Map();
const cartDrawer = $("#cartDrawer");
const cartItems = $("#cartItems");
const cartCount = $("#cartCount");
const cartCountMobile = $("#cartCountMobile");
const cartSubtotal = $("#cartSubtotal");
const zaloCheckout = $("#zaloCheckout");

function openDrawer(){
  cartDrawer?.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  cartDrawer?.classList.remove("is-open");
  document.body.style.overflow = "";
}
$("#openCart")?.addEventListener("click", openDrawer);
$("#openCartMobile")?.addEventListener("click", openDrawer);
$("#closeCart")?.addEventListener("click", closeDrawer);
$("#drawerBackdrop")?.addEventListener("click", closeDrawer);

$("#clearCart")?.addEventListener("click", () => { cart.clear(); syncCartUI(); });

function addToCart(id, qty=1){
  cart.set(id, (cart.get(id)||0) + qty);
  syncCartUI();
}

function cartList(){
  const arr = [];
  for(const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if(p) arr.push({ ...p, qty });
  }
  return arr;
}

function buildZaloMsg(items, subtotal){
  const lines = [
    `Hi ${SHOP.name}, mình muốn đặt đơn:`,
    ...items.map((it, i)=> `${i+1}) ${it.name} (Mã ${it.code}) • SL: ${it.qty} • ${VND(it.price)} • ${it.note}`),
    `Tạm tính: ${VND(subtotal)}`,
    `Ghi chú: màu/size/địa chỉ giúp mình`
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
      cartItems.innerHTML = `<div class="cartitem">Giỏ hàng trống. Chọn vài món nhé ✨</div>`;
    }else{
      cartItems.innerHTML = items.map(it => `
        <div class="cartitem">
          <b>${it.name}</b>
          <div class="muted">Mã ${it.code} • SL ${it.qty} • ${VND(it.price * it.qty)}</div>
        </div>
      `).join("");
    }
  }

  const msg = buildZaloMsg(items, subtotal);
  if(zaloCheckout) zaloCheckout.href = `${SHOP.zaloLink}?chat&msg=${encodeURIComponent(msg)}`;
}
syncCartUI();

/* ✅ FIX CLICK: dùng closest() nên bấm đâu trong button cũng ăn */
grid?.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  const buyBtn = e.target.closest("[data-buy]");
  if(addBtn){
    addToCart(addBtn.dataset.add, 1);
    return;
  }
  if(buyBtn){
    addToCart(buyBtn.dataset.buy, 1);
    openDrawer();
  }
});

$("#quickAdd")?.addEventListener("click", () => {
  addToCart("p4", 1);
  openDrawer();
});

/* ========= PARTICLES ========= */
const canvas = $("#particles");
if(canvas){
  const ctx = canvas.getContext("2d", { alpha:true });
  let W=0,H=0,DPR=1;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.floor(innerWidth);
    H = Math.floor(innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  addEventListener("resize", resize, { passive:true });
  resize();

  const rand=(a,b)=>a+Math.random()*(b-a);
  const dots = Array.from({length:70}).map(()=>({
    x: rand(0,W), y: rand(0,H),
    r: rand(1.2, 3.2),
    vx: rand(-.35,.35), vy: rand(-.25,.25)
  }));

  function loop(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="rgba(255,255,255,.18)";
    for(const p of dots){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<-20) p.x=W+20; if(p.x>W+20) p.x=-20;
      if(p.y<-20) p.y=H+20; if(p.y>H+20) p.y=-20;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

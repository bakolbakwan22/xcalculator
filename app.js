const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const pct = (n) => `${Number(n).toFixed(2).replace(/\.00$/, '')}%`;
const money = (n) => rupiah.format(Math.round(Number(n) || 0));

// Database tarif awal. Edit angka ini jika ada update resmi dari Seller Center.
// rate = persen admin utama dari nilai produk setelah diskon seller.
// handling = biaya tetap per pesanan.
// promoRate = estimasi biaya promo/gratis ongkir ketika checkbox diaktifkan.
// preorderRate = biaya tambahan produk pre-order.
const FEE_DB = [
  // Shopee Non-Star / Star / Star+
  { mp:'shopee', marketplace:'Shopee', store:'Non-Star / Star / Star+', category:'Fashion & Aksesoris', rate:8.25, minRate:4.25, maxRate:9, handling:1255, promoRate:4.5, preorderRate:5, note:'Rentang kategori fashion. Termasuk biaya proses pesanan estimasi Rp1.250 + Rp5.' },
  { mp:'shopee', marketplace:'Shopee', store:'Non-Star / Star / Star+', category:'FMCG / Kebutuhan Harian', rate:8.5, minRate:6.5, maxRate:10, handling:1255, promoRate:4.5, preorderRate:5, note:'Produk konsumsi dan kebutuhan rutin umumnya berada di rentang menengah-tinggi.' },
  { mp:'shopee', marketplace:'Shopee', store:'Non-Star / Star / Star+', category:'Elektronik & Gadget', rate:7.5, minRate:5.25, maxRate:10, handling:1255, promoRate:4.0, preorderRate:5, note:'Gunakan subkategori resmi untuk barang elektronik bernilai tinggi.' },
  { mp:'shopee', marketplace:'Shopee', store:'Non-Star / Star / Star+', category:'Rumah, Hobi & Gaya Hidup', rate:7.25, minRate:2.5, maxRate:10, handling:1255, promoRate:4.0, preorderRate:5, note:'Kategori gaya hidup memiliki rentang luas, cek subkategori.' },
  { mp:'shopee', marketplace:'Shopee', store:'Non-Star / Star / Star+', category:'Kategori Umum / Lainnya', rate:8.75, minRate:8.25, maxRate:9.5, handling:1255, promoRate:4.5, preorderRate:5, note:'Preset aman untuk produk umum jika subkategori belum dipastikan.' },
  // Shopee Mall
  { mp:'shopee', marketplace:'Shopee', store:'Shopee Mall', category:'Mall - Fashion & Aksesoris', rate:8.5, minRate:2.5, maxRate:10.2, handling:1255, promoRate:4.5, preorderRate:5, note:'Tarif Mall berbeda per kategori dan dapat berubah sesuai kontrak/program.' },
  { mp:'shopee', marketplace:'Shopee', store:'Shopee Mall', category:'Mall - FMCG / Kebutuhan Harian', rate:9, minRate:2.5, maxRate:10, handling:1255, promoRate:4.5, preorderRate:5, note:'Preset estimasi hingga 10%.' },
  { mp:'shopee', marketplace:'Shopee', store:'Shopee Mall', category:'Mall - Elektronik & Gadget', rate:8, minRate:2.5, maxRate:10, handling:1255, promoRate:4.0, preorderRate:5, note:'Validasi biaya final di rincian pesanan Seller Center.' },
  { mp:'shopee', marketplace:'Shopee', store:'Shopee Mall', category:'Mall - Gaya Hidup', rate:8.5, minRate:2.5, maxRate:10.2, handling:1255, promoRate:4.0, preorderRate:5, note:'Rentang Mall gaya hidup.' },

  // TikTok Shop by Tokopedia / Tokopedia Shop
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'Fashion', rate:8, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Komisi platform bervariasi. Preset efektif umum 8%, kategori tertentu bisa 10%.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'Beauty & Personal Care', rate:8, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Gunakan rate 10% jika kategori Anda tidak mendapatkan diskon komisi.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'Home & Living', rate:8, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Order handling fee ditambahkan per pesanan berhasil.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'Elektronik', rate:8, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Biaya komisi dapat berbeda per subkategori.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'FMCG / Kebutuhan Harian', rate:8, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Komisi platform dihitung dari nilai produk setelah diskon seller.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'Kategori Umum / Non-spesifik', rate:6.97, minRate:6.97, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Preset kategori umum termasuk pajak menurut rangkuman publik.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Marketplace Seller', category:'Voucher / Pulsa tertentu', rate:1, minRate:1, maxRate:1, handling:1250, promoRate:0, preorderRate:0, note:'Beberapa produk digital tertentu dilaporkan bertarif rendah.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Mall Seller', category:'Mall - Produk Brand', rate:8.5, minRate:2.5, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Seller Mall dapat memiliki biaya layanan tambahan sesuai status/kontrak.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Iklan / LIVE Eligible', category:'Produk dengan Ads atau LIVE', rate:7, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Tarif lebih rendah dapat berlaku untuk pesanan dari iklan atau LIVE sesuai kriteria platform.' },
  { mp:'tiktok', marketplace:'TikTok Shop', store:'Affiliate', category:'Produk memakai affiliate', rate:8, minRate:1, maxRate:10, handling:1250, promoRate:0, preorderRate:3, note:'Tambahkan komisi affiliate manual pada field Affiliate %.' },
];

const state = {
  history: JSON.parse(localStorage.getItem('mm_history') || '[]'),
  settings: JSON.parse(localStorage.getItem('mm_settings') || '{}'),
  activeFeeTab: 'all'
};

const $ = (id) => document.getElementById(id);
const pages = ['dashboard','calculator','fees','history','insights','settings'];

function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2200); }
function saveHistory(){ localStorage.setItem('mm_history', JSON.stringify(state.history)); }
function saveSettings(){ localStorage.setItem('mm_settings', JSON.stringify(state.settings)); }
function selectedFee(){ return FEE_DB.find(f => `${f.mp}|${f.store}|${f.category}` === $('category').value) || FEE_DB[0]; }

function switchPage(page){
  pages.forEach(p => { const el=$(`${p}Page`); if(el) el.hidden = p !== page; });
  document.querySelectorAll('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  document.querySelectorAll('.page-only-dashboard').forEach(el => el.style.display = page === 'dashboard' ? '' : 'none');
  const titles = {dashboard:'Kalkulator Marketplace', calculator:'Kalkulator Harga Jual', fees:'Data Biaya Admin', history:'Riwayat Perhitungan', insights:'Insight Seller', settings:'Pengaturan'};
  $('pageTitle').textContent = titles[page] || 'MarginMate';
  location.hash = page;
  document.querySelector('.rail').classList.remove('open');
}

function populateSelectors(){
  const mp = $('marketplace');
  const platforms = [...new Set(FEE_DB.map(f=>f.mp))];
  mp.innerHTML = platforms.map(p=>`<option value="${p}">${p === 'shopee' ? 'Shopee' : 'TikTok Shop'}</option>`).join('');
  mp.value = 'shopee';
  populateStoreTypes();
}
function populateStoreTypes(){
  const current = $('marketplace').value;
  const stores = [...new Set(FEE_DB.filter(f=>f.mp===current).map(f=>f.store))];
  $('storeType').innerHTML = stores.map(s=>`<option>${s}</option>`).join('');
  populateCategories();
}
function populateCategories(){
  const current = $('marketplace').value;
  const store = $('storeType').value;
  const cats = FEE_DB.filter(f=>f.mp===current && f.store===store);
  $('category').innerHTML = cats.map(f=>`<option value="${f.mp}|${f.store}|${f.category}">${f.category} - ${pct(f.rate)}</option>`).join('');
  calculate(false);
}

function calculate(shouldSave=false){
  const fee = selectedFee();
  const productName = $('productName').value.trim() || 'Produk tanpa nama';
  const cost = +$('cost').value || 0;
  const targetProfit = +$('targetProfit').value || 0;
  const discount = +$('sellerDiscount').value || 0;
  const packing = +$('packing').value || 0;
  const ads = +$('ads').value || 0;
  const affiliateRate = +$('affiliate').value || 0;
  const promoRate = $('freeShipping').checked ? fee.promoRate : 0;
  const preorderRate = $('preOrder').checked ? fee.preorderRate : 0;
  const totalRate = fee.rate + promoRate + preorderRate + affiliateRate;
  const baseCost = cost + packing + ads + targetProfit + discount + fee.handling;
  const price = totalRate >= 95 ? baseCost : baseCost / (1 - totalRate / 100);
  const netProductValue = Math.max(price - discount, 0);
  const adminFee = netProductValue * fee.rate / 100;
  const promoFee = netProductValue * promoRate / 100;
  const preorderFee = netProductValue * preorderRate / 100;
  const affiliateFee = netProductValue * affiliateRate / 100;
  const totalFees = adminFee + promoFee + preorderFee + affiliateFee + fee.handling;
  const netProfit = price - discount - cost - packing - ads - totalFees;
  const margin = price > 0 ? netProfit / price * 100 : 0;

  $('resultPrice').textContent = money(price);
  $('resultMargin').textContent = pct(margin);
  $('breakdown').innerHTML = [
    ['Modal produk', money(cost)], ['Target profit', money(targetProfit)], ['Admin utama', `${pct(fee.rate)} = ${money(adminFee)}`],
    ['Biaya tetap pesanan', money(fee.handling)], ['Promo/gratis ongkir', `${pct(promoRate)} = ${money(promoFee)}`],
    ['Pre-order', `${pct(preorderRate)} = ${money(preorderFee)}`], ['Affiliate', `${pct(affiliateRate)} = ${money(affiliateFee)}`],
    ['Total potongan', money(totalFees)], ['Profit estimasi', money(netProfit)]
  ].map(([a,b])=>`<div><span>${a}</span><strong>${b}</strong></div>`).join('');

  if(shouldSave){
    state.history.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), date:new Date().toISOString(), productName, marketplace:fee.marketplace, store:fee.store, category:fee.category, price, cost, targetProfit, totalRate, totalFees, netProfit, margin });
    state.history = state.history.slice(0, 100);
    saveHistory(); renderDashboard(); renderHistory(); toast('Perhitungan disimpan');
  }
  return {price, netProfit, totalFees, margin, fee};
}

function renderDashboard(){
  const h = state.history;
  const total = h.length;
  const avgProfit = total ? h.reduce((s,x)=>s+x.netProfit,0)/total : 0;
  const avgMargin = total ? h.reduce((s,x)=>s+x.margin,0)/total : 0;
  const gross = h.reduce((s,x)=>s+x.price,0);
  const net = h.reduce((s,x)=>s+x.netProfit,0);
  const feeTotal = h.reduce((s,x)=>s+x.totalFees,0);
  const avgFee = total ? h.reduce((s,x)=>s+x.totalRate,0)/total : 0;
  const counts = h.reduce((acc,x)=>{acc[x.marketplace]=(acc[x.marketplace]||0)+1; return acc},{});
  const best = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
  $('totalCalc').textContent = total;
  $('avgProfit').textContent = money(avgProfit);
  $('bestPlatform').textContent = best;
  $('savedFees').textContent = money(feeTotal);
  $('heroMargin').textContent = pct(avgMargin);
  document.querySelector('.profit-ring')?.style.setProperty('--p', `${Math.min(Math.max(avgMargin,0),100)*3.6}deg`);
  $('grossRevenue').textContent = money(gross);
  $('netProfitTotal').textContent = money(net);
  $('avgFeeRate').textContent = pct(avgFee);
  $('lastCalc').textContent = total ? new Date(h[0].date).toLocaleDateString('id-ID') : 'Belum ada';
}

function renderFees(){
  const q = ($('feeSearch').value || '').toLowerCase();
  const rows = FEE_DB.filter(f => (state.activeFeeTab === 'all' || f.mp === state.activeFeeTab) && `${f.marketplace} ${f.store} ${f.category} ${f.note}`.toLowerCase().includes(q));
  $('feeRows').innerHTML = rows.map(f=>`<tr><td><span class="pill">${f.marketplace}</span></td><td>${f.store}</td><td><strong>${f.category}</strong></td><td>${pct(f.rate)} <small>(${pct(f.minRate)}-${pct(f.maxRate)})</small></td><td>${money(f.handling)} / order, promo ${pct(f.promoRate)}, PO ${pct(f.preorderRate)}</td><td>${f.note}</td></tr>`).join('');
}

function renderHistory(){
  if(!state.history.length){ $('historyList').innerHTML = '<div class="card"><h3>Belum ada riwayat</h3><p class="muted">Mulai dari halaman Kalkulator untuk menyimpan perhitungan.</p></div>'; return; }
  $('historyList').innerHTML = state.history.map(x=>`<article class="history-item"><div><h3>${x.productName}</h3><div class="history-meta"><span>${new Date(x.date).toLocaleString('id-ID')}</span><span>${x.marketplace}</span><span>${x.category}</span><span>Rate ${pct(x.totalRate)}</span></div></div><div class="history-price"><strong>${money(x.price)}</strong><span>Profit ${money(x.netProfit)} (${pct(x.margin)})</span></div></article>`).join('');
}

function exportCSV(){
  const rows = [['Tanggal','Produk','Marketplace','Status','Kategori','Harga Jual','Modal','Total Rate','Total Potongan','Profit','Margin']].concat(state.history.map(x=>[x.date,x.productName,x.marketplace,x.store,x.category,Math.round(x.price),x.cost,x.totalRate,Math.round(x.totalFees),Math.round(x.netProfit),x.margin.toFixed(2)]));
  const csv = rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'}); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'riwayat-marginmate.csv'; a.click(); URL.revokeObjectURL(a.href);
}

function bind(){
  document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); switchPage(a.dataset.page)}));
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>switchPage(b.dataset.go)));
  $('hamburger').addEventListener('click',()=>document.querySelector('.rail').classList.toggle('open'));
  $('marketplace').addEventListener('change', populateStoreTypes);
  $('storeType').addEventListener('change', populateCategories);
  ['category','cost','targetProfit','sellerDiscount','packing','ads','affiliate','freeShipping','preOrder','productName'].forEach(id=>$(id).addEventListener('input',()=>calculate(false)));
  $('calcForm').addEventListener('submit',e=>{e.preventDefault(); calculate(true);});
  $('resetBtn').addEventListener('click',()=>{$('calcForm').reset(); populateSelectors(); calculate(false);});
  $('feeSearch').addEventListener('input', renderFees);
  document.querySelectorAll('[data-fee-tab]').forEach(b=>b.addEventListener('click',()=>{state.activeFeeTab=b.dataset.feeTab; document.querySelectorAll('[data-fee-tab]').forEach(x=>x.classList.toggle('active',x===b)); renderFees();}));
  $('clearHistory').addEventListener('click',()=>{ if(confirm('Hapus semua riwayat?')){state.history=[]; saveHistory(); renderDashboard(); renderHistory(); toast('Riwayat dihapus');} });
  $('exportBtn').addEventListener('click',exportCSV);
  $('saveSettings').addEventListener('click',()=>{state.settings.brandName=$('brandName').value; state.settings.ownerName=$('ownerName').value; saveSettings(); toast('Pengaturan disimpan');});
}

function init(){
  $('brandName').value = state.settings.brandName || '';
  $('ownerName').value = state.settings.ownerName || '';
  populateSelectors(); renderFees(); renderDashboard(); renderHistory(); bind();
  switchPage(location.hash?.replace('#','') || 'dashboard');
  calculate(false);
}
init();

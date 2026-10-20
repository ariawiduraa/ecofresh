/**
 * EcoFresh Bali - Simple, Clean & Elegant Application Script
 * Pure HTML, CSS, JavaScript (No complex frameworks, No bloat)
 */

(function () {
  const store = window.ecoStore;

  let currentView = "shop"; // "shop" or "admin"

  // Formatting Helpers
  function formatIDR(num) {
    if (isNaN(num)) return "Rp0";
    return "Rp" + Math.round(num).toLocaleString("id-ID");
  }

  function formatDate(dStr) {
    if (!dStr) return "-";
    const d = new Date(dStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function buildWhatsAppURL(productName, variant, price) {
    const phone = "6281234567890";
    const msg = `Halo Admin EcoFresh Bali! 🌿\n\nSaya tertarik memesan produk:\n- ${productName} (${variant})\n- Harga: ${formatIDR(price)}\n\nMohon info ketersediaan stok & ongkos kirim. Terima kasih!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  function showToast(msg) {
    const el = document.getElementById("toast-box");
    if (!el) return;
    el.innerText = msg;
    el.style.display = "block";
    setTimeout(() => {
      el.style.display = "none";
    }, 3000);
  }

  // Modal Helpers
  window.openSimpleModal = function (title, contentHtml) {
    const modal = document.getElementById("simple-modal");
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-body").innerHTML = contentHtml;
    modal.classList.add("active");
  };

  window.closeSimpleModal = function () {
    const modal = document.getElementById("simple-modal");
    if (modal) modal.classList.remove("active");
  };

  // Smooth scroll
  window.scrollToSection = function (id) {
    if (currentView !== "shop") {
      window.showShopView();
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  // View Switchers
  window.showShopView = function () {
    currentView = "shop";
    document.getElementById("toggle-admin-btn").innerText = "Admin Portal";
    render();
  };

  window.toggleAdminView = function () {
    if (currentView === "shop") {
      currentView = "admin";
      document.getElementById("toggle-admin-btn").innerText = "← Kembali ke Toko";
    } else {
      currentView = "shop";
      document.getElementById("toggle-admin-btn").innerText = "Admin Portal";
    }
    render();
  };

  // ==========================================
  // RENDER MAIN APPLICATION
  // ==========================================
  function render() {
    const app = document.getElementById("app");
    if (!app) return;

    if (currentView === "admin") {
      renderAdminView(app);
    } else {
      renderShopView(app);
    }
  }

  // ==========================================
  // 1. PUBLIC / SHOP VIEW (Clean, Simple, Aesthetic)
  // ==========================================
  function renderShopView(container) {
    const products = store.getProducts().slice(0, 3);
    const settings = store.getSettings();

    container.innerHTML = `
      <!-- HERO SECTION -->
      <section class="section-wrap" style="background: #FBF9F5; padding: 4.5rem 0;">
        <div class="container-narrow">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: center;">
            
            <!-- Left Narrative -->
            <div>
              <span class="kicker">Bali Circular Botanical Perfumery</span>
              <h1 style="font-size: 2.75rem; margin-bottom: 1.25rem; letter-spacing: -0.02em;">
                From Waste to Worth, <br>
                <span style="font-style: italic; font-weight: 400; color: var(--color-leaf);">Wear the Freshness.</span>
              </h1>
              <p style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.7; margin-bottom: 1.75rem;">
                Solid perfume alami ramah lingkungan dari upcycling residu bunga kamboja gugur dan kulit jeruk segar Bali. Diformulasikan tanpa alkohol dalam stik putar isi ulang berhias cincin gantungan tas elegan.
              </p>

              <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2rem;">
                <a href="${settings.shopeeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-shopee">
                  <span>Beli di Shopee</span>
                </a>
                <a href="${buildWhatsAppURL('EcoFresh Bali Floral-Citrus', '5g Swivel Stick', 45000)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
                  <span>Pesan via WhatsApp</span>
                </a>
                <button onclick="window.scrollToSection('produk')" class="btn btn-outline">
                  <span>Lihat Koleksi</span>
                </button>
              </div>

              <!-- 3 Clean Value Specs -->
              <div style="display: flex; gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); font-size: 0.78rem;">
                <div>
                  <strong style="color: var(--color-forest); display: block;">0% Alkohol</strong>
                  <span style="color: var(--color-text-muted);">Lilin lebah & kelapa</span>
                </div>
                <div>
                  <strong style="color: var(--color-forest); display: block;">Gantungan Tas</strong>
                  <span style="color: var(--color-text-muted);">Ring logam siap kait</span>
                </div>
                <div>
                  <strong style="color: var(--color-forest); display: block;">Refillable</strong>
                  <span style="color: var(--color-text-muted);">Wadah luar awet</span>
                </div>
              </div>
            </div>

            <!-- Right Photo Card -->
            <div>
              <div class="card-clean" style="max-width: 380px; margin: 0 auto; padding: 1.25rem;">
                <div style="aspect-ratio: 1/1; border-radius: var(--radius-sm); overflow: hidden; background: #F7F3EB; margin-bottom: 1rem;">
                  <img src="assets/produk.jpeg" alt="EcoFresh Bali Solid Perfume" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
                  <h3 style="font-size: 1.2rem; margin: 0;">Bali Floral-Citrus</h3>
                  <span style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700; color: var(--color-citrus);">Rp45.000</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
                  Stik putar 5g dengan ring gantungan tas. Aroma kamboja putih Mengwi & kulit jeruk Kintamani.
                </p>
                <div style="display: flex; gap: 0.5rem;">
                  <button onclick="window.showProductDetail('prod-1')" class="btn btn-outline btn-sm" style="flex: 1;">Detail Produk</button>
                  <a href="${buildWhatsAppURL('EcoFresh Bali Floral-Citrus', '5g Swivel Stick', 45000)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex: 1;">Pesan Sekarang</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- KOLEKSI PRODUK -->
      <section id="produk" class="section-wrap" style="background: #FFFFFF;">
        <div class="container-narrow">
          <div class="section-head center">
            <span class="kicker">Pilihan Wewangian Padat</span>
            <h2 class="section-title">Koleksi EcoFresh Bali</h2>
            <p class="section-desc">Diformulasikan dalam stik ramah lingkungan, pod isi ulang hemat, dan paket hemat.</p>
          </div>

          <div class="product-grid">
            ${products.map(p => `
              <div class="product-item">
                <div class="product-photo-wrap">
                  <img src="assets/produk.jpeg" alt="${p.name}">
                </div>
                <div class="product-body">
                  <div>
                    <span style="font-size: 0.7rem; text-transform: uppercase; font-weight: 600; color: var(--color-leaf); letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem;">
                      ${p.categoryLabel}
                    </span>
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-desc">${p.shortDesc}</p>
                  </div>

                  <div>
                    <div class="product-price-bar">
                      <span class="product-price">${formatIDR(p.price)}</span>
                      <span style="font-size: 0.75rem; color: var(--color-leaf); font-weight: 500;">Stok: ${p.stock}</span>
                    </div>
                    <div class="product-actions">
                      <button onclick="window.showProductDetail('${p.id}')" class="btn btn-outline btn-sm">Detail</button>
                      <a href="${buildWhatsAppURL(p.name, p.weight, p.price)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Beli via WA</a>
                    </div>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- TENTANG KAMI & MASCOT ARTISAN -->
      <section id="tentang" class="section-wrap" style="background: #FBF9F5;">
        <div class="container-narrow">
          <div class="story-wrap">
            
            <!-- Mascot Illustration Frame -->
            <div>
              <div class="mascot-frame">
                <img src="assets/maskot.jpeg" alt="Karakter Ilustrasi EcoFresh">
                <span style="display: block; text-align: center; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 0.5rem;">
                  Ilustrasi Resmi Penjaga Aroma Bali
                </span>
              </div>
            </div>

            <!-- Story Narrative -->
            <div>
              <span class="kicker">Cerita & Prinsip Etis</span>
              <h2 class="section-title">Harmoni Tradisi & Upcycling Berkelanjutan</h2>
              <div style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.7; display: flex; flex-direction: column; gap: 0.85rem;">
                <p>
                  Setiap hari di Bali, pohon kamboja menggugurkan kelopak bunga yang harum di pekarangan warga, sementara perkebunan jeruk di Kintamani menghasilkan residu kulit jeruk dalam jumlah besar. Jika dibiarkan, residu ini menumpuk di TPA dan menghasilkan gas metana.
                </p>
                <p>
                  EcoFresh hadir menyuling minyak atsiri alami dari bunga kamboja gugur dan kulit jeruk sisa tersebut menjadi solid perfume bebas alkohol berbasis lilin lebah alami (beeswax) dan virgin coconut oil (VCO).
                </p>
                <div style="background: #FFFFFF; border-left: 3px solid var(--color-forest); padding: 0.75rem 1rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.82rem; color: var(--color-forest);">
                  <strong>Komitmen Etis Kami:</strong> Kami secara tegas hanya mengambil bunga kamboja yang gugur alami di kebun pekarangan mitra tani, dan tidak menggunakan sarana bunga persembahan ritual ibadah (canang sari).
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- DAMPAK LINGKUNGAN (SIMPEL & JELAS) -->
      <section id="dampak" class="section-wrap" style="background: #FFFFFF;">
        <div class="container-narrow">
          <div class="section-head center">
            <span class="kicker">Laporan Transparansi</span>
            <h2 class="section-title">Dampak Lingkungan Nyata</h2>
            <p class="section-desc">Capaian sirkular batch produksi EcoFresh bersama para mitra lokal di Bali.</p>
          </div>

          <div class="impact-grid">
            <div class="impact-box">
              <div class="impact-num">56,7 <span style="font-size: 1.1rem; font-weight: normal;">kg</span></div>
              <div class="impact-label">Residu Botani Diolah</div>
              <div class="impact-note">Kamboja gugur Mengwi & kulit jeruk Kintamani</div>
            </div>

            <div class="impact-box">
              <div class="impact-num">1.340 <span style="font-size: 1.1rem; font-weight: normal;">unit</span></div>
              <div class="impact-label">Kemasan Dihindari</div>
              <div class="impact-note">Penghematan wadah sekali pakai lewat pod isi ulang</div>
            </div>

            <div class="impact-box">
              <div class="impact-num">4 <span style="font-size: 1.1rem; font-weight: normal;">mitra</span></div>
              <div class="impact-label">Kelompok Petani Lokal</div>
              <div class="impact-note">Kemitraan pemberdayaan komunitas desa di Bali</div>
            </div>
          </div>
        </div>
      </section>

      <!-- KONTAK & STUDIO -->
      <section id="kontak" class="section-wrap" style="background: #FBF9F5;">
        <div class="container-narrow">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2.5rem; align-items: start;">
            <div>
              <span class="kicker">Hubungi Kami</span>
              <h2 class="section-title">Studio & Pemesanan</h2>
              <p style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.7; margin-bottom: 1.25rem;">
                Ingin konsultasi aroma, pemesanan souvenir suvenir B2B hotel/acara pernikahan, atau tertarik menjadi mitra pasokan residu botani? Silakan hubungi kami kapan saja.
              </p>
              <div style="font-size: 0.84rem; color: var(--color-text); line-height: 1.8;">
                <div><strong>Alamat:</strong> Jl. Nyuh Bojong No. 12, Ubud, Gianyar, Bali 80571</div>
                <div><strong>Jam Buka:</strong> Senin - Sabtu: 09:00 - 18:00 WITA</div>
                <div><strong>Email:</strong> halo@ecofresh.co.id</div>
                <div><strong>WhatsApp:</strong> +62 812-3456-7890</div>
              </div>
            </div>

            <div class="card-clean">
              <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem;">Kirim Pesan Cepat</h3>
              <form onsubmit="window.handleQuickMessage(event)">
                <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Nama Anda</label>
                <input type="text" id="msg-name" class="input-clean" required placeholder="Nama lengkap">

                <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Nomor WhatsApp / Email</label>
                <input type="text" id="msg-contact" class="input-clean" required placeholder="0812xxxx atau email">

                <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Pesan / Kebutuhan</label>
                <textarea id="msg-text" class="input-clean" rows="3" required placeholder="Tuliskan pertanyaan atau pesanan Anda..."></textarea>

                <button type="submit" class="btn btn-primary" style="width: 100%;">Kirim Pesan</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  window.handleQuickMessage = function(e) {
    e.preventDefault();
    const name = document.getElementById("msg-name").value;
    showToast(`Terima kasih, ${name}! Pesan Anda telah terkirim.`);
    e.target.reset();
  };

  // Product detail popup
  window.showProductDetail = function(productId) {
    const products = store.getProducts();
    const p = products.find(item => item.id === productId) || products[0];

    const html = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="aspect-ratio: 16/9; border-radius: var(--radius-sm); overflow: hidden; background: #F7F3EB;">
          <img src="assets/produk.jpeg" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
            <h4 style="font-size: 1.25rem; margin: 0; color: var(--color-forest);">${p.name}</h4>
            <span style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 700; color: var(--color-citrus);">${formatIDR(p.price)}</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.6;">${p.description}</p>
        </div>

        <div style="background: #FBF9F5; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.78rem;">
          <strong style="color: var(--color-forest); display: block; margin-bottom: 0.25rem;">Profil Aroma Alami:</strong>
          <div><strong>Top Notes:</strong> ${p.aromaNotes ? p.aromaNotes.top : "Kulit Jeruk Kintamani Segar"}</div>
          <div><strong>Heart Notes:</strong> ${p.aromaNotes ? p.aromaNotes.heart : "Bunga Kamboja Putih Bali"}</div>
          <div><strong>Base Notes:</strong> ${p.aromaNotes ? p.aromaNotes.base : "Lilin Lebah Alami & Kelapa"}</div>
        </div>

        <div style="font-size: 0.78rem; color: var(--color-text-muted);">
          <strong>Komposisi:</strong> ${p.composition}
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <a href="https://shopee.co.id/ecofresh.bali" target="_blank" rel="noopener noreferrer" class="btn btn-shopee btn-sm" style="flex: 1;">Beli di Shopee</a>
          <a href="${buildWhatsAppURL(p.name, p.weight, p.price)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="flex: 1;">Pesan via WhatsApp</a>
        </div>
      </div>
    `;

    window.openSimpleModal(p.name, html);
  };

  // ==========================================
  // 2. ADMIN VIEW (Clean, Simple, Functional)
  // ==========================================
  function renderAdminView(container) {
    const isAuth = store.isAuthenticated();

    if (!isAuth) {
      renderAdminLogin(container);
      return;
    }

    renderAdminDashboard(container);
  }

  function renderAdminLogin(container) {
    container.innerHTML = `
      <section class="section-wrap" style="background: #FBF9F5; min-height: 70vh; display: flex; align-items: center;">
        <div class="container-narrow" style="max-width: 420px;">
          <div class="card-clean" style="text-align: center; padding: 2rem;">
            <div class="brand-logo-badge" style="margin: 0 auto 1rem; width: 44px; height: 44px; font-size: 1.3rem;">E</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Portal Admin EcoFresh</h2>
            <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Kelola pesanan, stok, dan laporan operasional secara ringkas.</p>

            <form onsubmit="window.handleAdminLogin(event)">
              <div style="text-align: left;">
                <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Email Admin</label>
                <input type="email" id="login-email" class="input-clean" value="admin@ecofresh.co.id" required>

                <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Kata Sandi</label>
                <input type="password" id="login-pass" class="input-clean" value="ecofresh2026" required>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">Masuk Dashboard</button>
              <button type="button" onclick="window.demoQuickLogin()" class="btn btn-outline" style="width: 100%; margin-top: 0.5rem;">Demo Login (1-Klik)</button>
            </form>

            <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-border); font-size: 0.75rem; color: var(--color-text-muted);">
              Kredensial demo: <code>admin@ecofresh.co.id</code> / <code>ecofresh2026</code>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  window.demoQuickLogin = function() {
    store.login("admin@ecofresh.co.id", "ecofresh2026");
    showToast("Login demo berhasil.");
    render();
  };

  window.handleAdminLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-pass").value;

    const res = store.login(email, pass);
    if (res.success) {
      showToast("Selamat datang kembali, Admin EcoFresh!");
      render();
    } else {
      alert("Email atau kata sandi tidak cocok.");
    }
  };

  window.handleAdminLogout = function() {
    store.logout();
    showToast("Anda telah keluar dari sesi admin.");
    render();
  };

  function renderAdminDashboard(container) {
    const orders = store.getOrders();
    const products = store.getProducts();
    const fin = store.getDashboardMetrics();

    container.innerHTML = `
      <section class="section-wrap" style="background: #FBF9F5; padding: 2.5rem 0;">
        <div class="container-narrow">
          
          <!-- Top Bar Admin -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="kicker">Internal Portal</span>
              <h1 style="font-size: 1.8rem; margin: 0;">Dashboard Penjualan & Operasional</h1>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="window.exportOrdersCSV()" class="btn btn-outline btn-sm">Export CSV</button>
              <button onclick="window.showAddOrderModal()" class="btn btn-primary btn-sm">+ Tambah Pesanan</button>
              <button onclick="window.handleAdminLogout()" class="btn btn-outline btn-sm" style="color: #A00;">Keluar</button>
            </div>
          </div>

          <!-- 4 KPI Metrics -->
          <div class="impact-grid" style="margin-bottom: 2.5rem;">
            <div class="impact-box">
              <div class="impact-num">${formatIDR(fin.grossRevenue || 0)}</div>
              <div class="impact-label">Total Omzet Penjualan</div>
              <div class="impact-note">${fin.orderCount || 0} total transaksi tercatat</div>
            </div>

            <div class="impact-box">
              <div class="impact-num" style="color: var(--color-leaf);">${formatIDR(fin.grossProfit || 0)}</div>
              <div class="impact-label">Estimasi Laba Kotor</div>
              <div class="impact-note">Margin sehat ~${fin.profitMargin || 56}%</div>
            </div>

            <div class="impact-box">
              <div class="impact-num">${fin.totalUnits || 0} <span style="font-size: 1rem; font-weight: normal;">unit</span></div>
              <div class="impact-label">Total Unit Terjual</div>
              <div class="impact-note">Stik putar & pod isi ulang</div>
            </div>

            <div class="impact-box">
              <div class="impact-num" style="color: var(--color-citrus);">56,7 <span style="font-size: 1rem; font-weight: normal;">kg</span></div>
              <div class="impact-label">Limbah Organik Diolah</div>
              <div class="impact-note">Kamboja & jeruk sirkular</div>
            </div>
          </div>

          <!-- TABEL PESANAN -->
          <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h2 style="font-size: 1.35rem; margin: 0;">Daftar Pesanan Terkini</h2>
              <span style="font-size: 0.78rem; color: var(--color-text-muted);">Menampilkan 10 transaksi terbaru</span>
            </div>

            <div class="table-wrap">
              <table class="simple-table">
                <thead>
                  <tr>
                    <th>No. Pesanan</th>
                    <th>Tanggal</th>
                    <th>Pelanggan</th>
                    <th>Channel</th>
                    <th>Produk</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders.slice(0, 10).map(o => `
                    <tr>
                      <td><strong>${o.orderNumber}</strong></td>
                      <td>${formatDate(o.date)}</td>
                      <td>${o.customerName}</td>
                      <td><span style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-leaf); font-weight: 600;">${o.channel}</span></td>
                      <td>${o.productName} (${o.quantity}x)</td>
                      <td><strong>${formatIDR(o.totalAmount || 0)}</strong></td>
                      <td>
                        <span class="status-tag ${o.fulfillmentStatus === 'delivered' ? 'status-lunas' : o.fulfillmentStatus === 'shipped' ? 'status-kirim' : 'status-proses'}">
                          ${o.fulfillmentStatus === 'delivered' ? 'Selesai' : o.fulfillmentStatus === 'shipped' ? 'Dikirim' : 'Diproses'}
                        </span>
                      </td>
                      <td>
                        <select onchange="window.changeOrderStatus('${o.id}', this.value)" style="font-size: 0.75rem; padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid var(--color-border);">
                          <option value="processing" ${o.fulfillmentStatus === 'processing' ? 'selected' : ''}>Diproses</option>
                          <option value="shipped" ${o.fulfillmentStatus === 'shipped' ? 'selected' : ''}>Dikirim</option>
                          <option value="delivered" ${o.fulfillmentStatus === 'delivered' ? 'selected' : ''}>Selesai</option>
                        </select>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- TABEL STOK PRODUK -->
          <div>
            <h2 style="font-size: 1.35rem; margin-bottom: 1rem;">Manajemen Stok Unit</h2>
            <div class="table-wrap">
              <table class="simple-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Nama Produk</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Sisa Stok</th>
                    <th>Kelola Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  ${products.map(p => `
                    <tr>
                      <td><code>${p.sku}</code></td>
                      <td><strong>${p.name}</strong></td>
                      <td>${p.categoryLabel}</td>
                      <td>${formatIDR(p.price)}</td>
                      <td>
                        <strong style="color: ${p.stock <= p.minStock ? '#C00' : 'var(--color-forest)'}; font-size: 0.95rem;">
                          ${p.stock} unit
                        </strong>
                      </td>
                      <td>
                        <button onclick="window.adjustStock('${p.id}', 10)" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.5rem;">+10</button>
                        <button onclick="window.adjustStock('${p.id}', -5)" class="btn btn-outline btn-sm" style="padding: 0.2rem 0.5rem;">-5</button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    `;
  }

  window.changeOrderStatus = function(orderId, newStatus) {
    try {
      store.updateOrderStatus(orderId, newStatus, null, "Diperbarui via admin portal");
      showToast(`Status pesanan diperbarui.`);
      render();
    } catch (err) {
      alert("Gagal mengubah status: " + err.message);
    }
  };

  window.adjustStock = function(productId, delta) {
    const products = store.getProducts();
    const p = products.find(item => item.id === productId);
    if (!p) return;

    try {
      store.adjustStock(productId, delta, "manual", `Penyesuaian cepat (${delta > 0 ? '+' : ''}${delta})`);
      showToast(`Stok ${p.name} berhasil diperbarui.`);
      render();
    } catch (err) {
      alert("Gagal memperbarui stok: " + err.message);
    }
  };

  window.exportOrdersCSV = function() {
    const csv = store.exportOrdersCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ecofresh_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File CSV pesanan berhasil diunduh.");
  };

  window.showAddOrderModal = function() {
    const products = store.getProducts();
    const html = `
      <form onsubmit="window.saveNewOrder(event)">
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Nama Pelanggan</label>
        <input type="text" id="new-cust-name" class="input-clean" required placeholder="Contoh: Ni Wayan Dewi">

        <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Nomor WhatsApp</label>
        <input type="text" id="new-cust-phone" class="input-clean" required placeholder="08123456789">

        <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Pilih Produk</label>
        <select id="new-prod-id" class="input-clean" style="height: 38px;">
          ${products.map(p => `<option value="${p.id}">${p.name} - ${formatIDR(p.price)}</option>`).join("")}
        </select>

        <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Jumlah (Qty)</label>
        <input type="number" id="new-qty" class="input-clean" min="1" max="50" value="1" required>

        <label style="font-size: 0.78rem; font-weight: 600; color: var(--color-forest);">Kanal Penjualan</label>
        <select id="new-channel" class="input-clean" style="height: 38px;">
          <option value="whatsapp">WhatsApp</option>
          <option value="shopee">Shopee</option>
          <option value="offline">Studio Ubud (Offline)</option>
        </select>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">Simpan Pesanan</button>
      </form>
    `;
    window.openSimpleModal("Catat Pesanan Baru", html);
  };

  window.saveNewOrder = function(e) {
    e.preventDefault();
    const name = document.getElementById("new-cust-name").value;
    const phone = document.getElementById("new-cust-phone").value;
    const prodId = document.getElementById("new-prod-id").value;
    const qty = parseInt(document.getElementById("new-qty").value, 10);
    const channel = document.getElementById("new-channel").value;

    try {
      store.createOrder({
        customerName: name,
        customerPhone: phone,
        channel: channel,
        productId: prodId,
        quantity: qty
      });

      window.closeSimpleModal();
      showToast("Pesanan baru berhasil dicatat & stok dikurangi.");
      render();
    } catch (err) {
      alert("Gagal mencatat pesanan: " + err.message);
    }
  };

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    // Check initial hash
    if (window.location.hash === "#admin" || window.location.hash.startsWith("#/admin")) {
      window.toggleAdminView();
    } else {
      render();
    }
  });

  // Re-render when store updates
  store.subscribe(() => {
    render();
  });

})();

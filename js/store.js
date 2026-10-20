/**
 * EcoFresh Store - Client-Side Database & Business Logic Engine
 * Menyimpan data di localStorage secara persisten dengan validasi, audit log,
 * kalkulasi akuntansi presisi (Omzet Kotor, Net, HPP, Laba Kotor), dan manajemen stok.
 */

class EcoFreshStore {
  constructor() {
    this.STORAGE_KEY = "ecofresh_db_v1";
    this.AUTH_KEY = "ecofresh_admin_session";
    this.listeners = [];
    this.data = this.loadData();
  }

  // === STORAGE LIFECYCLE ===
  loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure minimal required keys exist
        if (parsed && parsed.products && parsed.orders) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage, memuat seed data default:", e);
    }
    // Deep copy initial data
    const initial = JSON.parse(JSON.stringify(window.ECO_INITIAL_DATA));
    this.saveData(initial);
    return initial;
  }

  saveData(data = this.data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.notifyListeners();
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage:", e);
    }
  }

  resetToDemo() {
    this.data = JSON.parse(JSON.stringify(window.ECO_INITIAL_DATA));
    this.saveData(this.data);
    this.logAudit("DEMO_RESET", "Data dikembalikan ke seed proposal EcoFresh oleh admin");
    return true;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(this.data); } catch (e) { console.error("Listener error:", e); }
    });
  }

  // === AUDIT LOG ===
  logAudit(action, details, user = "admin") {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const log = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      user: user,
      action: action,
      details: details
    };
    this.data.auditLogs.unshift(log);
    // Keep last 100 logs
    if (this.data.auditLogs.length > 100) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 100);
    }
    this.saveData();
    return log;
  }

  // === AUTHENTICATION ===
  isAuthenticated() {
    try {
      const session = sessionStorage.getItem(this.AUTH_KEY) || localStorage.getItem(this.AUTH_KEY);
      if (!session) return false;
      const parsed = JSON.parse(session);
      return parsed && parsed.isLoggedIn === true;
    } catch (e) {
      return false;
    }
  }

  getCurrentUser() {
    try {
      const session = sessionStorage.getItem(this.AUTH_KEY) || localStorage.getItem(this.AUTH_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  login(email, password, remember = false) {
    // Demo admin credentials & safety validation
    const validEmail = "admin@ecofresh.co.id";
    const validPass = "ecofresh2026";

    if (email.trim().toLowerCase() === validEmail && password === validPass) {
      const sessionData = {
        isLoggedIn: true,
        email: email,
        name: "Admin EcoFresh Bali",
        role: "Super Admin",
        loginTime: new Date().toISOString()
      };
      if (remember) {
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem(this.AUTH_KEY, JSON.stringify(sessionData));
      }
      this.logAudit("ADMIN_LOGIN", `Admin masuk (${email})`);
      return { success: true };
    }
    return { success: false, message: "Email atau kata sandi tidak cocok. Gunakan kredensial demo resmi." };
  }

  logout() {
    const user = this.getCurrentUser();
    this.logAudit("ADMIN_LOGOUT", `Admin keluar (${user?.email || "unknown"})`);
    sessionStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.AUTH_KEY);
    return true;
  }

  // === SETTINGS ===
  getSettings() {
    return this.data.settings || {};
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData();
    this.logAudit("SETTINGS_UPDATED", "Pengaturan brand & kontak diperbarui");
    return this.data.settings;
  }

  // === PRODUCTS ===
  getProducts(includeArchived = false) {
    if (includeArchived) return this.data.products;
    return this.data.products.filter(p => p.isPublished !== false);
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug) {
    return this.data.products.find(p => p.slug === slug);
  }

  saveProduct(productData) {
    const isEdit = !!productData.id;
    let saved;

    if (isEdit) {
      const idx = this.data.products.findIndex(p => p.id === productData.id);
      if (idx !== -1) {
        const old = this.data.products[idx];
        saved = { ...old, ...productData, updatedAt: new Date().toISOString() };
        this.data.products[idx] = saved;
        this.logAudit("PRODUCT_UPDATED", `Produk diperbarui: ${saved.name} (SKU: ${saved.sku})`);
      }
    } else {
      const id = "prod-" + Date.now();
      const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      saved = {
        id,
        slug,
        isPublished: true,
        createdAt: new Date().toISOString(),
        ...productData
      };
      this.data.products.push(saved);
      // Log initial inventory
      if (saved.stock > 0) {
        this.addInventoryMovement(saved.id, saved.name, "initial", saved.stock, saved.stock, "Stok awal produk baru");
      }
      this.logAudit("PRODUCT_CREATED", `Produk baru dibuat: ${saved.name}`);
    }

    this.saveData();
    return saved;
  }

  archiveProduct(id) {
    const p = this.getProductById(id);
    if (p) {
      p.isPublished = false;
      this.saveData();
      this.logAudit("PRODUCT_ARCHIVED", `Produk diarsipkan: ${p.name}`);
      return true;
    }
    return false;
  }

  // === INVENTORY & MOVEMENTS ===
  getInventoryMovements() {
    return this.data.inventoryMovements || [];
  }

  addInventoryMovement(productId, productName, type, quantity, balanceAfter, note) {
    if (!this.data.inventoryMovements) this.data.inventoryMovements = [];
    const movement = {
      id: "inv-" + Date.now() + "-" + Math.random().toString(36).substr(2, 3),
      date: new Date().toISOString().split("T")[0],
      productId,
      productName,
      type, // 'initial', 'stock_in', 'sale', 'adjustment', 'damaged', 'return'
      quantity, // positif untuk masuk, negatif untuk keluar
      balanceAfter,
      user: this.getCurrentUser()?.email || "admin",
      note: note || "-"
    };
    this.data.inventoryMovements.unshift(movement);
    return movement;
  }

  adjustStock(productId, deltaQty, type, note) {
    const prod = this.getProductById(productId);
    if (!prod) throw new Error("Produk tidak ditemukan");

    const newStock = Number(prod.stock) + Number(deltaQty);
    if (newStock < 0) {
      throw new Error(`Stok tidak mencukupi! Stok saat ini ${prod.stock}, penyesuaian ${deltaQty} akan membuat stok negatif.`);
    }

    prod.stock = newStock;
    this.addInventoryMovement(prod.id, prod.name, type, deltaQty, newStock, note);
    this.logAudit("STOCK_ADJUSTED", `${prod.name}: ${deltaQty > 0 ? "+" : ""}${deltaQty} unit (${type}). Sisa stok: ${newStock}`);
    this.saveData();
    return prod;
  }

  // === CUSTOMERS ===
  getCustomers() {
    return this.data.customers || [];
  }

  getOrCreateCustomer(name, phone = "", email = "", city = "", channel = "shopee") {
    if (!this.data.customers) this.data.customers = [];
    const normalizedName = (name || "").trim().toLowerCase();
    let cust = this.data.customers.find(c => c.name.toLowerCase() === normalizedName);

    if (!cust) {
      cust = {
        id: "cust-" + Date.now(),
        name: name || "Pelanggan Anonim",
        phone: phone || "-",
        email: email || "-",
        city: city || "Bali",
        totalOrders: 0,
        totalSpent: 0,
        preferredChannel: channel
      };
      this.data.customers.push(cust);
    }
    return cust;
  }

  // === ORDERS & SALES ===
  getOrders() {
    return this.data.orders || [];
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(orderInput) {
    // Validation
    const prod = this.getProductById(orderInput.productId);
    if (!prod) throw new Error("Produk yang dipilih tidak valid.");

    const qty = parseInt(orderInput.quantity, 10);
    if (isNaN(qty) || qty <= 0) throw new Error("Jumlah unit harus lebih dari 0.");

    // Check stock
    if (prod.stock < qty && orderInput.paymentStatus !== "cancelled") {
      // Warning or soft prevent
      console.warn(`Peringatan: Stok ${prod.name} tersisa ${prod.stock}, pesanan meminta ${qty}.`);
    }

    const unitPrice = parseFloat(orderInput.unitPrice || prod.price);
    const subtotal = unitPrice * qty;
    const discount = parseFloat(orderInput.discount || 0);
    const platformFee = parseFloat(orderInput.platformFee || 0);
    const shippingPaid = parseFloat(orderInput.shippingFeePaidBySeller || 0);
    const unitCogs = parseFloat(orderInput.unitCogs || prod.cogs || 21000);
    const totalCogs = unitCogs * qty;

    // Financial formulas (sesuai standar akuntansi proposal):
    // totalAmount: yang dibayar pembeli (subtotal - discount)
    const totalAmount = Math.max(0, subtotal - discount);
    // netRevenue: totalAmount dikurangi platform fee dan ongkir ditanggung penjual
    const netRevenue = Math.max(0, totalAmount - platformFee - shippingPaid);
    // grossProfit: netRevenue - total HPP
    const grossProfit = netRevenue - totalCogs;

    const customer = this.getOrCreateCustomer(
      orderInput.customerName,
      orderInput.customerPhone,
      orderInput.customerEmail,
      orderInput.customerCity,
      orderInput.channel
    );

    const orderNumber = orderInput.orderNumber || "ORD-" + new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, "0") + "-" + Math.floor(100 + Math.random() * 900);

    // Duplicate check
    const existing = this.data.orders.find(o => o.orderNumber.toUpperCase() === orderNumber.toUpperCase());
    if (existing) {
      throw new Error(`Nomor pesanan ${orderNumber} sudah terdaftar dalam sistem.`);
    }

    const newOrder = {
      id: "ord-" + Date.now(),
      orderNumber,
      date: orderInput.date ? new Date(orderInput.date).toISOString() : new Date().toISOString(),
      customerId: customer.id,
      customerName: customer.name,
      channel: orderInput.channel || "whatsapp",
      channelOrderId: orderInput.channelOrderId || ("CH-" + Math.floor(Math.random() * 10000)),
      productId: prod.id,
      productName: prod.name,
      variant: orderInput.variant || (prod.category === "refill" ? "Refill Pod 8g" : "8g Regular"),
      quantity: qty,
      unitPrice,
      subtotal,
      discount,
      platformFee,
      shippingFeePaidBySeller: shippingPaid,
      unitCogs,
      totalCogs,
      totalAmount,
      netRevenue,
      grossProfit,
      paymentStatus: orderInput.paymentStatus || "paid",
      fulfillmentStatus: orderInput.fulfillmentStatus || "processing",
      notes: orderInput.notes || "",
      statusHistory: [
        {
          status: orderInput.fulfillmentStatus || "processing",
          timestamp: new Date().toISOString(),
          note: "Transaksi dibuat via " + (orderInput.channel || "manual input")
        }
      ]
    };

    // Deduct stock if active
    if (newOrder.fulfillmentStatus !== "cancelled") {
      try {
        this.adjustStock(prod.id, -qty, "sale", `Penjualan pesanan #${newOrder.orderNumber}`);
      } catch (err) {
        console.warn("Stock deduction warning:", err.message);
      }
    }

    // Update customer stats
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + totalAmount;

    this.data.orders.unshift(newOrder);
    this.logAudit("ORDER_CREATED", `Pesanan #${newOrder.orderNumber} dibuat (${newOrder.channel.toUpperCase()} - Rp${newOrder.totalAmount.toLocaleString("id-ID")})`);
    this.saveData();

    return newOrder;
  }

  updateOrderStatus(orderId, newFulfillmentStatus, newPaymentStatus, internalNote = "") {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan.");

    const prevFulfillment = order.fulfillmentStatus;
    const prevPayment = order.paymentStatus;

    if (newFulfillmentStatus) order.fulfillmentStatus = newFulfillmentStatus;
    if (newPaymentStatus) order.paymentStatus = newPaymentStatus;

    // Inventory return logic if cancelled / refunded
    if ((newFulfillmentStatus === "cancelled" || newPaymentStatus === "refunded") && prevFulfillment !== "cancelled" && prevPayment !== "refunded") {
      const prod = this.getProductById(order.productId);
      if (prod) {
        this.adjustStock(prod.id, order.quantity, "return", `Pengembalian stok dari pesanan dibatalkan #${order.orderNumber}`);
      }
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: order.fulfillmentStatus,
      paymentStatus: order.paymentStatus,
      timestamp: new Date().toISOString(),
      note: internalNote || `Status diubah dari [${prevFulfillment}/${prevPayment}] menjadi [${order.fulfillmentStatus}/${order.paymentStatus}]`
    });

    this.logAudit("ORDER_STATUS_CHANGED", `Pesanan #${order.orderNumber}: Status diubah ke ${order.fulfillmentStatus} / ${order.paymentStatus}`);
    this.saveData();
    return order;
  }

  // === SUPPLIERS & IMPACT ===
  getSuppliers() {
    return this.data.suppliers || [];
  }

  getSupplierTransactions() {
    return this.data.supplierTransactions || [];
  }

  addSupplier(supData) {
    if (!this.data.suppliers) this.data.suppliers = [];
    const sup = {
      id: "sup-" + Date.now(),
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      totalMaterialKg: 0,
      totalPayoutIdr: 0,
      ...supData
    };
    this.data.suppliers.push(sup);
    this.logAudit("SUPPLIER_ADDED", `Pemasok lokal baru: ${sup.name} (${sup.location})`);
    this.saveData();
    return sup;
  }

  addSupplierTransaction(txData) {
    if (!this.data.supplierTransactions) this.data.supplierTransactions = [];
    const sup = this.data.suppliers.find(s => s.id === txData.supplierId);
    if (!sup) throw new Error("Pemasok tidak ditemukan.");

    const weightKg = parseFloat(txData.weightKg);
    const pricePerKg = parseFloat(txData.pricePerKg);
    const totalPaid = weightKg * pricePerKg;

    const tx = {
      id: "supt-" + Date.now(),
      date: txData.date || new Date().toISOString().split("T")[0],
      supplierId: sup.id,
      supplierName: sup.name,
      materialType: txData.materialType || sup.category,
      weightKg,
      pricePerKg,
      totalPaid,
      batchCode: txData.batchCode || ("BATCH-" + Math.floor(Math.random() * 1000)),
      status: "verified"
    };

    this.data.supplierTransactions.unshift(tx);

    // Update supplier aggregates
    sup.totalMaterialKg = (sup.totalMaterialKg || 0) + weightKg;
    sup.totalPayoutIdr = (sup.totalPayoutIdr || 0) + totalPaid;

    this.logAudit("RAW_MATERIAL_RECORDED", `Penerimaan ${weightKg}kg bahan baku dari ${sup.name} (Batch: ${tx.batchCode})`);
    this.saveData();
    return tx;
  }

  getSustainabilityMetrics() {
    const txs = this.getSupplierTransactions();
    const suppliers = this.getSuppliers();
    const orders = this.getOrders().filter(o => o.fulfillmentStatus !== "cancelled");

    // Realisasi Limbah
    let kambojaKg = 0;
    let citrusKg = 0;
    let totalPayout = 0;

    txs.forEach(t => {
      const mat = (t.materialType || "").toLowerCase();
      if (mat.includes("kamboja") || mat.includes("bunga")) {
        kambojaKg += Number(t.weightKg || 0);
      } else if (mat.includes("jeruk") || mat.includes("citrus")) {
        citrusKg += Number(t.weightKg || 0);
      } else {
        kambojaKg += Number(t.weightKg || 0) * 0.5;
        citrusKg += Number(t.weightKg || 0) * 0.5;
      }
      totalPayout += Number(t.totalPaid || 0);
    });

    // Refill Pods Sold
    let refillUnitsSold = 0;
    let totalSolidSold = 0;

    orders.forEach(o => {
      const prod = this.getProductById(o.productId);
      if (prod?.category === "refill" || o.productName.toLowerCase().includes("refill")) {
        refillUnitsSold += Number(o.quantity || 0);
      } else if (prod?.category === "bundle" || o.productName.toLowerCase().includes("bundle")) {
        // Bundle mengandung 1 solid dan 1 refill
        refillUnitsSold += Number(o.quantity || 0);
        totalSolidSold += Number(o.quantity || 0);
      } else {
        totalSolidSold += Number(o.quantity || 0);
      }
    });

    // Wadah Kaleng Dihindari = jumlah refill pod terjual (karena menggantikan 1 kemasan kaleng luar baru)
    const avoidedContainers = refillUnitsSold;

    return {
      actual: {
        totalWasteKg: parseFloat((kambojaKg + citrusKg).toFixed(1)),
        kambojaKg: parseFloat(kambojaKg.toFixed(1)),
        citrusKg: parseFloat(citrusKg.toFixed(1)),
        activeSuppliers: suppliers.filter(s => s.status === "active").length,
        totalPayout,
        refillUnitsSold,
        totalSolidSold,
        avoidedContainers
      },
      proposalTargets: this.data.proposalTargets || window.ECO_INITIAL_DATA.proposalTargets
    };
  }

  // === ANALYTICS & FILTERING ===
  filterOrders(filters = {}) {
    let orders = this.getOrders();

    // Channel filter
    if (filters.channel && filters.channel !== "all") {
      orders = orders.filter(o => o.channel === filters.channel);
    }

    // Product filter
    if (filters.productId && filters.productId !== "all") {
      orders = orders.filter(o => o.productId === filters.productId);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      orders = orders.filter(o => o.fulfillmentStatus === filters.status);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let cutoff = new Date(0);

      if (filters.dateRange === "today") {
        cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filters.dateRange === "7d") {
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.dateRange === "30d") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (filters.dateRange === "thisMonth") {
        cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      orders = orders.filter(o => new Date(o.date) >= cutoff);
    }

    return orders;
  }

  getDashboardMetrics(filters = {}) {
    const orders = this.filterOrders(filters);
    const validOrders = orders.filter(o => o.fulfillmentStatus !== "cancelled");

    const grossRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const netRevenue = validOrders.reduce((sum, o) => sum + (o.netRevenue || 0), 0);
    const totalCogs = validOrders.reduce((sum, o) => sum + (o.totalCogs || 0), 0);
    const grossProfit = validOrders.reduce((sum, o) => sum + (o.grossProfit || 0), 0);
    const totalUnits = validOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const orderCount = validOrders.length;
    const aov = orderCount > 0 ? Math.round(grossRevenue / orderCount) : 0;
    const profitMargin = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0;

    // By Channel Breakdown
    const channelMap = {};
    validOrders.forEach(o => {
      const ch = o.channel || "other";
      if (!channelMap[ch]) {
        channelMap[ch] = { revenue: 0, orders: 0, units: 0 };
      }
      channelMap[ch].revenue += o.totalAmount;
      channelMap[ch].orders += 1;
      channelMap[ch].units += o.quantity;
    });

    // By Product Breakdown
    const productMap = {};
    validOrders.forEach(o => {
      const pName = o.productName || "Lainnya";
      if (!productMap[pName]) {
        productMap[pName] = { units: 0, revenue: 0 };
      }
      productMap[pName].units += o.quantity;
      productMap[pName].revenue += o.totalAmount;
    });

    // Solid vs Refill ratio
    let solidUnits = 0;
    let refillUnits = 0;
    validOrders.forEach(o => {
      const p = this.getProductById(o.productId);
      if (p?.category === "refill" || o.productName.toLowerCase().includes("refill")) {
        refillUnits += o.quantity;
      } else if (p?.category === "bundle" || o.productName.toLowerCase().includes("bundle")) {
        solidUnits += o.quantity;
        refillUnits += o.quantity;
      } else {
        solidUnits += o.quantity;
      }
    });

    // Order status count
    const statusMap = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };
    orders.forEach(o => {
      const st = o.fulfillmentStatus || "pending";
      if (statusMap[st] !== undefined) statusMap[st]++;
      else statusMap[st] = 1;
    });

    // Insights
    let bestSellingProduct = "-";
    let maxProdUnits = 0;
    Object.keys(productMap).forEach(k => {
      if (productMap[k].units > maxProdUnits) {
        maxProdUnits = productMap[k].units;
        bestSellingProduct = k;
      }
    });

    let topChannel = "-";
    let maxChRev = 0;
    Object.keys(channelMap).forEach(k => {
      if (channelMap[k].revenue > maxChRev) {
        maxChRev = channelMap[k].revenue;
        topChannel = k.toUpperCase();
      }
    });

    const lowStockProducts = this.data.products.filter(p => p.stock <= p.minStock && p.isPublished !== false);
    const unfulfilledOrdersCount = orders.filter(o => o.fulfillmentStatus === "pending" || o.fulfillmentStatus === "processing").length;

    return {
      kpi: {
        grossRevenue,
        netRevenue,
        orderCount,
        totalUnits,
        aov,
        grossProfit,
        profitMargin,
        totalCogs
      },
      channelBreakdown: channelMap,
      productBreakdown: productMap,
      solidVsRefill: { solid: solidUnits, refill: refillUnits },
      statusBreakdown: statusMap,
      insights: {
        bestSellingProduct,
        topChannel,
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts,
        unfulfilledCount: unfulfilledOrdersCount,
        refillRatioPercent: (solidUnits + refillUnits) > 0 ? Math.round((refillUnits / (solidUnits + refillUnits)) * 100) : 0
      }
    };
  }

  // === CSV IMPORT & EXPORT ===
  exportOrdersToCSV() {
    const orders = this.getOrders();
    const headers = [
      "ID Pesanan",
      "Tanggal",
      "Kanal",
      "ID Kanal Eksternal",
      "Nama Pelanggan",
      "Produk",
      "Varian",
      "Jumlah Unit",
      "Harga Satuan",
      "Subtotal",
      "Diskon",
      "Biaya Platform",
      "Ongkir Penjual",
      "Total Omzet",
      "HPP Total",
      "Pendapatan Bersih",
      "Laba Kotor",
      "Status Pembayaran",
      "Status Pesanan",
      "Catatan"
    ];

    const rows = orders.map(o => [
      `"${o.orderNumber}"`,
      `"${o.date}"`,
      `"${o.channel}"`,
      `"${o.channelOrderId || ""}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.productName.replace(/"/g, '""')}"`,
      `"${o.variant || ""}"`,
      o.quantity,
      o.unitPrice,
      o.subtotal,
      o.discount,
      o.platformFee,
      o.shippingFeePaidBySeller,
      o.totalAmount,
      o.totalCogs,
      o.netRevenue,
      o.grossProfit,
      `"${o.paymentStatus}"`,
      `"${o.fulfillmentStatus}"`,
      `"${(o.notes || "").replace(/"/g, '""')}"`
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  }

  parseAndValidateCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error("File CSV kosong atau tidak memiliki baris data.");
    }

    const headerLine = lines[0];
    const headers = headerLine.split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

    const required = ["ordernumber", "channel", "customername", "productid", "quantity", "unitprice"];
    // Flexible header mapping
    const colIndex = {
      orderNumber: headers.findIndex(h => h.includes("order") || h.includes("nomor")),
      channel: headers.findIndex(h => h.includes("channel") || h.includes("kanal")),
      customerName: headers.findIndex(h => h.includes("customer") || h.includes("pelanggan") || h.includes("nama")),
      productIdentifier: headers.findIndex(h => h.includes("product") || h.includes("produk") || h.includes("sku")),
      quantity: headers.findIndex(h => h.includes("qty") || h.includes("jumlah") || h.includes("quantity")),
      unitPrice: headers.findIndex(h => h.includes("price") || h.includes("harga")),
      discount: headers.findIndex(h => h.includes("discount") || h.includes("diskon")),
      platformFee: headers.findIndex(h => h.includes("fee") || h.includes("biaya")),
      paymentStatus: headers.findIndex(h => h.includes("payment") || h.includes("bayar")),
      fulfillmentStatus: headers.findIndex(h => h.includes("status") && !h.includes("payment"))
    };

    if (colIndex.orderNumber === -1 || colIndex.productIdentifier === -1 || colIndex.quantity === -1) {
      throw new Error("Format CSV tidak sesuai. Minimal kolom yang wajib ada: Nomor Pesanan, Nama Produk/ID, Jumlah (Qty).");
    }

    const validRows = [];
    const errors = [];
    const existingOrderNumbers = new Set(this.data.orders.map(o => o.orderNumber.toUpperCase()));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV tokenizing with quote handling
      const tokens = [];
      let current = "";
      let inQuotes = false;
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          tokens.push(current.trim());
          current = "";
        } else current += char;
      }
      tokens.push(current.trim());

      const orderNum = (tokens[colIndex.orderNumber] || "").replace(/^["']|["']$/g, "").trim();
      if (!orderNum) {
        errors.push(`Baris ${i + 1}: Nomor pesanan kosong.`);
        continue;
      }

      if (existingOrderNumbers.has(orderNum.toUpperCase())) {
        errors.push(`Baris ${i + 1}: Nomor pesanan '${orderNum}' sudah ada di database (duplikat diabaikan).`);
        continue;
      }

      const prodInput = (tokens[colIndex.productIdentifier] || "").replace(/^["']|["']$/g, "").trim();
      let matchedProd = this.getProductById(prodInput) ||
        this.getProductBySlug(prodInput) ||
        this.data.products.find(p => p.sku.toLowerCase() === prodInput.toLowerCase()) ||
        this.data.products.find(p => p.name.toLowerCase().includes(prodInput.toLowerCase()));

      if (!matchedProd) {
        errors.push(`Baris ${i + 1}: Produk '${prodInput}' tidak ditemukan dalam katalog.`);
        continue;
      }

      const qty = parseInt(tokens[colIndex.quantity], 10);
      if (isNaN(qty) || qty <= 0) {
        errors.push(`Baris ${i + 1}: Jumlah unit '${tokens[colIndex.quantity]}' tidak valid.`);
        continue;
      }

      const price = colIndex.unitPrice !== -1 && !isNaN(parseFloat(tokens[colIndex.unitPrice]))
        ? parseFloat(tokens[colIndex.unitPrice])
        : matchedProd.price;

      const discount = colIndex.discount !== -1 && !isNaN(parseFloat(tokens[colIndex.discount]))
        ? parseFloat(tokens[colIndex.discount])
        : 0;

      const fee = colIndex.platformFee !== -1 && !isNaN(parseFloat(tokens[colIndex.platformFee]))
        ? parseFloat(tokens[colIndex.platformFee])
        : 0;

      const channel = colIndex.channel !== -1 && tokens[colIndex.channel]
        ? tokens[colIndex.channel].toLowerCase().replace(/^["']|["']$/g, "").trim()
        : "shopee";

      const custName = colIndex.customerName !== -1 && tokens[colIndex.customerName]
        ? tokens[colIndex.customerName].replace(/^["']|["']$/g, "").trim()
        : "Pelanggan CSV";

      validRows.push({
        orderNumber: orderNum,
        channel: ["shopee", "whatsapp", "instagram", "offline", "b2b"].includes(channel) ? channel : "shopee",
        customerName: custName,
        productId: matchedProd.id,
        productName: matchedProd.name,
        quantity: qty,
        unitPrice: price,
        discount: discount,
        platformFee: fee,
        shippingFeePaidBySeller: 0,
        paymentStatus: colIndex.paymentStatus !== -1 && tokens[colIndex.paymentStatus] ? tokens[colIndex.paymentStatus] : "paid",
        fulfillmentStatus: colIndex.fulfillmentStatus !== -1 && tokens[colIndex.fulfillmentStatus] ? tokens[colIndex.fulfillmentStatus] : "delivered"
      });

      existingOrderNumbers.add(orderNum.toUpperCase());
    }

    return { validRows, errors, totalParsed: lines.length - 1 };
  }

  batchImportOrders(validatedOrders) {
    let successCount = 0;
    validatedOrders.forEach(o => {
      try {
        this.createOrder(o);
        successCount++;
      } catch (err) {
        console.error("Batch import row error:", err);
      }
    });
    this.logAudit("CSV_IMPORT_SUCCESS", `Impor CSV berhasil: ${successCount} transaksi ditambahkan ke database.`);
    return successCount;
  }
}

// Global Store Instance
window.ecoStore = new EcoFreshStore();

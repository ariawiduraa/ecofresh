/**
 * EcoFresh Native Canvas Visual Chart Engine
 * Render grafik interaktif, responsif, dan retina-ready tanpa dependensi eksternal.
 * Menjamin 100% fungsional baik saat offline maupun online.
 */

window.EcoCharts = {
  colors: {
    forest: "#244D36",
    leaf: "#52794B",
    citrus: "#E99A35",
    citrusLight: "#F5B059",
    beige: "#E9DCC8",
    cream: "#F7F2E8",
    darkText: "#242720",
    muted: "#8C9686",
    channels: {
      shopee: "#EE4D2D",
      whatsapp: "#25D366",
      instagram: "#C13584",
      offline: "#244D36",
      b2b: "#E99A35"
    }
  },

  setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 400;
    const height = rect.height || canvas.height || 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  },

  // 1. Line/Area Chart: Tren Omzet
  renderRevenueTrend(canvasId, orders) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    // Group orders by date (last 7 or 14 points)
    const dateMap = {};
    const validOrders = (orders || []).filter(o => o.fulfillmentStatus !== "cancelled");

    validOrders.forEach(o => {
      const d = o.date ? o.date.split("T")[0] : "2026-10-01";
      dateMap[d] = (dateMap[d] || 0) + (o.totalAmount || 0);
    });

    const dates = Object.keys(dateMap).sort();
    if (dates.length === 0) {
      this.renderEmpty(ctx, width, height, "Belum ada transaksi dalam rentang ini");
      return;
    }

    const padding = { top: 30, right: 30, bottom: 40, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = dates.map(d => dateMap[d]);
    const maxVal = Math.max(...values, 100000);

    // Draw Grid Lines
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(82, 121, 75, 0.12)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8C9686";
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "right";

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartH / gridSteps) * i;
      const val = maxVal - (maxVal / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const label = "Rp" + (val >= 1000000 ? (val / 1000000).toFixed(1) + "M" : Math.round(val / 1000) + "k");
      ctx.fillText(label, padding.left - 10, y + 4);
    }

    // Points calculation
    const points = dates.map((d, i) => {
      const x = padding.left + (chartW / Math.max(dates.length - 1, 1)) * i;
      const y = padding.top + chartH - (dateMap[d] / maxVal) * chartH;
      return { x, y, val: dateMap[d], date: d };
    });

    // Draw Area Gradient
    if (points.length > 1) {
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, "rgba(82, 121, 75, 0.35)");
      grad.addColorStop(1, "rgba(82, 121, 75, 0.0)");

      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartH);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = this.colors.leaf;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Dots and Dates
    ctx.textAlign = "center";
    points.forEach((p, idx) => {
      // Circle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = this.colors.forest;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Show bottom date label (stagger if many)
      if (dates.length <= 8 || idx % Math.ceil(dates.length / 8) === 0) {
        const parts = p.date.split("-");
        const formatted = parts[2] + "/" + parts[1];
        ctx.fillStyle = "#555F51";
        ctx.fillText(formatted, p.x, height - 12);
      }
    });
  },

  // 2. Donut Chart: Komposisi Kanal Penjualan
  renderChannelDonut(canvasId, channelData) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    const channels = Object.keys(channelData || {});
    const totalRev = channels.reduce((sum, ch) => sum + (channelData[ch]?.revenue || 0), 0);

    ctx.clearRect(0, 0, width, height);

    if (totalRev === 0 || channels.length === 0) {
      this.renderEmpty(ctx, width, height, "Belum ada transaksi kanal");
      return;
    }

    const centerX = width * 0.38;
    const centerY = height * 0.5;
    const outerRadius = Math.min(centerX - 20, centerY - 20, 75);
    const innerRadius = outerRadius * 0.58;

    let startAngle = -Math.PI / 2;

    channels.forEach(ch => {
      const rev = channelData[ch].revenue || 0;
      if (rev <= 0) return;
      const sliceAngle = (rev / totalRev) * (Math.PI * 2);
      const color = this.colors.channels[ch] || this.colors.citrus;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Inner Text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.colors.forest;
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Total", centerX, centerY - 8);
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#667061";
    ctx.fillText("Rp" + (totalRev >= 1000000 ? (totalRev / 1000000).toFixed(1) + "M" : Math.round(totalRev / 1000) + "k"), centerX, centerY + 10);

    // Legend on Right Side
    const legX = width * 0.72;
    let legY = height * 0.22;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    channels.forEach(ch => {
      const rev = channelData[ch].revenue || 0;
      const percent = Math.round((rev / totalRev) * 100);
      const color = this.colors.channels[ch] || this.colors.citrus;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(legX - 12, legY - 3, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.colors.darkText;
      ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(ch.toUpperCase(), legX, legY);

      ctx.fillStyle = "#8C9686";
      ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`${percent}% (Rp${Math.round(rev / 1000)}k)`, legX, legY + 13);

      legY += 32;
    });
  },

  // 3. Bar Chart: Penjualan per Produk
  renderProductBar(canvasId, productData) {
    const canvas = document.getElementById(canvasId);
    const setup = this.setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);
    const products = Object.keys(productData || {});

    if (products.length === 0) {
      this.renderEmpty(ctx, width, height, "Belum ada data produk terjual");
      return;
    }

    const padding = { top: 20, right: 30, bottom: 45, left: 130 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxUnits = Math.max(...products.map(p => productData[p].units), 5);
    const barHeight = Math.min(22, (chartH / products.length) * 0.65);
    const rowStep = chartH / products.length;

    products.forEach((prodName, i) => {
      const units = productData[prodName].units;
      const barW = (units / maxUnits) * chartW;
      const y = padding.top + rowStep * i + (rowStep - barHeight) / 2;

      // Label on left (truncate if long)
      ctx.fillStyle = this.colors.darkText;
      ctx.font = "500 11px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "right";
      let shortName = prodName.replace("EcoFresh ", "");
      if (shortName.length > 17) shortName = shortName.substr(0, 16) + "…";
      ctx.fillText(shortName, padding.left - 12, y + barHeight * 0.72);

      // Bar Background Track
      ctx.fillStyle = "rgba(82, 121, 75, 0.1)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(padding.left, y, chartW, barHeight, 4) : ctx.rect(padding.left, y, chartW, barHeight);
      ctx.fill();

      // Filled Bar
      const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
      grad.addColorStop(0, this.colors.forest);
      grad.addColorStop(1, this.colors.leaf);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(padding.left, y, Math.max(barW, 4), barHeight, 4) : ctx.rect(padding.left, y, Math.max(barW, 4), barHeight);
      ctx.fill();

      // Number of units
      ctx.fillStyle = this.colors.forest;
      ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${units} unit`, padding.left + barW + 8, y + barHeight * 0.72);
    });
  },

  // 4. Solid vs Refill Progress Card
  renderSolidVsRefill(containerId, solidUnits, refillUnits) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = (solidUnits || 0) + (refillUnits || 0);
    const refillPercent = total > 0 ? Math.round((refillUnits / total) * 100) : 0;
    const solidPercent = 100 - refillPercent;

    container.innerHTML = `
      <div class="flex items-center justify-between text-xs font-semibold mb-2">
        <span class="flex items-center gap-1.5 text-forest">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-forest"></span>
          Solid Utama: ${solidUnits} unit (${solidPercent}%)
        </span>
        <span class="flex items-center gap-1.5 text-citrus">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-citrus"></span>
          Refill Pod: ${refillUnits} unit (${refillPercent}%)
        </span>
      </div>
      <div class="w-full bg-[#E5E9E2] h-4 rounded-full overflow-hidden flex shadow-inner">
        <div style="width: ${solidPercent}%" class="bg-forest h-full transition-all duration-500" title="Solid Utama: ${solidUnits}"></div>
        <div style="width: ${refillPercent}%" class="bg-citrus h-full transition-all duration-500" title="Refill Pod: ${refillUnits}"></div>
      </div>
      <p class="text-[11px] text-[#697465] mt-2.5 leading-relaxed">
        🌱 <strong>Rasio Sirkular:</strong> Setiap pembelian refill pod menghemat biaya wadah baru dan secara langsung mencegah penumpukan kemasan kaleng di alam.
      </p>
    `;
  },

  renderEmpty(ctx, width, height, message) {
    ctx.fillStyle = "#A3ACA0";
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message || "Tidak ada data untuk ditampilkan", width / 2, height / 2);
  }
};

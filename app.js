const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.target).classList.add("active");
  });
});

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const fmt = (v, d = 2) => n(v).toLocaleString("ar-SA", { maximumFractionDigits: d });

function peLabel(pe) {
  if (pe > 0 && pe < 10) return { label: "ممتاز", cls: "pe-excellent" };
  if (pe >= 10 && pe < 15) return { label: "جيد", cls: "pe-good" };
  if (pe >= 15 && pe < 20) return { label: "عادل", cls: "pe-fair" };
  if (pe >= 20 && pe < 30) return { label: "مرتفع", cls: "pe-high" };
  if (pe >= 30) return { label: "مبالغ فيه", cls: "pe-overpriced" };
  return { label: "غير واضح", cls: "pe-fair" };
}

function getPeData() {
  const stockName = document.getElementById("stockName").value.trim() || "السهم";
  const price = n(document.getElementById("pePrice").value);
  const q = n(document.getElementById("quarterEps").value);
  const yearly = q * 4;
  const pe = yearly ? price / yearly : 0;
  const tag = peLabel(pe);
  const targetLevels = [12, 15, 17, 19, 25, 27];
  const targets = targetLevels.map((level) => ({ level, price: level * yearly }));
  return { stockName, price, q, yearly, pe, tag, targets };
}

function calcDeals() {
  const shares = n(document.getElementById("shares").value);
  const buyPrice = n(document.getElementById("buyPrice").value);
  const sellPrice = n(document.getElementById("sellPrice").value);
  const commission = n(document.getElementById("commission").value);
  const tax = n(document.getElementById("tax").value);

  const buyComm = shares * buyPrice * commission;
  const buyTax = 0.00123 * tax * (shares * buyPrice);
  const totalBuy = shares * buyPrice + buyComm + buyTax;

  const sellComm = shares * sellPrice * commission;
  const sellTax = 0.00123 * tax * (shares * sellPrice);
  const totalSell = shares * sellPrice - (sellComm + sellTax);

  const net = totalSell - totalBuy;
  const status = net >= 0 ? "ربح" : "خسارة";
  document.getElementById("dealsResult").innerHTML = `
    إجمالي الشراء: ${fmt(totalBuy)}<br>
    إجمالي البيع: ${fmt(totalSell)}<br>
    ${status}: <strong>${fmt(net)}</strong>
  `;
}

function calcPe() {
  const { stockName, q, yearly, pe, tag, targets } = getPeData();

  document.getElementById("yearlyEps").value = yearly ? yearly.toFixed(4) : "";
  document.getElementById("targetPe").value = pe ? pe.toFixed(2) : "";

  const rangeRows = [
    { text: "ممتاز جدًا < 10", cls: "pe-excellent" },
    { text: "ممتاز 10 - 13", cls: "pe-good" },
    { text: "جيد 14 - 16", cls: "pe-fair" },
    { text: "جيد 17 - 18", cls: "pe-high" },
    { text: "عادي 19 - 25", cls: "pe-overpriced" },
    { text: "سيء 26 - 28", cls: "pe-bad" },
    { text: "سيء جدًا > 28", cls: "pe-worst" },
  ];
  const rangesHtml = rangeRows
    .map((row) => `<tr class="${row.cls}"><td>${row.text}</td></tr>`)
    .join("");
  const targetRows = targets
    .map((item) => `<tr><td>${item.level}</td><td>${fmt(item.price, 2)}</td></tr>`)
    .join("");

  document.getElementById("peResult").innerHTML = `
    <div class="pe-board">
      <div class="pe-board-title">استراتيجية المخضرم لتقييم سعر السهم المستهدف</div>
      <div class="pe-board-grid">
        <div class="pe-card">
          <div class="pe-card-head">معلومات الشركة</div>
          <table class="pe-table">
            <tr><th>البند</th><th>القيمة</th></tr>
            <tr><td>اسم الشركة</td><td>${stockName}</td></tr>
            <tr><td>سعر السهم</td><td>${fmt(price, 2)}</td></tr>
            <tr><td>ربحية السهم لآخر ربع معلن</td><td>${fmt(q, 4)}</td></tr>
            <tr><td>ربحية السهم للسنة</td><td>${fmt(yearly, 4)}</td></tr>
            <tr><td>مكرر الربحية</td><td><strong>${fmt(pe, 2)}</strong></td></tr>
          </table>
        </div>

        <div class="pe-card">
          <div class="pe-card-head">نطاق تقييم مكرر الربحية</div>
          <table class="pe-table pe-range-table">
            ${rangesHtml}
          </table>
          <p class="pe-tag-line">التصنيف الحالي: <span class="pe-badge ${tag.cls}">${tag.label}</span></p>
        </div>

        <div class="pe-card">
          <div class="pe-card-head">المستهدف</div>
          <table class="pe-table pe-target-table">
            <tr><th>المكرر</th><th>عند سعر</th></tr>
            ${targetRows}
          </table>
        </div>
      </div>
      <p class="pe-credits">
        استراتيجية المخضرم هنا مطبقة على حساب مكرر الربحية فقط.
        حساب المخضرم في X: <a href="https://x.com/SenseiFund" target="_blank" rel="noreferrer">@SenseiFund</a>
        | حساب الكبريت في X: <a href="https://x.com/alkbrett" target="_blank" rel="noreferrer">@alkbrett</a>
      </p>
    </div>
  `;
}

function renderPeShareCard() {
  const { stockName, q, yearly, pe, tag, targets } = getPeData();
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0b1528";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#163867");
  grad.addColorStop(1, "#0d1930");
  ctx.fillStyle = grad;
  ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = "#f6f2e8";
  ctx.font = "bold 50px Segoe UI";
  ctx.textAlign = "right";
  ctx.fillText("الكبريت | مكرر الربحية", 1120, 95);
  ctx.font = "30px Segoe UI";
  ctx.fillStyle = "#ffe8bd";
  ctx.fillText(`السهم: ${stockName}`, 1120, 150);

  ctx.fillStyle = "#f6f2e8";
  ctx.font = "28px Segoe UI";
  ctx.fillText(`ربحية آخر ربع: ${fmt(q, 4)}`, 1120, 220);
  ctx.fillText(`ربحية السنة: ${fmt(yearly, 4)}`, 1120, 265);
  ctx.fillText(`مكرر الربحية المستهدف: ${fmt(pe, 2)}`, 1120, 310);
  ctx.fillText(`التصنيف: ${tag.label}`, 1120, 355);

  ctx.font = "24px Segoe UI";
  ctx.fillStyle = "#ffd896";
  ctx.fillText("المستهدفات:", 1120, 410);
  ctx.fillStyle = "#f6f2e8";
  targets.forEach((t, i) => {
    ctx.fillText(`${t.level}x = ${fmt(t.price, 2)}`, 1120, 445 + i * 28);
  });

  // علامة مائية
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 70px Segoe UI";
  ctx.fillText("@alkbrett", 1120, 595);
  ctx.globalAlpha = 1;

  return canvas;
}

function downloadPeImage() {
  const canvas = renderPeShareCard();
  const link = document.createElement("a");
  link.download = `alkebreet-pe-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function shareOnX() {
  const { stockName, pe, tag } = getPeData();
  const text = `نتيجة ${stockName}\nمكرر الربحية المستهدف: ${fmt(pe, 2)}\nالتصنيف: ${tag.label}\n#الكبريت #الاسهم`;
  const canvas = renderPeShareCard();

  if (navigator.canShare && navigator.share) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) {
      const file = new File([blob], "alkebreet-pe.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    }
  }

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function calcAverage() {
  const qty = [...document.querySelectorAll(".qty")].map((el) => n(el.value));
  const price = [...document.querySelectorAll(".price")].map((el) => n(el.value));
  let value = 0;
  let totalQty = 0;
  for (let i = 0; i < qty.length; i += 1) {
    value += qty[i] * price[i];
    totalQty += qty[i];
  }
  const avg = totalQty ? value / totalQty : 0;
  document.getElementById("avgResult").innerHTML = `
    إجمالي الكمية: ${fmt(totalQty, 0)}<br>
    متوسط السعر: <strong>${fmt(avg, 4)}</strong>
  `;
}

function calcBuy() {
  const budget = n(document.getElementById("budget").value);
  const stockPrice = n(document.getElementById("stockPrice").value);
  const shares = stockPrice ? budget / stockPrice : 0;
  document.getElementById("buyResult").innerHTML = `عدد الأسهم الممكن شراؤها: <strong>${fmt(shares, 2)}</strong>`;
}

function calcClean() {
  const shares = n(document.getElementById("cleanShares").value);
  const per = n(document.getElementById("cleanPerShare").value);
  document.getElementById("cleanResult").innerHTML = `مبلغ التطهير: <strong>${fmt(shares * per, 4)}</strong>`;
}

document.body.addEventListener("input", () => {
  calcDeals();
  calcPe();
  calcAverage();
  calcBuy();
  calcClean();
});

calcDeals();
calcPe();
calcAverage();
calcBuy();
calcClean();

document.getElementById("savePeImage").addEventListener("click", downloadPeImage);
document.getElementById("sharePeX").addEventListener("click", () => {
  shareOnX().catch(() => {
    window.open("https://twitter.com/intent/tweet", "_blank");
  });
});

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
  const stockName = document.getElementById("stockName").value.trim() || "السهم";
  const price = n(document.getElementById("pePrice").value);
  const q = n(document.getElementById("quarterEps").value);
  const yearly = q * 4;
  // مطابق لمعادلة الإكسل: =IFERROR((E13/E15),"")
  const pe = yearly ? price / yearly : 0;

  document.getElementById("yearlyEps").value = yearly ? yearly.toFixed(4) : "";
  document.getElementById("targetPe").value = pe ? pe.toFixed(2) : "";

  let label = "غير واضح";
  let cls = "pe-fair";
  if (pe > 0 && pe < 10) {
    label = "ممتاز";
    cls = "pe-excellent";
  } else if (pe >= 10 && pe < 15) {
    label = "جيد";
    cls = "pe-good";
  } else if (pe >= 15 && pe < 20) {
    label = "عادل";
    cls = "pe-fair";
  } else if (pe >= 20 && pe < 30) {
    label = "مرتفع";
    cls = "pe-high";
  } else if (pe >= 30) {
    label = "مبالغ فيه";
    cls = "pe-overpriced";
  }

  // مستويات السعر المستهدف مثل الإكسل (Q13:Q18 = المضاعف * ربحية السنة)
  const targetLevels = [12, 15, 17, 19, 25, 27];
  const targetsHtml = targetLevels
    .map((level) => `<li>مستهدف ${level}x: <strong>${fmt(level * yearly, 2)}</strong></li>`)
    .join("");

  document.getElementById("peResult").innerHTML = `
    اسم السهم: <strong>${stockName}</strong><br>
    ربحية السهم (آخر ربع معلن): ${fmt(q, 4)}<br>
    ربحية سنوية: ${fmt(yearly, 4)}<br>
    مكرر الربحية (المستهدف): <strong>${fmt(pe, 2)}</strong><br>
    التصنيف: <span class="pe-badge ${cls}">${label}</span>
    <div class="target-box">
      أسعار مستهدفة مبنية على ربحية السنة:
      <ul>${targetsHtml}</ul>
    </div>
    <div class="pe-ranges">
      نطاق تقييم المكرر:
      <ul>
        <li><span class="pe-badge pe-excellent">ممتاز</span> أقل من 10</li>
        <li><span class="pe-badge pe-good">جيد</span> من 10 إلى أقل من 15</li>
        <li><span class="pe-badge pe-fair">عادل</span> من 15 إلى أقل من 20</li>
        <li><span class="pe-badge pe-high">مرتفع</span> من 20 إلى أقل من 30</li>
        <li><span class="pe-badge pe-overpriced">مبالغ فيه</span> 30 فأكثر</li>
      </ul>
    </div>
  `;
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

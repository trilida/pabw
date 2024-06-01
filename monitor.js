function loadTradingViewWidget(symbols) {
  const scriptElement = document.createElement("script");
  scriptElement.type = "text/javascript";
  scriptElement.async = true;
  scriptElement.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

  const config = {
    autosize: true,
    symbols: symbols,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    allow_symbol_change: true,
    calendar: false,
    support_host: "https://www.tradingview.com",
  };

  scriptElement.innerHTML = JSON.stringify(config);

  const container = document.querySelector(
    ".tradingview-widget-container__widget"
  );
  if (container) {
    container.appendChild(scriptElement);
  }
}

function getStoredSymbols() {
  // Mengambil simbol dari localStorage atau menetapkan beberapa default
  const defaultSymbols = [
    { description: "", proName: "NASDAQ:AAPL" },
    { description: "", proName: "NASDAQ:TSLA" },
    { description: "", proName: "NASDAQ:GOOGL" },
    { description: "", proName: "NASDAQ:AMZN" },
    { description: "", proName: "NASDAQ:MSFT" },
    { description: "", proName: "NASDAQ:FB" },
  ];

  const stored = localStorage.getItem("watchlistSymbols");
  return stored ? JSON.parse(stored) : defaultSymbols.slice(0, 6);
}

function setupPage() {
  const symbols = getStoredSymbols();
  loadTradingViewWidget(symbols);
}

document.addEventListener("DOMContentLoaded", setupPage);

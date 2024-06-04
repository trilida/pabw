const url =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const parameters = { start: "1", limit: "100", convert: "IDR" };
const headers = new Headers({
  Accept: "application/json",
  "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
});
const qs = new URLSearchParams(parameters);
const requestUrl = `${url}?${qs.toString()}`;

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("currencyPair")
    .addEventListener("change", loadWatchlist);

  fetchData();
  loadWatchlist();

  function loadWatchlist() {
    let selectedCoins = JSON.parse(
      localStorage.getItem("selectedCoins") || "{}"
    );
    let portfolioTableBody = document.getElementById("portfolioTableBody");
    portfolioTableBody.innerHTML = ""; // Clear all content in tbody

    const currencyPair = document.getElementById("currencyPair").value;

    Object.keys(selectedCoins).forEach((symbol) => {
      let coin = selectedCoins[symbol];
      const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`; // URL gambar logo
      let row = document.createElement("tr");
      row.innerHTML = `
          <td>${coin.name}</td>
          <td>
            <img src="${logoUrl}" alt="${symbol}" width="32" height="32">
            ${symbol}
          </td>
          <td>${coin.price.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}</td>
          <td>${coin.price1h}</td>
          <td>${coin.price2h}</td>
          <td>
              <button id="button" onclick="window.location.href='detailcoin.html?symbol=${symbol}&name=${
        coin.name
      }'" class="detail-btn">Detail</button>
              <button id="button" onclick="removeFromWatchlist('${symbol}')" class="delete-btn">Delete</button>
          </td>
          <td>
              <div class="tradingview-widget-container" id="tradingview_${symbol}">
                  <div class="tradingview-widget-container__widget"></div>
              </div>
          </td>
      `;
      portfolioTableBody.appendChild(row);

      // Initialize TradingView widget for each coin
      initializeTradingViewWidget(symbol, currencyPair);
    });
  }

  window.removeFromWatchlist = function (symbol) {
    let selectedCoins = JSON.parse(
      localStorage.getItem("selectedCoins") || "{}"
    );
    delete selectedCoins[symbol];
    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
    loadWatchlist(); // Refresh the watchlist display
  };
});

function initializeTradingViewWidget(symbol, currency) {
  const containerId = `tradingview_${symbol}`;
  const container = document.getElementById(containerId);

  // Clear any existing widget to avoid duplicate widgets
  container.innerHTML = `<div class="tradingview-widget-container__widget"></div>`;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
  script.async = true;
  script.innerHTML = `
  {
    "symbol": "BINANCE:${symbol}${currency}",
    "width": "100%",
    "height": "100%",
    "locale": "en",
    "dateRange": "1D",
    "colorTheme": "light",
    "trendLineColor": "rgba(152, 0, 255, 1)",
    "underLineColor": "rgba(152, 0, 255, 1)",
    "underLineBottomColor": "rgba(0, 255, 255, 0)",
    "isTransparent": false,
    "autosize": true,
    "largeChartUrl": "",
    "chartOnly": false,
    "noTimeScale": false
  }`;

  container.appendChild(script);

  // Check if the symbol is valid and available
  script.onerror = function () {
    container.innerHTML = `<div class="alert alert-danger" role="alert">
      Chart for ${symbol}${currency} is not available.
    </div>`;
  };
}

function fetchData() {
  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      let selectedCoins = JSON.parse(
        localStorage.getItem("selectedCoins") || "{}"
      );
      data.data.forEach((coin) => {
        if (selectedCoins[coin.symbol]) {
          selectedCoins[coin.symbol] = {
            ...selectedCoins[coin.symbol],
            id: coin.id, // Add coin ID to get logo URL
            name: coin.name,
            price: coin.quote.IDR.price,
            price1h: coin.quote.IDR.percent_change_1h.toFixed(2) + " %",
            price2h: coin.quote.IDR.percent_change_24h.toFixed(2) + " %",
          };
        }
      });
      localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
      loadWatchlist();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

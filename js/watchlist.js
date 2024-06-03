document.addEventListener("DOMContentLoaded", function () {
  fetchData();
  loadWatchlist();

  function loadWatchlist() {
    let selectedCoins = JSON.parse(
      localStorage.getItem("selectedCoins") || "{}"
    );
    let portfolioTableBody = document.getElementById("portfolioTableBody");
    portfolioTableBody.innerHTML = "";

    Object.keys(selectedCoins).forEach((symbol) => {
      let coin = selectedCoins[symbol];
      let row = document.createElement("tr");
      row.innerHTML = `
                <td>${coin.name}</td>
                <td>${symbol}</td>
                <td>${coin.price.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}</td>
                <td>${coin.price1h}</td>
                <td>${coin.price2h}</td>
                <td>
                    <div class="tradingview-widget-container">
                        <div class="tradingview-widget-container__widget"></div>
                        <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>
                        {
                            "symbol": "BINANCE:${symbol}USDT",
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
                        }
                        </script>
                    </div>
                </td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewDetail('${symbol}')">Detail</button>
                    <button class="btn btn-danger btn-sm" onclick="removeFromWatchlist('${symbol}')">Delete</button>
                </td>
            `;
      portfolioTableBody.appendChild(row);
    });
  }

  window.viewDetail = function (symbol) {
    alert(`View details for ${symbol}`);
  };

  window.removeFromWatchlist = function (symbol) {
    let selectedCoins = JSON.parse(
      localStorage.getItem("selectedCoins") || "{}"
    );
    delete selectedCoins[symbol];
    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
    loadWatchlist();
  };
});

const url =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const parameters = { start: "1", limit: "100", convert: "IDR" };
const headers = new Headers({
  Accept: "application/json",
  "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
});
const qs = new URLSearchParams(parameters);
const requestUrl = `${url}?${qs.toString()}`;

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

// Konfigurasi awal URL API dan parameter yang diperlukan untuk permintaan.
const url =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const parameters = { start: "1", limit: "100", convert: "IDR" };
const headers = new Headers({
  Accept: "application/json",
  "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
});
const qs = new URLSearchParams(parameters);
const requestUrl = `${url}?${qs.toString()}`;

// Event listener untuk menangani ketika DOM sudah sepenuhnya dimuat.
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("currencyPair")
    .addEventListener("change", loadWatchlist);

  // Memanggil fungsi fetchData dan loadWatchlist pada saat halaman dimuat.
  fetchData();
  loadWatchlist();

  // Fungsi untuk memuat ulang dan menampilkan watchlist.
  function loadWatchlist() {
    let selectedCoins = JSON.parse(
      localStorage.getItem("selectedCoins") || "{}"
    );
    let portfolioTableBody = document.getElementById("portfolioTableBody");
    portfolioTableBody.innerHTML = ""; // Mengosongkan isi tabel saat ini.

    const currencyPair = document.getElementById("currencyPair").value;

    Object.keys(selectedCoins).forEach((symbol) => {
      //untuk bikin array yang berisi data data dari selectedCoins
      let coin = selectedCoins[symbol];
      const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`;
      let row = document.createElement("tr"); // let row ini itu untuk menyimpan elemen tabel baris (<tr>) yang baru dibuat.  sedangkan document.createElement('tr') digunakan untuk membuat elemen <tr> baru.
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
      portfolioTableBody.appendChild(row); //portfolioTableBody.appendChild(row); dijalankan, elemen row (yang berisi data dan elemen HTML untuk satu koin) ditambahkan ke akhir dari elemen portfolioTableBody. Ini efektif menambahkan satu baris penuh ke tabel di halaman.

      // Memanggil fungsi untuk inisialisasi widget TradingView untuk setiap koin.
      initializeTradingViewWidget(symbol, currencyPair);
    });
  }

  // Fungsi untuk menghapus koin dari watchlist yang disimpan di localStorage.
  // window itu halamannya, removefromwatchlist
  window.removeFromWatchlist = function (symbol) {
    let selectedCoins = JSON.parse(
      localStorage.getItem("selectedCoins") || "{}"
    );
    delete selectedCoins[symbol];
    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
    loadWatchlist();
  };
});

// Fungsi untuk menginisialisasi widget TradingView.
function initializeTradingViewWidget(symbol, currency) {
  const containerId = `tradingview_${symbol}`;
  const container = document.getElementById(containerId);

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

  // Penanganan jika widget tidak dapat dimuat atau ada kesalahan.
  script.onerror = function () {
    container.innerHTML = `<div class="alert alert-danger" role="alert">
      Chart for ${symbol}${currency} is not available.
    </div>`;
  };
}

// Fungsi untuk meminta data kripto dari API dan menyimpan hasilnya di localStorage.
function fetchData() {
  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((crypto) => {
      let selectedCoins = JSON.parse(
        localStorage.getItem("selectedCoins") || "{}"
      );
      crypto.data.forEach((coin) => {
        if (selectedCoins[coin.symbol]) {
          selectedCoins[coin.symbol] = {
            ...selectedCoins[coin.symbol],
            id: coin.id,
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

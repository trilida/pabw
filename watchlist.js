document.addEventListener("DOMContentLoaded", function () {
  loadWatchlist();

  function loadWatchlist() {
    let selectedCoins = localStorage.getItem("selectedCoins")
      ? JSON.parse(localStorage.getItem("selectedCoins"))
      : {};
    let watchlistData = document.getElementById("watchlistData");
    watchlistData.innerHTML = `
      <h2>Your Watchlist</h2>
      <table>
        <tr>
          <th>Name</th>
          <th>Symbol</th>
          <th>Price 1h</th>
          <th>Price 2h</th>
          <th>Price 1d</th>
          <th>Actions</th>
        </tr>`;

    Object.keys(selectedCoins).forEach((symbol) => {
      let coin = selectedCoins[symbol];
      let name = coin.name;
      let price1h = coin.price1h;
      let price2h = coin.price2h;
      let price1d = coin.price1d;
      watchlistData.innerHTML += `
        <tr>
          <td>${name}</td>
          <td>${symbol}</td>
          <td>${price1h}</td>
          <td>${price2h}</td>
          <td>${price1d}</td>
          <td>
            <button onclick="window.location.href='detailcoin.html?symbol=${symbol}&name=${name}'">Detail</button>
            <button onclick="removeFromWatchlist('${symbol}')" class="delete-btn">Delete</button>
          </td>
        </tr>`;
    });

    watchlistData.innerHTML += `</table>`;
  }

  window.removeFromWatchlist = function (symbol) {
    let selectedCoins = localStorage.getItem("selectedCoins")
      ? JSON.parse(localStorage.getItem("selectedCoins"))
      : {};
    delete selectedCoins[symbol];
    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
    loadWatchlist(); // Refresh the watchlist display
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
let selectedCoins = JSON.parse(localStorage.getItem("selectedCoins")) || {}; // Menyimpan koin yang di-checklist

function fetchData() {
  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      data.data.forEach((koin) => {
        if (selectedCoins[koin.symbol]) {
          selectedCoins[koin.symbol] = {
            name: koin.name,
            price1h: koin.quote.IDR.percent_change_1h.toFixed(2) + " %",
            price2h: koin.quote.IDR.percent_change_24h.toFixed(2) + " %",
            price1d: koin.quote.IDR.percent_change_24h.toFixed(2) + " %",
          };
        }
      });
      localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
      updateDOM(data);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

fetchData();

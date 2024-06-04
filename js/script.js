const url =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const parameters = {
  start: "1",
  limit: "500",
  convert: "IDR",
};
const headers = new Headers({
  Accept: "application/json",
  "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
});

let selectedCoins = JSON.parse(localStorage.getItem("selectedCoins")) || {};

function fetchData() {
  const qs = new URLSearchParams(parameters);
  const requestUrl = `${url}?${qs.toString()}`;

  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((crypto) => {
      updateDOM(crypto.data);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function updateDOM(coins) {
  const displayDiv = document.getElementById("cryptoData");
  let tableHTML = `<table class="table table-striped table-bordered">
    <thead class="thead-dark">
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>Symbol</th>
        <th>Price (IDR)</th>
        <th>Volume (IDR)</th>
        <th>1h (%)</th>
        <th>24h (%)</th>
        <th>Watchlist</th>
      </tr>
    </thead>
    <tbody>`;

  coins.forEach((coin) => {
    const isChecked = selectedCoins[coin.symbol] ? "checked" : "";
    const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`; //ini buat nampilin logo sesuai id nya 

    tableHTML += `<tr>
      <td>${coin.cmc_rank}</td>
      <td>${coin.name}</td>
      <td>
        <img src="${logoUrl}" alt="${coin.symbol}" width="30" height="30">
        ${coin.symbol}
      </td>
      <td>${coin.quote.IDR.price.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      })}</td>
      <td>${coin.quote.IDR.volume_24h.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      })}</td>
      <td>${coin.quote.IDR.percent_change_1h.toFixed(2)}%</td>
      <td>${coin.quote.IDR.percent_change_24h.toFixed(2)}%</td>
      <td><input type="checkbox" class="watchlist-checkbox" data-symbol="${
        coin.symbol
      }" data-name="${coin.name}" ${isChecked}></td>
    </tr>`;
  });

  tableHTML += `</tbody></table>`;
  displayDiv.innerHTML = tableHTML;

  const checkboxes = document.querySelectorAll(".watchlist-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        selectedCoins[this.dataset.symbol] = {
          name: this.dataset.name,
          symbol: this.dataset.symbol,
          price: 0, // Placeholder value, will be updated on fetch
          price1h: "0 %",
          price2h: "0 %",
        };
      } else {
        delete selectedCoins[this.dataset.symbol];
      }
      localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
    });
  });
}

document.getElementById("searchInput").addEventListener("input", searchCrypto);

function searchCrypto() {
  const searchText = document.getElementById("searchInput").value.toUpperCase();
  if (searchText.length < 1) {
    fetchData(); // Kembali ke kondisi awal jika input kosong
    return;
  }

  const qs = new URLSearchParams(parameters);
  const requestUrl = `${url}?${qs.toString()}`;

  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((crypto) => {
      const filteredCoins = crypto.data.filter(
        (coin) =>
          coin.symbol.includes(searchText) ||
          coin.name.toUpperCase().includes(searchText)
      );
      updateDOM(filteredCoins);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

fetchData();

const url =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const infoUrl = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info";
const parameters = {
  start: "1",
  limit: "500", // Default limit
  convert: "IDR",
};
const headers = new Headers({
  Accept: "application/json",
  "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
});

let selectedCoins = JSON.parse(localStorage.getItem("selectedCoins")) || {}; // Menyimpan koin yang di-checklist

function fetchData() {
  const qs = new URLSearchParams(parameters);
  const requestUrl = `${url}?${qs.toString()}`;

  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (document.getElementById("filterCategory").value) {
        applyCategoryFilter(data.data);
      } else {
        updateDOM(data.data);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function applyCategoryFilter(coins) {
  const category = document.getElementById("filterCategory").value;
  const symbols = coins.map((coin) => coin.symbol).join(",");

  fetch(
    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?symbol=${symbols}`,
    {
      method: "GET",
      headers: headers,
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const filteredCoins = coins.filter((coin) => {
        const coinData = data.data[coin.symbol];
        return (
          (category === "coin" && coinData.category === "coin") ||
          (category === "token" && coinData.category === "token")
        );
      });
      updateDOM(filteredCoins);
    })
    .catch((error) => {
      console.error("Error fetching coin categories:", error);
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
    const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`; // URL gambar logo

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
    .then((data) => {
      const filteredCoins = data.data.filter(
        (koin) =>
          koin.symbol.includes(searchText) ||
          koin.name.toUpperCase().includes(searchText)
      );
      updateDOM(filteredCoins);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function updateRowsPerPage() {
  const rowsPerPage = document.getElementById("rowsPerPage").value;
  parameters.limit = rowsPerPage;
  fetchData();
}

function applyFilters() {
  // Apply filters based on user selection
  const marketCapFilter = document.getElementById("filterMarketCap").value;
  const volumeFilter = document.getElementById("filterVolume").value;
  const categoryFilter = document.getElementById("filterCategory").value;

  // Add your filtering logic here
  // For simplicity, we assume fetching data again with applied filters
  // You might want to add more logic to filter the fetched data on the client side

  fetchData(); // Fetch data again with applied filters
}

fetchData();

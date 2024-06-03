const url =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
const parameters = { 
  start: "1", 
  limit: "100", 
  convert: "IDR" };
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
      updateDOM(data);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function updateDOM(koin) {
  const displayDiv = document.getElementById("cryptoData");
  let tableHTML = `<table>
    <tr>
      <th>Name</th>
      <th>Symbol</th>
      <th>Price (IDR)</th>
      <th>Volume (IDR)</th>
      <th>1h (%)</th>
      <th>24h (%)</th>
      <th>Watchlist</th>
    </tr>`;

  koin.data.forEach((koin) => {
    const isChecked = selectedCoins[koin.symbol] ? "checked" : "";
    tableHTML += `<tr>
      <td>${koin.name}</td>
      <td>${koin.symbol}</td>
      <td>${koin.quote.IDR.price.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      })}</td>
      <td>${koin.quote.IDR.volume_24h.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      })}</td>
      <td>${koin.quote.IDR.percent_change_1h.toFixed(2)} %</td>
      <td>${koin.quote.IDR.percent_change_24h.toFixed(2)} %</td>
      <td><input type="checkbox" class="watchlist-checkbox" data-symbol="${
        koin.symbol
      }" data-name="${koin.name}" ${isChecked}></td>
    </tr>`;
  });

  tableHTML += "</table>";
  displayDiv.innerHTML = tableHTML;

  const checkboxes = document.querySelectorAll(".watchlist-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        selectedCoins[this.dataset.symbol] = this.dataset.name;
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

  fetch(requestUrl, { method: "GET", headers: headers })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const filteredCoins = data.data.filter(
        (koin) =>
          koin.symbol.includes(searchText) ||
          koin.name.toUpperCase().includes(searchText)
      );
      updateDOM({ data: filteredCoins });
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function fetchCoinDetail(symbol) {
  const apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol}`;
  fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.data && data.data[symbol]) {
        updateModal(data.data[symbol]);
      }
    })
    .catch((error) => console.error("Error fetching coin details: ", error));
}

function goToWatchlist() {
  window.location.href = "watchlist.html";
}

fetchData();

// Menetapkan listener yang akan dieksekusi setelah konten DOM sepenuhnya dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Menginisialisasi array dan objek dari data penyimpanan lokal untuk menyimpan coins dan portfolio
  let coins = [];
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  const portfolioTableBody = document.getElementById("portfolioTableBody");
  const totalAmountIDR = document.getElementById("totalAmountIDR");

  // Fungsi untuk mengambil data cryptocurrency dari API CoinMarketCap
  function fetchData() {
    const apiUrl =
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
    const params = new URLSearchParams({
      start: "1",
      limit: "500",
      convert: "IDR",
    });
    const headers = {
      "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
      Accept: "application/json",
    };

    fetch(`${apiUrl}?${params}`, { headers })
      .then((response) => response.json())
      .then((data) => {
        if (data.status.error_code !== 0)
          throw new Error(data.status.error_message);
        coins = data.data;
        displayPortfolio(); // Memperbarui UI dengan data baru
      })
      .catch((error) => console.error("Error fetching coin data:", error));
  }

  // Fungsi untuk menambahkan informasi koin ke tabel HTML
  function addCryptoToTable(coin, name, amount) {
    const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${coin.name}</td>
      <td>
        <img src="${logoUrl}" alt="${coin.symbol}" width="32" height="32">
        ${coin.symbol}
      </td>
      <td>Rp ${coin.quote.IDR.price.toLocaleString("id-ID")}</td>
      <td>
        <button id="button" onclick="updateAmount('${name}', -1)">-</button>
        ${amount}
        <button id="button" onclick="updateAmount('${name}', 1)">+</button>
      </td>
      <td>Rp ${(coin.quote.IDR.price * amount).toLocaleString("id-ID")}</td>
      <td>${coin.quote.IDR.market_cap.toLocaleString("id-ID")}</td>
      <td><input type="checkbox" class="monitor-checkbox" data-symbol="${
        coin.symbol
      }"></td>
      <td><button id="button" onclick="deleteCoin('${name}')" class="delete-btn">Delete</button></td>
    `;
    portfolioTableBody.appendChild(row); // Menambahkan baris ke badan tabel
  }

  // Fungsi untuk menampilkan dan mengelola portfolio di tabel HTML
  function displayPortfolio() {
    portfolioTableBody.innerHTML = "";
    let totalPortfolioValue = 0;

    portfolio.forEach((item) => {
      const coin = coins.find(
        (c) => c.symbol.toUpperCase() === item.name.toUpperCase()
      );
      if (coin && coin.quote && coin.quote.IDR) {
        const coinValue = item.amount * coin.quote.IDR.price;
        totalPortfolioValue += coinValue;
        addCryptoToTable(coin, item.name, item.amount); // Menambahkan baris baru ke tabel untuk setiap koin
      }
    });

    totalAmountIDR.textContent = `Rp ${totalPortfolioValue.toLocaleString(
      "id-ID"
    )}`;
    loadCheckboxState(); // Memuat status checkbox berdasarkan penyimpanan lokal
  }
  // Fungsi untuk menambahkan koin baru ke portfolio
  window.addCoin = function () {
    const coinNameInput = document.getElementById("coinNameInput");
    const coinAmountInput = document.getElementById("coinAmountInput");
    const coinName = coinNameInput.value.trim().toUpperCase();
    const coinAmount = parseFloat(coinAmountInput.value);
    if (!coinName || isNaN(coinAmount) || coinAmount <= 0) {
      alert(
        "Please enter a valid coin name and a positive number for the amount."
      );
      return;
    }
    const existingIndex = portfolio.findIndex(
      (c) => c.name.toUpperCase() === coinName
    );
    if (existingIndex !== -1) {
      portfolio[existingIndex].amount += coinAmount;
    } else {
      const coin = coins.find((c) => c.symbol.toUpperCase() === coinName);
      if (coin) {
        portfolio.push({ name: coinName, amount: coinAmount });
      } else {
        alert("Cryptocurrency not found.");
        return;
      }
    }
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    displayPortfolio();
  };

  // Fungsi yang dipanggil ketika tombol '+' atau '-' ditekan untuk mengupdate jumlah koin
  window.updateAmount = function (name, change) {
    const coinIndex = portfolio.findIndex(
      (c) => c.name.toUpperCase() === name.toUpperCase()
    );
    if (coinIndex !== -1) {
      portfolio[coinIndex].amount += change;
      if (portfolio[coinIndex].amount <= 0) {
        portfolio.splice(coinIndex, 1); // Hapus koin dari array jika jumlahnya nol atau kurang
      }
      localStorage.setItem("portfolio", JSON.stringify(portfolio));
      displayPortfolio(); // Perbarui tampilan tabel
    }
  };

  // Fungsi untuk menyimpan status checkbox ke penyimpanan lokal
  function saveCheckboxState() {
    const checkboxes = document.querySelectorAll(".monitor-checkbox");
    const checkboxState = {};
    checkboxes.forEach((checkbox) => {
      checkboxState[checkbox.dataset.symbol] = checkbox.checked;
    });
    localStorage.setItem("checkboxState", JSON.stringify(checkboxState));
  }

  // Fungsi untuk memuat status checkbox dari penyimpanan lokal
  function loadCheckboxState() {
    const checkboxState =
      JSON.parse(localStorage.getItem("checkboxState")) || {};
    const checkboxes = document.querySelectorAll(".monitor-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = checkboxState[checkbox.dataset.symbol] || false;
      checkbox.addEventListener("change", saveCheckboxState);
    });
  }

  // Fungsi untuk memonitor koin yang dipilih
  window.monitorSelectedCoins = function () {
    const selectedSymbols = [];
    const checkboxes = document.querySelectorAll(".monitor-checkbox:checked");
    checkboxes.forEach((checkbox) => {
      selectedSymbols.push({
        description: "",
        proName: checkbox.dataset.symbol + "USD",
      });
    });
    if (selectedSymbols.length < 2 || selectedSymbols.length > 12) {
      alert("You can select between 2 and 12 coins only.");
    } else {
      localStorage.setItem("monitorSymbols", JSON.stringify(selectedSymbols));
      window.location.href = "monitor.html";
    }
  };
  // Fungsi untuk menghapus koin dari portfolio
  window.deleteCoin = function (name) {
    portfolio = portfolio.filter(
      (c) => c.name.toUpperCase() !== name.toUpperCase()
    );
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    displayPortfolio();
  };

  fetchData(); // Memanggil fungsi untuk memuat data saat pertama kali halaman dimuat
});

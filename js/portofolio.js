document.addEventListener("DOMContentLoaded", () => {
  let coins = [];
  let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];
  const portfolioTableBody = document.getElementById("portfolioTableBody");
  const totalAmountIDR = document.getElementById("totalAmountIDR");

  function fetchData() {
    const apiUrl =
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
    const params = new URLSearchParams({
      start: "1",
      limit: "500", // Jumlah koin untuk diambil
      convert: "IDR", // Mengonversi harga ke IDR
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
        displayPortfolio();
      })
      .catch((error) => {
        console.error("Error fetching coin data:", error);
      });
  }

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
        addCryptoToTable(coin, item.name, item.amount);
      }
    });

    totalAmountIDR.textContent = `Rp ${totalPortfolioValue.toLocaleString(
      "id-ID"
    )}`;
  }

  function addCryptoToTable(coin, name, amount) {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${coin.cmc_rank}</td>
          <td>${coin.name}</td>
          <td>${coin.symbol}</td>
          <td>Rp ${coin.quote.IDR.price.toLocaleString("id-ID")}</td>
          <td>
              <button onclick="updateAmount('${name}', -1)">-</button>
              ${amount}
              <button onclick="updateAmount('${name}', 1)">+</button>
          </td>
          <td>Rp ${(coin.quote.IDR.price * amount).toLocaleString("id-ID")}</td>
          <td>${coin.quote.IDR.market_cap.toLocaleString("id-ID")}</td>
          <td><input type="checkbox" class="monitor-checkbox" data-symbol="${coin.symbol}"></td>
          <td><button onclick="deleteCoin('${name}')" class="delete-btn">Delete</button></td>
      `;
    portfolioTableBody.appendChild(row);
  }

  window.updateAmount = function (name, change) {
    const coinIndex = portfolio.findIndex(
      (c) => c.name.toUpperCase() === name.toUpperCase()
    );
    if (coinIndex !== -1) {
      portfolio[coinIndex].amount += change;
      if (portfolio[coinIndex].amount <= 0) {
        portfolio.splice(coinIndex, 1); // Remove the coin if the amount is zero or less
      }
      localStorage.setItem("portfolio", JSON.stringify(portfolio));
      displayPortfolio();
    }
  };

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

  window.deleteCoin = function (name) {
    const updatedPortfolio = portfolio.filter(
      (c) => c.name.toUpperCase() !== name.toUpperCase()
    );
    portfolio = updatedPortfolio;
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    displayPortfolio();
  };

  window.monitorSelectedCoins = function () {
    const selectedSymbols = [];
    const checkboxes = document.querySelectorAll('.monitor-checkbox:checked');
    checkboxes.forEach(checkbox => {
      selectedSymbols.push(checkbox.dataset.symbol);
    });
    if (selectedSymbols.length > 6) {
      alert('You can select up to 6 coins only.');
    } else {
      localStorage.setItem('monitorSymbols', JSON.stringify(selectedSymbols));
      window.location.href = 'monitor.html';
    }
  };

  fetchData();
});

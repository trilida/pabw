async function fetchCoinDetail(symbol) {
  const apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=IDR`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
      },
    });
    const data = await response.json();
    if (data.data && data.data[symbol]) {
      updateModal(data.data[symbol]);
      return data.data[symbol];
    }
  } catch (error) {
    console.error("Error fetching coin details: ", error);
  }
  return null;
}

async function fetchCoinNews(symbol) {
  const apiUrl = `https://cryptonews-api.com/api/v1?tickers=${symbol}&items=3&page=1&token=ljukmboyqryrusrqn9vfvv4rbcayrrsz65a7einn`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    if (data.data) updateNewsModal(data.data);
    else throw new Error("No news found for this coin.");
  } catch (error) {
    console.error("Error fetching coin news: ", error);
    alert("Failed to fetch news. Please try again later.");
  }
}

function updateModal(data) {
  document.getElementById("coinName").innerText = data.name;
  document.getElementById("coinSymbol").innerText = "Symbol: " + data.symbol;
  document.getElementById(
    "coinPrice"
  ).innerText = `Price (IDR): ${data.quote.IDR.price.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  })}`;
  document.getElementById(
    "coinVolume"
  ).innerText = `Volume (IDR): ${data.quote.IDR.volume_24h.toLocaleString(
    "id-ID",
    { style: "currency", currency: "IDR" }
  )}`;
  updateChart(data.symbol); // Update chart with the correct symbol
}

function updateNewsModal(newsData) {
  const newsContainer = document.getElementById("coinNews");
  let newsHTML = "<h2>Latest News</h2>";
  newsData.forEach((news) => {
    newsHTML += `
      <div>
        <h3>${news.title}</h3>
        <p>${news.description}</p>
        <a href="${news.url}" target="_blank">Read more</a>
      </div>
    `;
  });
  newsContainer.innerHTML = newsHTML;
}

function loadCoinDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get("symbol");
  const name = urlParams.get("name");
  document.getElementById("coinName").innerText = name;
  document.getElementById("coinSymbol").innerText = "Symbol: " + symbol;

  fetchCoinDetail(symbol);
  fetchCoinNews(symbol);
  updateChart(symbol);
}

function updateChart(symbol) {
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = ""; // Clear previous content

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  script.async = true;
  script.innerHTML = JSON.stringify({
    autosize: true,
    symbol: `BINANCE:${symbol}USDT`,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "light",
    style: "1",
    locale: "en",
    allow_symbol_change: true,
    calendar: false,
    container_id: "chartContainer",
  });
  chartContainer.appendChild(script);
}

window.onload = loadCoinDetails;

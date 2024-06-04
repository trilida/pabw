async function fetchCoinDetail(symbol) { //ini buat ngambil data price sama volume sesuai dengan data yang dari cryptomarketcap yang dipilih 
  const apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=IDR`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": "58320ee3-e22e-4bfb-83e1-10a3828a3feb",
      },
    });
    const crypto = await response.json();
    if (crypto.data && crypto.data[symbol]) {
      const coinData = crypto.data[symbol];
      const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinData.id}.png`; // URL gambar logo dari coinmarketcap
      updateModal(coinData, logoUrl);
      return coinData;
    }
  } catch (error) {
    console.error("Error fetching coin details: ", error);
  }
  return null;
}

async function fetchCoinNews(symbol) { //ini untuk ngambil data news dari cryptonews
  const apiUrl = `https://cryptonews-api.com/api/v1?tickers=${symbol}&items=3&page=1&token=4ltz4hv77kgbrdpqzkrnf4otstrxlnrqresew2da`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const news = await response.json();
    if (news.data) updateNewsModal(news.data);
    else throw new Error("No news found for this coin.");
  } catch (error) {
    console.error("Error fetching coin news: ", error);
    alert("Failed to fetch news. Please try again later.");
  }
}

function updateModal(data, logoUrl) {
  document.getElementById("coinName").innerText = data.name;
  document.getElementById("coinSymbol").innerText = "Symbol: " + data.symbol;
  document.getElementById("coinLogo").src = logoUrl; // Set the source of the logo image
  document.getElementById("coinPrice").innerText = `Price (IDR): ${data.quote.IDR.price.toLocaleString("id-ID", {style: "currency",currency: "IDR",})}`;
  document.getElementById("coinVolume").innerText = `Volume (IDR): ${data.quote.IDR.volume_24h.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`;
  updateChart(data.symbol); // Update chart with the correct symbol
}

function updateNewsModal(newsData) {
  const newsContainer = document.getElementById("coinNews");
  let newsHTML = "";
  newsData.forEach((news) => {
    newsHTML += `
      <div class="news-item d-flex mb-4">
        <img src="${news.image_url}" alt="${
      news.title
    }" class="news-image mr-3" style="width: 150px; height: 100px; object-fit: cover;">
        <div class="news-content">
          <span class="news-category">${news.source_name}</span>
          <span class="news-date">${new Date(news.date).toLocaleString(
            "id-ID",
            { dateStyle: "full", timeStyle: "short" }
          )}</span>
          <h3 class="news-title">${news.title}</h3>
          <p>${news.text}</p>
          <a href="${news.news_url}" target="_blank">Read more</a>
        </div>
      </div>
    `;
  });
  newsContainer.innerHTML = newsHTML;
}

function updateChart(symbol) { //ini function buat nampilin chart
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = ""; // Clear previous content

  const chart = document.createElement("script");
  chart.type = "text/javascript";
  chart.src =
    "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
  chart.async = true;
  chart.innerHTML = JSON.stringify({
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
  chartContainer.appendChild(chart);
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

window.onload = loadCoinDetails;

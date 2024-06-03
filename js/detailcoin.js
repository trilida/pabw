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

function fetchCoinNews(symbol) {
  const apiUrl = `https://cryptonews-api.com/api/v1?tickers=${symbol}&items=3&page=1&token=ljukmboyqryrusrqn9vfvv4rbcayrrsz65a7einn`;
  fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (data.data) updateNewsModal(data.data);
      else throw new Error("No news found for this coin.");
    })
    .catch((error) => {
      console.error("Error fetching coin news: ", error);
      alert("Failed to fetch news. Please try again later.");
    });
}

function updateModal(data) {
  document.getElementById("coinName").innerText = data.name;
  document.getElementById("coinSymbol").innerText = "Symbol: " + data.symbol;
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

function loadTradingViewWidget(symbols) {
  const chartsContainer = document.getElementById("charts");
  chartsContainer.innerHTML = ""; // Clear existing charts

  symbols.forEach((symbol, index) => {
    const container = document.createElement("div");
    container.className = "tradingview-widget-container";
    container.id = `chart-container-${index}`;

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.appendChild(widget);

    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.async = true;
    scriptElement.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

    const config = {
      autosize: true,
      symbol: symbol.proName,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    };

    scriptElement.innerHTML = JSON.stringify(config);
    widget.appendChild(scriptElement);
    chartsContainer.appendChild(container);
  });
}

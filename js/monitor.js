document.addEventListener("DOMContentLoaded", function () {
  loadTradingViewWidgets();
});

function loadTradingViewWidgets() {
  const savedSymbols = JSON.parse(
    localStorage.getItem("monitorSymbols") || "[]"
  );
  console.log("Loaded symbols: ", savedSymbols);
  if (savedSymbols.length === 0) {
    console.log("No symbols selected for monitoring.");
    return; // Do nothing if no symbols are saved
  }

  const container = document.getElementById("tradingview-widgets");
  container.innerHTML = ""; // Clear any existing widgets

  savedSymbols.forEach((symbol) => {
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container";
    widgetDiv.style.width = "100%"; // Adjust width per your layout needs
    widgetDiv.style.height = "500px"; // Set a reasonable height for each widget

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol.proName,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
    });
    widgetDiv.appendChild(script);
    container.appendChild(widgetDiv);
  });
}


var OWNER_WALLET = "ВАШ_АДРЕС_METAMASK";
var BTC_ADDR = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";

function startChart() {
    var chartBox = document.getElementById('chartContainer');
    if (!chartBox) return;

    // Очищаем контейнер перед созданием, чтобы не было дублей
    chartBox.innerHTML = '';

    var chart = LightweightCharts.createChart(chartBox, {
        layout: { background: { color: '#181a20' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
        width: chartBox.clientWidth,
        height: 400
    });

    // Универсальный метод добавления свечей (работает везде)
    var candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff3a33',
        borderUpColor: '#00ffad', borderDownColor: '#ff3a33',
        wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
    });

    var binanceSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    
    binanceSocket.onmessage = function(event) {
        var data = JSON.parse(event.data);
        var k = data.k;
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c)
        });
        var priceDiv = document.getElementById('livePrice');
        if (priceDiv) priceDiv.innerText = parseFloat(k.c).toFixed(2);
    };
}

function openTab(name) {
    var tabs = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }
    document.getElementById(name).style.display = 'block';
}

window.onload = function() {
    startChart();
    var qrImg = document.getElementById('qrCode');
    if (qrImg) qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + BTC_ADDR;
};

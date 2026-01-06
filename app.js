// Настройки
const OWNER_WALLET = "ВАШ_АДРЕС_METAMASK"; 
const BTC_DEPOSIT_ADDR = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
const API_URL = "https://ВАШ-СЕРВЕР.onrender.com";

let candleSeries;

// 1. Инициализация графика
function initChart() {
    const container = document.getElementById('chartContainer');
    if (!container) return;

    const chart = LightweightCharts.createChart(container, {
        layout: { backgroundColor: '#181a20', textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
        timeScale: { timeVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff3a33', 
        borderUpColor: '#00ffad', borderDownColor: '#ff3a33', 
        wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
    });

    // Подключение к Binance для живых данных
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    socket.onmessage = function(event) {
        const msg = JSON.parse(event.data);
        const k = msg.k;
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c)
        });
        const priceLabel = document.getElementById('livePrice');
        if (priceLabel) priceLabel.innerText = parseFloat(k.c).toFixed(2);
    };
}

// 2. Переключение вкладок
function openTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(function(c) { c.style.display = 'none'; });
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.style.display = 'block';
}

// 3. Запуск при загрузке
window.onload = function() {
    initChart();
    
    // Установка QR-кода
    const qr = document.getElementById('qrCode');
    if (qr) {
        qr.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + BTC_DEPOSIT_ADDR;
    }
};

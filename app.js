const OWNER_WALLET = "0x9De3fd62a718EE7eA1C7a5c25F4f2648aEE07083"; 
const BTC_DEPOSIT_ADDR = "bc1qvf4wevx5lyjsz5l6mtpq9rs6qehssf5rmzfv4t"; // Ваш BTC адрес
const API_URL = "https://exchange-server-g6zt.onrender.com"; // Проверьте, чтобы тут была ваша ссылка

// Инициализация графиков
let candleSeries;
const chartElement = document.getElementById('chartContainer');

if (chartElement) {
    const chart = LightweightCharts.createChart(chartElement, {
        layout: { backgroundColor: '#181a20', textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        timeScale: { timeVisible: true, secondsVisible: false }
    });
    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff3a33', borderUpColor: '#00ffad', borderDownColor: '#ff3a33', wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
    });
    
    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartElement.clientWidth });
    });
}

// Живые данные с Binance
function initLiveChart() {
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const k = data.k;
        if (candleSeries) {
            candleSeries.update({
                time: k.t / 1000,
                open: parseFloat(k.o), 
                high: parseFloat(k.h), 
                low: parseFloat(k.l), 
                close: parseFloat(k.c)
            });
        }
        const priceEl = document.getElementById('livePrice');
        if (priceEl) priceEl.innerText = parseFloat(k.c).toFixed(2);
    };
}

// Функции интерфейса
function openTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const targetTab = document.getElementById(id);
    if (targetTab) targetTab.classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
}

async function connect() {
    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            document.getElementById('connectBtn').innerText = address.substring(0, 6) + "...";
            
            if(address.toLowerCase() === OWNER_WALLET.toLowerCase()) {
                document.getElementById('adminTab').classList.remove('hidden');
            }
            
            fetch(${API_URL}/auth, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ address })
            });
        } catch (err) {
            console.log("User rejected connect");
        }
    }
}

// Инициализация Кассы и запуск
document.addEventListener('DOMContentLoaded', () => {
    const btcEl = document.getElementById('btcAddress');
    const qrEl = document.getElementById('qrCode');
    
    if (btcEl) btcEl.innerText = BTC_DEPOSIT_ADDR;
    if (qrEl) qrEl.src = https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${BTC_DEPOSIT_ADDR};
    
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) connectBtn.onclick = connect;
    
    initLiveChart();
});

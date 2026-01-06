const OWNER_WALLET = "0x9De3fd62a718EE7eA1C7a5c25F4f2648aEE07083"; 
const BTC_DEPOSIT_ADDR = "bc1qvf4wevx5lyjsz5l6mtpq9rs6qehssf5rmzfv4t";
const API_URL = "https://exchange-server-g6zt.onrender.com";

// Инициализация графиков
const chart = LightweightCharts.createChart(document.getElementById('chartContainer'), {
    layout: { backgroundColor: '#181a20', textColor: '#d1d4dc' },
    grid: { vertLines: { color: '#2b3139' }, horzLines: { color: '#2b3139' } },
    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    timeScale: { timeVisible: true, secondsVisible: false }
});
const candleSeries = chart.addCandlestickSeries({
    upColor: '#00ffad', downColor: '#ff3a33', borderUpColor: '#00ffad', borderDownColor: '#ff3a33', wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
});

// Живые данные с Binance
function initLiveChart() {
    const socket = new WebSocket(wss://stream.binance.com:9443/ws/btcusdt@kline_1m);
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const k = data.k;
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c)
        });
        document.getElementById('livePrice').innerText = parseFloat(k.c).toFixed(2);
    };
}

// Переключение вкладок
function openTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Подключение кошелька
async function connect() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        document.getElementById('connectBtn').innerText = address.substring(0, 6) + "...";
        
        if(address.toLowerCase() === OWNER_WALLET.toLowerCase()) {
            document.getElementById('adminTab').classList.remove('hidden');
        }
        
        // Регистрация в БД
        fetch(${API_URL}/auth, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ address })
        });
    }
}

// Инициализация Кассы
document.getElementById('btcAddress').innerText = BTC_DEPOSIT_ADDR;
document.getElementById('qrCode').src = https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${BTC_DEPOSIT_ADDR};

document.getElementById('connectBtn').onclick = connect;
window.addEventListener('resize', () => chart.applyOptions({ width: document.getElementById('chartContainer').clientWidth }));
initLiveChart();
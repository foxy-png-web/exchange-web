let balance = 10000.00;
let user = { email: '', name: 'Хозяин', surname: '', phone: '', bday: '' };
let lastPrice = 0;
let candleSeries;

// СИСТЕМА ВХОДА
function toggleAuth(type) {
    const tabs = document.querySelectorAll('.tab');
    tabs[0].classList.toggle('active', type === 'reg');
    tabs[1].classList.toggle('active', type === 'login');
}

function startApp() {
    user.email = document.getElementById('regEmail').value || 'guest@mail.ru';
    document.getElementById('viewEmail').innerText = user.email;
    
    document.getElementById('authPage').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('authPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        initChart();
    }, 500);
}

// УПРАВЛЕНИЕ ДАННЫМИ ПРОФИЛЯ
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

function editData() {
    document.getElementById('userDataView').style.display = 'none';
    document.getElementById('userDataEdit').style.display = 'block';
}

function saveData() {
    user.name = document.getElementById('editName').value;
    user.surname = document.getElementById('editSurname').value;
    user.phone = document.getElementById('editPhone').value;
    user.bday = document.getElementById('editBday').value;

    document.getElementById('viewName').innerText = user.name || 'Не указано';
    document.getElementById('viewSurname').innerText = user.surname || 'Не указано';
    document.getElementById('viewPhone').innerText = user.phone || 'Не указано';
    document.getElementById('viewBday').innerText = user.bday || 'Не указано';

    document.getElementById('userDataView').style.display = 'block';
    document.getElementById('userDataEdit').style.display = 'none';
}

// ГРАФИК В РАМКЕ
function initChart() {
    const chartDiv = document.getElementById('chartBox');
    const chart = LightweightCharts.createChart(chartDiv, {
        layout: { background: { color: '#000' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#0a1f14' }, horzLines: { color: '#0a1f14' } },
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight,
        timeScale: { borderVisible: false, timeVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff5252', borderVisible: false,
        wickUpColor: '#00ffad', wickDownColor: '#ff5252'
    });

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k;
        lastPrice = parseFloat(k.c);
        candleSeries.update({
            time: k.t / 1000, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: lastPrice
        });
        document.getElementById('priceLabel').innerText = "BTC/USDT: " + lastPrice.toFixed(2);
    };

    window.onresize = () => chart.applyOptions({ width: chartDiv.clientWidth, height: chartDiv.clientHeight });
}

// ТОРГОВЛЯ
function goTrade(type) {
    const amount = parseFloat(document.getElementById('tradeAmt').value);
    if (balance < amount) return alert("Недостаточно средств!");
    
    balance -= amount;
    document.getElementById('balanceDisp').innerText = "$" + balance.toFixed(2);
    
    // Эмуляция результата через 5 секунд
    setTimeout(() => {
        const win = Math.random() > 0.5; // Просто для теста
        if (win) {
            balance += amount * 1.82;
            alert("ВЫИГРЫШ!");
        } else {
            alert("ПРОИГРЫШ");
        }
        document.getElementById('balanceDisp').innerText = "$" + balance.toFixed(2);
    }, 5000);
}


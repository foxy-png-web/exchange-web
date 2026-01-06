let balance = 10000.00;
let lastPrice = 0;
let candleSeries;

// ПЕРЕКЛЮЧЕНИЕ ВХОД / РЕГИСТРАЦИЯ
function switchAuth(mode) {
    if (mode === 'login') {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('regTab').classList.remove('active');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('regForm').style.display = 'none';
    } else {
        document.getElementById('regTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
        document.getElementById('regForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    }
}

// ВХОД В ТЕРМИНАЛ
function startApp() {
    const email = document.getElementById('logEmail').value || document.getElementById('regEmail').value || 'user@mail.ru';
    document.getElementById('pEmail').innerText = email;
    
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    initChart();
}

// МОДАЛКИ
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

function showEdit() {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
}

function saveProfile() {
    document.getElementById('pName').innerText = document.getElementById('inName').value || 'Не указано';
    document.getElementById('pPhone').innerText = document.getElementById('inPhone').value || 'Не указано';
    document.getElementById('profileView').style.display = 'block';
    document.getElementById('profileEdit').style.display = 'none';
}

// ГРАФИК
function initChart() {
    const container = document.getElementById('chartBox');
    const chart = LightweightCharts.createChart(container, {
        layout: { background: { color: '#000' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#0a1f14' }, horzLines: { color: '#0a1f14' } },
        width: container.clientWidth,
        height: container.clientHeight,
    });
    candleSeries = chart.addCandlestickSeries({ upColor: '#00ffad', downColor: '#ff5252' });

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k;
        lastPrice = parseFloat(k.c);
        candleSeries.update({
            time: k.t / 1000, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: lastPrice
        });
    };
    window.onresize = () => chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
}

// СДЕЛКА
function makeTrade(type) {
    const amt = parseFloat(document.getElementById('tradeAmt').value);
    if (balance < amt) return alert("Мало денег!");
    balance -= amt;
    document.getElementById('balanceDisp').innerText = "$" + balance.toFixed(2);
    setTimeout(() => {
        balance += amt * 1.82; // Для теста всегда вин
        document.getElementById('balanceDisp').innerText = "$" + balance.toFixed(2);
        alert("Сделка завершена!");
    }, 3000);
}


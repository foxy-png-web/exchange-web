let balance = 1000.00;
let lastPrice = 0;
let candleSeries;
let isTrading = false;

// Вход в систему
function finishAuth() {
    document.getElementById('authPage').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('authPage').style.display = 'none';
        document.getElementById('tradingTerminal').style.display = 'block';
        initChart(); // Запускаем график только после входа
    }, 400);
}

function setTab(el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

function setType(el) {
    document.querySelectorAll('.type-box').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

// График
function initChart() {
    const container = document.getElementById('chart');
    const chart = LightweightCharts.createChart(container, {
        layout: { background: { color: '#040d08' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: '#0d2b1c' }, horzLines: { color: '#0d2b1c' } },
        width: container.clientWidth,
        height: container.clientHeight,
        timeScale: { timeVisible: true, secondsVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff5252',
        borderVisible: false, wickUpColor: '#00ffad', wickDownColor: '#ff5252'
    });

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k;
        lastPrice = parseFloat(k.c);
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: lastPrice
        });
        document.getElementById('price').innerText = lastPrice.toFixed(2);
    };
}

// Торговля
function trade(type) {
    if (isTrading) return;
    const amount = parseFloat(document.getElementById('amt').value);
    if (balance < amount) return msg("Недостаточно средств", "#ff5252");

    isTrading = true;
    balance -= amount;
    updateUI();

    const entry = lastPrice;
    const line = candleSeries.createPriceLine({
        price: entry, color: type === 'up' ? '#00ffad' : '#ff5252',
        lineWidth: 2, title: type === 'up' ? 'ВВЕРХ' : 'ВНИЗ'
    });

    msg("Сделка открыта (5с)", "#00ffad");

    setTimeout(() => {
        const win = (type === 'up' && lastPrice > entry) || (type === 'down' && lastPrice < entry);
        candleSeries.removePriceLine(line);
        if (win) {
            const p = amount * 1.82;
            balance += p;
            msg(`ВЫИГРЫШ: +$${p.toFixed(2)}`, "#00ffad");
        } else {
            msg(`ПРОИГРЫШ: -$${amount}`, "#ff5252");
        }
        isTrading = false;
        updateUI();
    }, 5000);
}

function msg(t, c) {
    const n = document.getElementById('notify');
    n.innerText = t; n.style.background = c; n.style.display = 'block';
    setTimeout(() => n.style.display = 'none', 3000);
}

function updateUI() {
    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
}


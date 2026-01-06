let balance = 1000.00;
let lastPrice = 0;
let candleSeries;
let isTrading = false;

function initPocketApp() {
    const chartDiv = document.getElementById('tradingView');
    const chart = LightweightCharts.createChart(chartDiv, {
        layout: { background: { color: '#040d08' }, textColor: '#90a4ae' },
        grid: { vertLines: { color: '#0d2b1c' }, horzLines: { color: '#0d2b1c' } },
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight,
        crosshair: { mode: 0 },
        timeScale: { timeVisible: true, secondsVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00e676', downColor: '#ff5252',
        borderVisible: false, wickUpColor: '#00e676', wickDownColor: '#ff5252'
    });

    const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    socket.onmessage = (res) => {
        const k = JSON.parse(res.data).k;
        lastPrice = parseFloat(k.c);
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: lastPrice
        });
    };

    window.onresize = () => chart.applyOptions({ width: chartDiv.clientWidth, height: chartDiv.clientHeight });
}

function changeAmount(val) {
    let input = document.getElementById('amountInput');
    let current = parseInt(input.value);
    if (current + val >= 1) input.value = current + val;
}

function execTrade(type) {
    if (isTrading) return;
    const amount = parseFloat(document.getElementById('amountInput').value);
    if (balance < amount) return showNotify("Недостаточно средств!", "#ff5252");

    isTrading = true;
    balance -= amount;
    updateUI();

    const entryPrice = lastPrice;
    const line = candleSeries.createPriceLine({
        price: entryPrice,
        color: type === 'up' ? '#00e676' : '#ff5252',
        lineWidth: 2,
        lineStyle: 2,
        title: 'СДЕЛКА'
    });

    // Имитация времени экспирации (10 секунд для наглядности)
    setTimeout(() => {
        const win = (type === 'up' && lastPrice > entryPrice) || (type === 'down' && lastPrice < entryPrice);
        candleSeries.removePriceLine(line);
        
        if (win) {
            const profit = amount * 1.82;
            balance += profit;
            showNotify(`ВЫИГРЫШ: +$${profit.toFixed(2)}`, "#00e676");
        } else {
            showNotify(`ПРОИГРЫШ: -$${amount.toFixed(2)}`, "#ff5252");
        }
        
        isTrading = false;
        updateUI();
    }, 10000);
}

function showNotify(text, color) {
    const n = document.getElementById('notify');
    n.innerText = text;
    n.style.background = color;
    n.style.display = 'block';
    setTimeout(() => n.style.display = 'none', 3000);
}

function updateUI() {
    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
}

window.onload = initPocketApp;


let balance = 1000.00;
let candleSeries;
let lastPrice = 0;
let isTradeOpen = false;
let priceLine;

function startApp() {
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer || typeof LightweightCharts === 'undefined') {
        console.error("Библиотека не загружена или контейнер не найден");
        return;
    }

    const chart = LightweightCharts.createChart(chartContainer, {
        layout: { background: { color: '#0b0e11' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#181a20' }, horzLines: { color: '#181a20' } },
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        timeScale: { timeVisible: true, secondsVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff3a33',
        borderVisible: false, wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
    });

    const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data).k;
        lastPrice = parseFloat(data.c);
        candleSeries.update({
            time: data.t / 1000,
            open: parseFloat(data.o),
            high: parseFloat(data.h),
            low: parseFloat(data.l),
            close: lastPrice
        });
        document.getElementById('livePrice').innerText = lastPrice.toFixed(2);
    };

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartContainer.clientWidth, height: chartContainer.clientHeight });
    });
}

function placeTrade(type) {
    if (isTradeOpen) return;
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const duration = parseInt(document.getElementById('expTime').value) * 60;
    
    if (balance < amount) {
        alert("Недостаточно баланса!");
        return;
    }

    isTradeOpen = true;
    balance -= amount;
    updateUI();

    const entryPrice = lastPrice;
    priceLine = candleSeries.createPriceLine({
        price: entryPrice,
        color: type === 'up' ? '#00ffad' : '#ff3a33',
        lineWidth: 2,
        lineStyle: 2,
        title: type === 'up' ? 'ВХОД ВВЕРХ' : 'ВХОД ВНИЗ',
    });

    document.getElementById('tradeTimer').style.display = 'block';
    let timeLeft = duration;
    
    const timer = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById('timerSec').innerText = (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);

        if (timeLeft <= 0) {
            clearInterval(timer);
            finishTrade(type, entryPrice, amount);
        }
    }, 1000);
}

function finishTrade(type, entryPrice, amount) {
    const win = (type === 'up' && lastPrice > entryPrice) || (type === 'down' && lastPrice < entryPrice);
    candleSeries.removePriceLine(priceLine);
    document.getElementById('tradeTimer').style.display = 'none';
    
    if (win) {
        const profit = amount * 1.82;
        balance += profit;
        showOverlay(`ВЫИГРЫШ: +$${profit.toFixed(2)}`, '#00ffad');
    } else {
        showOverlay(`ПРОИГРЫШ: $0.00`, '#ff3a33');
    }
    
    isTradeOpen = false;
    updateUI();
}

function showOverlay(text, color) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:${color}; font-size:40px; font-weight:bold; z-index:2000; text-shadow: 2px 2px 10px #000;`;
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function updateUI() {
    document.getElementById('topBalance').innerText = balance.toFixed(2) + " $";
}

// Запуск только после полной загрузки страницы
window.onload = startApp;

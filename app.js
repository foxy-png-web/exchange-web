let balance = 1000.00;
let candleSeries;
let lastPrice = 0;
let isTradeActive = false;
let tradeLine;

// Инициализация графиков
function initTrading() {
    const container = document.getElementById('chartBox');
    if (!container) return;

    const chart = LightweightCharts.createChart(container, {
        layout: { background: { color: '#0b0e11' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#181a20' }, horzLines: { color: '#181a20' } },
        width: container.clientWidth,
        height: container.clientHeight,
        timeScale: { timeVisible: true, secondsVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff3a33',
        borderVisible: false, wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
    });

    // Получение цен BTC/USDT
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k;
        lastPrice = parseFloat(k.c);
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: lastPrice
        });
        document.getElementById('priceDisplay').innerText = "BTC/USDT: " + lastPrice.toFixed(2);
    };

    window.addEventListener('resize', () => {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    });
}

// Функции окон
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Логика сделки
function startTrade(type) {
    if (isTradeActive) return;
    const amount = parseFloat(document.getElementById('amount').value);
    const duration = parseInt(document.getElementById('time').value) * 60;

    if (balance < amount) return alert("Пополните баланс в Кассе!");

    isTradeActive = true;
    balance -= amount;
    updateBalance();

    const entryPrice = lastPrice;
    
    // Линия входа
    tradeLine = candleSeries.createPriceLine({
        price: entryPrice,
        color: type === 'up' ? '#00ffad' : '#ff3a33',
        lineWidth: 2,
        lineStyle: 2,
        title: type === 'up' ? 'ВЫШЕ' : 'НИЖЕ'
    });

    // Таймер
    const timerBox = document.getElementById('tradeTimer');
    const timerVal = document.getElementById('timerValue');
    timerBox.style.display = 'block';
    let timeLeft = duration;

    const interval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerVal.innerText = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            timerBox.style.display = 'none';
            candleSeries.removePriceLine(tradeLine);
            
            const win = (type === 'up' && lastPrice > entryPrice) || (type === 'down' && lastPrice < entryPrice);
            
            if (win) {
                const winAmt = amount * 1.82;
                balance += winAmt;
                alertResult("ВЫИГРЫШ: +$" + winAmt.toFixed(2), "#00ffad");
            } else {
                alertResult("ПРОИГРЫШ: $0.00", "#ff3a33");
            }
            
            isTradeActive = false;
            updateBalance();
        }
    }, 1000);
}

function alertResult(msg, color) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:${color}; font-size:50px; font-weight:bold; z-index:9999; text-shadow:0 0 20px #000;`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function updateBalance() {
    document.getElementById('userBalance').innerText = balance.toFixed(2) + " $";
}

window.onload = () => {
    initTrading();
    updateBalance();
};


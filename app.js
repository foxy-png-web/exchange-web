let balance = 1000.00;
let candleSeries;
let lastPrice = 0;
let isTradeOpen = false;
let priceLine;

function initChart() {
    const chartBox = document.getElementById('chartContainer');
    if (!chartBox) return;

    // Создаем профессиональный график
    const chart = LightweightCharts.createChart(chartBox, {
        layout: { background: { color: '#0b0e11' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#181a20' }, horzLines: { color: '#181a20' } },
        width: chartBox.clientWidth,
        height: chartBox.clientHeight,
        timeScale: { timeVisible: true, secondsVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad', downColor: '#ff3a33',
        borderVisible: false, wickUpColor: '#00ffad', wickDownColor: '#ff3a33'
    });

    // Живые данные с Binance
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    socket.onmessage = (e) => {
        const d = JSON.parse(e.data).k;
        lastPrice = parseFloat(d.c);
        candleSeries.update({
            time: d.t / 1000, open: parseFloat(d.o), high: parseFloat(d.h), low: parseFloat(d.l), close: lastPrice
        });
        document.getElementById('livePrice').innerText = lastPrice.toFixed(2);
    };
    
    window.addEventListener('resize', () => {
        chart.applyOptions({ width: chartBox.clientWidth, height: chartBox.clientHeight });
    });
}

function setAmount(v) { document.getElementById('tradeAmount').value = v; }

function toggleProfile() { document.getElementById('profileMenu').classList.toggle('active'); }

function placeTrade(type) {
    if (isTradeOpen) return;
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const duration = parseInt(document.getElementById('expTime').value) * 60;
    
    if (balance < amount) return alert("Недостаточно баланса!");

    isTradeOpen = true;
    balance -= amount;
    updateUI();

    const entryPrice = lastPrice;
    
    // Рисуем линию сделки на графике
    priceLine = candleSeries.createPriceLine({
        price: entryPrice,
        color: type === 'up' ? '#00ffad' : '#ff3a33',
        lineWidth: 2,
        lineStyle: 2,
        title: ВХОД: ${type === 'up' ? 'ВВЕРХ' : 'ВНИЗ'},
    });

    document.getElementById('tradeTimer').style.display = 'block';
    let timeLeft = duration;
    
    const timer = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById('timerSec').innerText = ${m}:${s < 10 ? '0'+s : s};

        if (timeLeft <= 0) {
            clearInterval(timer);
            const win = (type === 'up' && lastPrice > entryPrice) || (type === 'down' && lastPrice < entryPrice);
            candleSeries.removePriceLine(priceLine);
            document.getElementById('tradeTimer').style.display = 'none';
            
            if (win) {
                const profit = amount * 1.82;
                balance += profit;
                showResult(WIN: +$${profit.toFixed(2)}, '#00ffad');
            } else {
                showResult(LOSS: $0.00, '#ff3a33');
            }
            isTradeOpen = false;
            updateUI();
        }
    }, 1000);
}

function showResult(text, color) {
    const res = document.createElement('div');
    res.style.cssText = position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:${color}; font-size:48px; font-weight:bold; z-index:10000; text-shadow: 2px 2px 10px #000;;
    res.innerText = text;
    document.body.appendChild(res);
    setTimeout(() => res.remove(), 3000);
}

function updateUI() {
    document.getElementById('topBalance').innerText = balance.toFixed(2) + " $";
}

window.onload = () => {
    initChart();
    updateUI();
};

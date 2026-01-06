let balance = 1000.00;
let lastPrice = 0;
let candleSeries;
let isTrading = false;

// 1. Инициализация графика
function initChart() {
    const container = document.getElementById('chart');
    const chart = LightweightCharts.createChart(container, {
        layout: { background: { color: '#040d08' }, textColor: '#90a4ae' },
        grid: { vertLines: { color: '#0d2b1c' }, horzLines: { color: '#0d2b1c' } },
        width: container.clientWidth,
        height: container.clientHeight,
        timeScale: { timeVisible: true, secondsVisible: true }
    });

    candleSeries = chart.addCandlestickSeries({
        upColor: '#00e676', downColor: '#ff5252',
        borderVisible: false, wickUpColor: '#00e676', wickDownColor: '#ff5252'
    });

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k;
        lastPrice = parseFloat(k.c);
        candleSeries.update({
            time: k.t / 1000,
            open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: lastPrice
        });
    };
}

// 2. Логика сделки
function execTrade(type) {
    if (isTrading) return;
    const amtInput = document.getElementById('amount');
    const amount = parseFloat(amtInput.value);

    if (balance < amount) {
        showNotify("Недостаточно средств", "#ff5252");
        return;
    }

    isTrading = true;
    balance -= amount;
    updateUI();

    const entryPrice = lastPrice;
    const line = candleSeries.createPriceLine({
        price: entryPrice,
        color: type === 'up' ? '#00e676' : '#ff5252',
        lineWidth: 2,
        title: type === 'up' ? 'ВЫШЕ' : 'НИЖЕ'
    });

    showNotify("Сделка открыта", "#00e676");

    setTimeout(() => {
        const win = (type === 'up' && lastPrice > entryPrice) || (type === 'down' && lastPrice < entryPrice);
        candleSeries.removePriceLine(line);
        
        if (win) {
            const profit = amount * 1.82;
            balance += profit;
            showNotify(`ВЫИГРЫШ: +$${profit.toFixed(2)}`, "#00e676");
        } else {
            showNotify(`ПРОИГРЫШ: -$${amount}`, "#ff5252");
        }
        
        isTrading = false;
        updateUI();
    }, 5000); // 5 секунд для теста
}

// 3. Уведомления и интерфейс
function showNotify(text, color) {
    const n = document.getElementById('notify');
    n.innerText = text;
    n.style.background = color;
    n.style.display = 'block';
    setTimeout(() => n.style.display = 'none', 3000);
}

function updateUI() {
    document.getElementById('balance').innerText = balance.toFixed(2) + " $";
}

// 4. ГЛАВНОЕ: Привязка кнопок
window.onload = () => {
    initChart();
    
    // Кнопка ВВЕРХ
    document.getElementById('btnUp').onclick = () => execTrade('up');
    
    // Кнопка ВНИЗ
    document.getElementById('btnDown').onclick = () => execTrade('down');
    
    // Кнопки ПЛЮС / МИНУС
    document.getElementById('plusAmt').onclick = () => {
        const input = document.getElementById('amount');
        input.value = parseInt(input.value) + 10;
    };
    
    document.getElementById('minusAmt').onclick = () => {
        const input = document.getElementById('amount');
        if (parseInt(input.value) > 10) input.value = parseInt(input.value) - 10;
    };

    updateUI();
};


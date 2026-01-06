let chart, candleSeries;
let balance = 10000.00;

function login() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('terminal').style.display = 'flex';
    initChart();
}

function initChart() {
    const chartElement = document.getElementById('chart');
    
    // Настройка самого ГРАФИКА (Цвета как на скрине)
    chart = LightweightCharts.createChart(chartElement, {
        layout: {
            backgroundColor: '#000000',
            textColor: '#94a3b8',
            fontSize: 12,
        },
        grid: {
            vertLines: { color: '#0a1f14' },
            horzLines: { color: '#0a1f14' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
            vertLine: { color: '#00ffad', labelBackgroundColor: '#00ffad' },
            horzLine: { color: '#00ffad', labelBackgroundColor: '#00ffad' },
        },
        rightPriceScale: {
            borderColor: '#1a3a2a',
        },
        timeScale: {
            borderColor: '#1a3a2a',
            timeVisible: true,
            secondsVisible: true,
        },
    });

    // Настройка СВЕЧЕЙ (Неоновый эффект)
    candleSeries = chart.addCandlestickSeries({
        upColor: '#00ffad',
        downColor: '#ff5252',
        borderVisible: false,
        wickUpColor: '#00ffad',
        wickDownColor: '#ff5252',
    });

    // Подключение реальных данных (Binance)
    const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const candle = data.k;
        
        candleSeries.update({
            time: candle.t / 1000,
            open: parseFloat(candle.o),
            high: parseFloat(candle.h),
            low: parseFloat(candle.l),
            close: parseFloat(candle.c)
        });
    };

    // Авто-размер при изменении окна
    window.addEventListener('resize', () => {
        chart.applyOptions({ 
            width: chartElement.clientWidth, 
            height: chartElement.clientHeight 
        });
    });
}

function trade(type) {
    const amt = parseFloat(document.getElementById('amount').value);
    if (balance < amt) return alert("Недостаточно средств");
    
    balance -= amt;
    document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
    
    // Имитация сделки
    setTimeout(() => {
        const win = Math.random() > 0.45;
        if(win) {
            balance += amt * 1.82;
            alert("Профит! +82%");
        } else {
            alert("Убыток");
        }
        document.getElementById('balance').innerText = `$${balance.toFixed(2)}`;
    }, 3000);
}


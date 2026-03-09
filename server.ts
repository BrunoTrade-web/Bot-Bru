import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "WaltBot Extreme" });
  });

  const symbols = ["XAUUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY", "GBPJPY", "BTCUSD", "ETHUSD"];
  
  const generatePrices = (symbol: string, count: number, volatility: number, timeframeSeconds: number) => {
    const basePrice = symbol === "XAUUSD" ? 2350 : symbol.includes("JPY") ? 150 : symbol.includes("USD") ? 1.1 : 2500;
    let lastClose = basePrice;
    const now = Math.floor(Date.now() / 1000);
    return Array.from({ length: count }, (_, i) => {
      const open = lastClose;
      const close = open + (Math.random() - 0.5) * (basePrice * volatility);
      const high = Math.max(open, close) + Math.random() * (basePrice * volatility * 0.4);
      const low = Math.min(open, close) - Math.random() * (basePrice * volatility * 0.4);
      lastClose = close;
      return {
        time: now - (count - i) * timeframeSeconds,
        open,
        close,
        high,
        low,
        tick_volume: Math.floor(Math.random() * 1000) + 100
      };
    });
  };

  const TIMEFRAME_SECONDS = {
    M5: 300,
    M15: 900,
    M30: 1800,
    H1: 3600
  };

  // Initial state
  let marketData = symbols.map(symbol => ({
    symbol,
    timeframes: {
      M5: generatePrices(symbol, 300, 0.002, TIMEFRAME_SECONDS.M5),
      M15: generatePrices(symbol, 300, 0.004, TIMEFRAME_SECONDS.M15),
      M30: generatePrices(symbol, 300, 0.006, TIMEFRAME_SECONDS.M30),
      H1: generatePrices(symbol, 300, 0.01, TIMEFRAME_SECONDS.H1)
    }
  }));

  // Mock Market Data API (for initial sync)
  app.get("/api/market-data", (req, res) => {
    res.json(marketData);
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    // Send initial data
    ws.send(JSON.stringify({ type: "INITIAL_DATA", data: marketData }));

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  // Update loop
  setInterval(() => {
    marketData = marketData.map(m => {
      const updateTimeframe = (prices: any[], volatility: number, timeframeSeconds: number) => {
        const last = prices[prices.length - 1];
        const now = Math.floor(Date.now() / 1000);
        
        // If the current time is beyond the last candle's timeframe, create a new candle
        // Otherwise, update the current candle (simulating live tick)
        const isNewCandle = now >= last.time + timeframeSeconds;
        
        if (isNewCandle) {
          const open = last.close;
          const basePrice = m.symbol === "XAUUSD" ? 2350 : m.symbol.includes("JPY") ? 150 : m.symbol.includes("USD") ? 1.1 : 2500;
          const close = open + (Math.random() - 0.5) * (basePrice * volatility);
          const high = Math.max(open, close) + Math.random() * (basePrice * volatility * 0.4);
          const low = Math.min(open, close) - Math.random() * (basePrice * volatility * 0.4);
          
          return [...prices.slice(1), {
            time: last.time + timeframeSeconds,
            open,
            close,
            high,
            low,
            tick_volume: Math.floor(Math.random() * 1000) + 100
          }];
        } else {
          // Update last candle
          const basePrice = m.symbol === "XAUUSD" ? 2350 : m.symbol.includes("JPY") ? 150 : m.symbol.includes("USD") ? 1.1 : 2500;
          const close = last.close + (Math.random() - 0.5) * (basePrice * volatility * 0.1);
          return [...prices.slice(0, -1), {
            ...last,
            close,
            high: Math.max(last.high, close),
            low: Math.min(last.low, close),
            tick_volume: last.tick_volume + Math.floor(Math.random() * 10)
          }];
        }
      };

      return {
        symbol: m.symbol,
        timeframes: {
          M5: updateTimeframe(m.timeframes.M5, 0.002, TIMEFRAME_SECONDS.M5),
          M15: updateTimeframe(m.timeframes.M15, 0.004, TIMEFRAME_SECONDS.M15),
          M30: updateTimeframe(m.timeframes.M30, 0.006, TIMEFRAME_SECONDS.M30),
          H1: updateTimeframe(m.timeframes.H1, 0.01, TIMEFRAME_SECONDS.H1)
        }
      };
    });

    // Broadcast update
    const message = JSON.stringify({ type: "MARKET_UPDATE", data: marketData });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }, 5000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`WaltBot Extreme Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";

// Initialize Database
const db = new Database("waltbot.db");

// Seed tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );
  
  CREATE TABLE IF NOT EXISTS brokerages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    server TEXT,
    accountType TEXT,
    login TEXT,
    password TEXT,
    apiKey TEXT,
    secretKey TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

const JWT_SECRET = process.env.JWT_SECRET || "waltbot-neural-link-2026";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "neural-aes-key-ultra";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);

  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token." });
      req.user = user;
      next();
    });
  };

  // Admin Middleware
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Restricted to administrators." });
    }
    next();
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, role = 'user' } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const insert = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
      insert.run(username, hashedPassword, role);
      
      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message.includes('UNIQUE') ? "Username already exists" : error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Brokerage Routes ---
  app.get("/api/brokerage/list", authenticateToken, (req: any, res) => {
    try {
      const brokerages = db.prepare("SELECT id, name, server, accountType, login FROM brokerages WHERE userId = ?").all(req.user.id);
      res.json(brokerages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/brokerage/connect", authenticateToken, (req: any, res) => {
    try {
      const { name, server, accountType, login, password, apiKey, secretKey } = req.body;
      
      // Encrypt sensitive info
      const encryptedPassword = password ? CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString() : null;
      const encryptedApiKey = apiKey ? CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString() : null;
      const encryptedSecretKey = secretKey ? CryptoJS.AES.encrypt(secretKey, ENCRYPTION_KEY).toString() : null;
      
      const insert = db.prepare(`
        INSERT INTO brokerages (userId, name, server, accountType, login, password, apiKey, secretKey) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run(req.user.id, name, server, accountType, login, encryptedPassword, encryptedApiKey, encryptedSecretKey);
      
      res.status(201).json({ message: `Connected to ${name} (${accountType}) successfully` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/brokerage/list", authenticateToken, (req: any, res) => {
    try {
      const brokerages = db.prepare("SELECT id, name FROM brokerages WHERE userId = ?").all(req.user.id);
      res.json(brokerages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin Routes ---
  app.get("/api/admin/users", authenticateToken, isAdmin, (req, res) => {
    const users = db.prepare("SELECT id, username, role FROM users").all();
    res.json(users);
  });

  app.get("/api/admin/all-brokerages", authenticateToken, isAdmin, (req, res) => {
    const brokerages = db.prepare(`
      SELECT b.id, b.name, u.username as owner 
      FROM brokerages b 
      JOIN users u ON b.userId = u.id
    `).all();
    res.json(brokerages);
  });

  // --- Market Data Simulation ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "WaltBot Extreme", database: "connected" });
  });

  const symbols = ["XAUUSD"];
  
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
    M1: 60,
    M5: 300,
    M15: 900,
    M30: 1800,
    H1: 3600,
    H4: 14400,
    D1: 86400
  };

  // Initial state
  let marketData = symbols.map(symbol => ({
    symbol,
    timeframes: {
      M1: generatePrices(symbol, 300, 0.001, TIMEFRAME_SECONDS.M1),
      M5: generatePrices(symbol, 300, 0.002, TIMEFRAME_SECONDS.M5),
      M15: generatePrices(symbol, 300, 0.004, TIMEFRAME_SECONDS.M15),
      M30: generatePrices(symbol, 300, 0.006, TIMEFRAME_SECONDS.M30),
      H1: generatePrices(symbol, 300, 0.01, TIMEFRAME_SECONDS.H1),
      H4: generatePrices(symbol, 300, 0.02, TIMEFRAME_SECONDS.H4),
      D1: generatePrices(symbol, 300, 0.04, TIMEFRAME_SECONDS.D1)
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
          M1: updateTimeframe(m.timeframes.M1, 0.001, TIMEFRAME_SECONDS.M1),
          M5: updateTimeframe(m.timeframes.M5, 0.002, TIMEFRAME_SECONDS.M5),
          M15: updateTimeframe(m.timeframes.M15, 0.004, TIMEFRAME_SECONDS.M15),
          M30: updateTimeframe(m.timeframes.M30, 0.006, TIMEFRAME_SECONDS.M30),
          H1: updateTimeframe(m.timeframes.H1, 0.01, TIMEFRAME_SECONDS.H1),
          H4: updateTimeframe(m.timeframes.H4, 0.02, TIMEFRAME_SECONDS.H4),
          D1: updateTimeframe(m.timeframes.D1, 0.04, TIMEFRAME_SECONDS.D1)
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

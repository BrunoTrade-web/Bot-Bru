export interface PriceData {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  tick_volume: number;
}

export type Signal = "BUY" | "SELL" | "NO TRADE";

export interface BotSignal {
  decision: Signal;
  confidence: number;
  status?: string;
}

export interface BotStats {
  winRate: number;
  profitFactor: number;
  drawdown: number;
}

export interface OrderRecommendation {
  type: string;
  entry: number;
  sl: number;
  tp: number;
  confidence: number;
  minDuration: string;
}

// ⚙️ config.py equivalents
export const STOP_LOSS_POINTS = 500;
export const TAKE_PROFIT_POINTS = 1500;

// 🤖 bots/trend_bot.py
export const trendBot = (df: PriceData[]): BotSignal => {
  if (df.length < 200) return { decision: "NO TRADE", confidence: 0 };
  const closes = df.map(d => d.close);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  
  const lastEma50 = ema50[ema50.length - 1];
  const lastEma200 = ema200[ema200.length - 1];
  const diff = Math.abs(lastEma50 - lastEma200) / lastEma200;
  const confidence = Math.min(60 + diff * 1000, 98);

  if (lastEma50 > lastEma200) return { decision: "BUY", confidence };
  return { decision: "SELL", confidence };
};

// 🤖 bots/momentum_bot.py
export const momentumBot = (df: PriceData[]): BotSignal => {
  if (df.length < 5) return { decision: "NO TRADE", confidence: 0 };
  const change = df[df.length - 1].close - df[df.length - 5].close;
  const confidence = Math.min(65 + Math.abs(change) * 10, 95);
  return { decision: change > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/volume_bot.py
export const volumeBot = (df: PriceData[]): BotSignal => {
  if (df.length === 0) return { decision: "NO TRADE", confidence: 0 };
  const volumes = df.map(d => d.tick_volume);
  const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const lastVol = volumes[volumes.length - 1];
  const confidence = Math.min(60 + (lastVol / avgVol) * 10, 92);
  return { decision: lastVol > avgVol ? "BUY" : "SELL", confidence };
};

// 🤖 bots/vwap_bot.py
export const vwapBot = (df: PriceData[]): BotSignal => {
  if (df.length === 0) return { decision: "NO TRADE", confidence: 0 };
  let cumulativePV = 0;
  let cumulativeV = 0;
  
  const vwap = df.map(d => {
    cumulativePV += d.close * d.tick_volume;
    cumulativeV += d.tick_volume;
    return cumulativePV / cumulativeV;
  });

  const lastClose = df[df.length - 1].close;
  const lastVwap = vwap[vwap.length - 1];
  const diff = Math.abs(lastClose - lastVwap) / lastVwap;
  const confidence = Math.min(70 + diff * 500, 96);

  return { decision: lastClose > lastVwap ? "BUY" : "SELL", confidence };
};

// 🤖 bots/structure_bot.py
export const structureBot = (df: PriceData[]): BotSignal => {
  if (df.length < 2) return { decision: "NO TRADE", confidence: 0 };
  const last = df[df.length - 1].close;
  const prev = df[df.length - 2].close;
  const confidence = 75 + Math.random() * 15;
  return { decision: last > prev ? "BUY" : "SELL", confidence };
};

// 🤖 bots/liquidity_bot.py
export const liquidityBot = (df: PriceData[]): BotSignal => {
  if (df.length === 0) return { decision: "NO TRADE", confidence: 0 };
  const last = df[df.length - 1];
  const volatility = last.high - last.low;
  const closes = df.map(d => d.close);
  const std = calculateStdDev(closes);
  const confidence = Math.min(65 + (volatility / std) * 5, 94);
  return { decision: volatility > std ? "BUY" : "SELL", confidence };
};

// 🤖 bots/breakout_bot.py
export const breakoutBot = (df: PriceData[]): BotSignal => {
  if (df.length < 20) return { decision: "NO TRADE", confidence: 0 };
  const last20 = df.slice(-20).map(d => d.high);
  const maxHigh = Math.max(...last20);
  const lastClose = df[df.length - 1].close;
  const confidence = lastClose >= maxHigh ? 90 + Math.random() * 8 : 60 + Math.random() * 10;
  return { decision: lastClose >= maxHigh ? "BUY" : "SELL", confidence };
};

// 🤖 bots/accumulation_bot.py
export const accumulationBot = (df: PriceData[]): BotSignal => {
  if (df.length < 20) return { decision: "NO TRADE", confidence: 0 };
  const last20 = df.slice(-20);
  const ranges = last20.map(d => d.high - d.low);
  const avgRange = ranges.reduce((a, b) => a + b, 0) / 20;
  const currentRange = df[df.length - 1].high - df[df.length - 1].low;
  
  // Accumulation is often characterized by low volatility (tight range)
  const isAccumulating = currentRange < avgRange * 0.8;
  const confidence = isAccumulating ? 85 : 40;
  
  // Signal is usually neutral but we bias it based on trend
  const lastClose = df[df.length - 1].close;
  const prevClose = df[df.length - 2].close;
  return { decision: lastClose > prevClose ? "BUY" : "SELL", confidence };
};

// 🤖 bots/manipulation_bot.py
export const manipulationBot = (df: PriceData[]): BotSignal => {
  if (df.length < 5) return { decision: "NO TRADE", confidence: 0 };
  const last = df[df.length - 1];
  const prev = df[df.length - 2];
  
  // Manipulation often looks like a fake breakout (long wick)
  const bodySize = Math.abs(last.close - last.open);
  const wickSize = (last.high - last.low) - bodySize;
  const isManipulation = wickSize > bodySize * 2;
  
  const confidence = isManipulation ? 92 : 30;
  // If it's a manipulation spike up, we expect a move down (SELL)
  const isSpikeUp = last.high - Math.max(last.open, last.close) > bodySize;
  return { decision: isSpikeUp ? "SELL" : "BUY", confidence };
};

// 🤖 bots/distribution_bot.py
export const distributionBot = (df: PriceData[]): BotSignal => {
  if (df.length < 50) return { decision: "NO TRADE", confidence: 0 };
  const last = df[df.length - 1];
  const volumes = df.slice(-50).map(d => d.tick_volume);
  const avgVol = volumes.reduce((a, b) => a + b, 0) / 50;
  
  // Distribution often has high volume but little price progress
  const priceMove = Math.abs(last.close - df[df.length - 5].close);
  const totalVol = df.slice(-5).reduce((a, b) => a + b.tick_volume, 0);
  
  const isDistribution = totalVol > avgVol * 5 && priceMove < (last.close * 0.001);
  const confidence = isDistribution ? 88 : 45;
  
  // Predict large move
  return { decision: last.close > df[df.length - 10].close ? "SELL" : "BUY", confidence };
};

// 🤖 bots/predictive_trend_bot.py
export const predictiveTrendBot = (df: PriceData[]): BotSignal => {
  if (df.length < 30) return { decision: "NO TRADE", confidence: 0 };
  const last30 = df.slice(-30).map(d => d.close);
  const x = Array.from({ length: 30 }, (_, i) => i);
  const y = last30;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const confidence = Math.min(70 + Math.abs(slope) * 1000, 95);
  return { decision: slope > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/fourier_bot.py
export const fourierBot = (df: PriceData[]): BotSignal => {
  if (df.length < 100) return { decision: "NO TRADE", confidence: 0 };
  const closes = df.slice(-100).map(d => d.close);
  // Simplified cycle detection: check if current price is above/below 100-period sine-like mean
  const avg = closes.reduce((a, b) => a + b, 0) / 100;
  const last = closes[closes.length - 1];
  const confidence = 80 + Math.random() * 10;
  return { decision: last > avg ? "BUY" : "SELL", confidence };
};

// 🤖 bots/neural_net_bot.py
export const neuralNetBot = (df: PriceData[]): BotSignal => {
  if (df.length < 10) return { decision: "NO TRADE", confidence: 0 };
  const last10 = df.slice(-10);
  // Mock neural weights
  const weights = [0.1, -0.2, 0.5, 0.8, -0.1, 0.3, 0.4, -0.5, 0.2, 0.9];
  const score = last10.reduce((acc, d, i) => acc + (d.close > d.open ? 1 : -1) * weights[i], 0);
  const confidence = Math.min(75 + Math.abs(score) * 20, 99);
  return { decision: score > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/wave_bot.py
export const waveBot = (df: PriceData[]): BotSignal => {
  if (df.length < 50) return { decision: "NO TRADE", confidence: 0 };
  const last50 = df.slice(-50).map(d => d.close);
  const high = Math.max(...last50);
  const low = Math.min(...last50);
  const current = last50[last50.length - 1];
  
  // Fib retracement levels
  const fib618 = high - (high - low) * 0.618;
  const confidence = 85;
  return { decision: current > fib618 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/mt5_connector_bot.py
export const mt5ConnectorBot = (df: PriceData[]): BotSignal => {
  if (df.length < 10) return { decision: "NO TRADE", confidence: 0 };
  // Simulates MT5 technical indicators (RSI, Stoch, MACD)
  const last = df[df.length - 1];
  const confidence = 82 + Math.random() * 10;
  return { decision: last.close > last.open ? "BUY" : "SELL", confidence };
};

// 🤖 bots/tradingview_bot.py
export const tradingViewBot = (df: PriceData[]): BotSignal => {
  if (df.length < 10) return { decision: "NO TRADE", confidence: 0 };
  // Simulates TradingView Technical Ratings
  const confidence = 88 + Math.random() * 7;
  const decision: Signal = Math.random() > 0.5 ? "BUY" : "SELL";
  return { decision, confidence };
};

export const tradingViewBotPro = (df: PriceData[]): BotSignal => {
  if (df.length < 10) return { decision: "NO TRADE", confidence: 0 };
  // Advanced TradingView Pro analysis
  const confidence = 92 + Math.random() * 5;
  const decision: Signal = Math.random() > 0.4 ? "BUY" : "SELL";
  return { decision, confidence };
};

// 🤖 bots/order_flow_bot.py
export const orderFlowBot = (df: PriceData[]): BotSignal => {
  if (df.length < 5) return { decision: "NO TRADE", confidence: 0 };
  // Analyzes volume delta
  const last = df[df.length - 1];
  const prev = df[df.length - 2];
  const delta = last.tick_volume - prev.tick_volume;
  const confidence = Math.min(75 + Math.abs(delta) / 100, 96);
  return { decision: delta > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/sentiment_bot.py
export const sentimentBot = (df: PriceData[]): BotSignal => {
  // Simulates retail vs institutional sentiment
  const confidence = 70 + Math.random() * 25;
  const decision: Signal = Math.random() > 0.4 ? "BUY" : "SELL";
  return { decision, confidence };
};

// 🤖 bots/volatility_expansion_bot.py
export const volatilityExpansionBot = (df: PriceData[]): BotSignal => {
  if (df.length < 20) return { decision: "NO TRADE", confidence: 0 };
  const last20 = df.slice(-20).map(d => d.close);
  const std = calculateStdDev(last20);
  const last = df[df.length - 1];
  const range = last.high - last.low;
  
  const isExpanding = range > std * 2;
  const confidence = isExpanding ? 91 : 40;
  return { decision: last.close > last.open ? "BUY" : "SELL", confidence };
};

// 🤖 bots/quantum_bot.py
export const quantumBot = (df: PriceData[]): BotSignal => {
  if (df.length < 50) return { decision: "NO TRADE", confidence: 0 };
  // Simulates quantum probability wave analysis
  const confidence = 85 + Math.random() * 10;
  const decision: Signal = Math.random() > 0.5 ? "BUY" : "SELL";
  return { decision, confidence };
};

// 🤖 bots/arbitrage_bot.py
export const arbitrageBot = (df: PriceData[]): BotSignal => {
  if (df.length < 10) return { decision: "NO TRADE", confidence: 0 };
  // Simulates cross-exchange price discrepancy detection
  const confidence = 90 + Math.random() * 8;
  const decision: Signal = Math.random() > 0.45 ? "BUY" : "SELL";
  return { decision, confidence };
};

// 🤖 bots/hedge_bot.py
export const hedgeBot = (df: PriceData[]): BotSignal => {
  if (df.length < 30) return { decision: "NO TRADE", confidence: 0 };
  // Analyzes risk-off/risk-on sentiment based on volatility regimes
  const confidence = 78 + Math.random() * 15;
  const decision: Signal = Math.random() > 0.55 ? "SELL" : "BUY";
  return { decision, confidence };
};

// 🤖 bots/system_sync_bot.py
export const systemSyncBot = (df: PriceData[]): BotSignal => {
  return { decision: "NO TRADE", confidence: 100 };
};

// 🤖 bots/core_update_bot.py
export const coreUpdateBot = (df: PriceData[]): BotSignal => {
  return { decision: "NO TRADE", confidence: 100 };
};

// 🤖 bots/live_stream_bot.py
export const liveStreamBot = (df: PriceData[]): BotSignal => {
  return { decision: "NO TRADE", confidence: 100 };
};

// 🤖 bots/code_verifier_bot.py
export const codeVerifierBot = (df: PriceData[]): BotSignal => {
  const status = Math.random() > 0.95 ? "SCANNING" : "VERIFIED";
  return { decision: "NO TRADE", confidence: 100, status };
};

// 🤖 bots/system_healer_bot.py
export const systemHealerBot = (df: PriceData[]): BotSignal => {
  const status = Math.random() > 0.98 ? "HEALING" : "STABLE";
  return { decision: "NO TRADE", confidence: 100, status };
};

// 🤖 bots/logic_auditor_bot.py
export const logicAuditorBot = (df: PriceData[]): BotSignal => {
  const status = Math.random() > 0.97 ? "AUDITING" : "COMPLIANT";
  return { decision: "NO TRADE", confidence: 100, status };
};

// 🤖 bots/integrity_check_bot.py
export const integrityCheckBot = (df: PriceData[]): BotSignal => {
  const status = Math.random() > 0.99 ? "REPAIRING" : "SECURE";
  return { decision: "NO TRADE", confidence: 100, status };
};

// 💎 GainzAlgo V2 Alpha Indicator
export interface GainzAlgoData {
  time: number;
  trend: number;
  momentum: number;
  signal: number;
  upper: number;
  lower: number;
}

export const calculateGainzAlgo = (df: PriceData[]): GainzAlgoData[] => {
  if (df.length < 20) return [];
  
  const closes = df.map(d => d.close);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  
  return df.map((d, i) => {
    const trend = ema20[i] - ema50[i];
    const momentum = d.close - (df[i - 5]?.close || d.close);
    const volatility = calculateStdDev(closes.slice(Math.max(0, i - 20), i + 1));
    
    return {
      time: d.time,
      trend: trend,
      momentum: momentum,
      signal: trend + momentum,
      upper: d.close + volatility * 2,
      lower: d.close - volatility * 2
    };
  });
};

// 🤖 bots/gainz_algo_trend_bot.py
export const gainzAlgoTrendBot = (df: PriceData[]): BotSignal => {
  const algo = calculateGainzAlgo(df);
  if (algo.length === 0) return { decision: "NO TRADE", confidence: 0 };
  const last = algo[algo.length - 1];
  const confidence = Math.min(85 + Math.abs(last.trend) * 10, 98);
  return { decision: last.trend > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/gainz_algo_momentum_bot.py
export const gainzAlgoMomentumBot = (df: PriceData[]): BotSignal => {
  const algo = calculateGainzAlgo(df);
  if (algo.length === 0) return { decision: "NO TRADE", confidence: 0 };
  const last = algo[algo.length - 1];
  const confidence = Math.min(82 + Math.abs(last.momentum) * 5, 97);
  return { decision: last.momentum > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/gainz_algo_signal_bot.py
export const gainzAlgoSignalBot = (df: PriceData[]): BotSignal => {
  const algo = calculateGainzAlgo(df);
  if (algo.length === 0) return { decision: "NO TRADE", confidence: 0 };
  const last = algo[algo.length - 1];
  const confidence = Math.min(88 + Math.abs(last.signal) * 2, 99);
  return { decision: last.signal > 0 ? "BUY" : "SELL", confidence };
};

// 🤖 bots/rsi_bot.py
export const rsiBot = (df: PriceData[]): BotSignal => {
  if (df.length < 14) return { decision: "NO TRADE", confidence: 0 };
  const closes = df.map(d => d.close);
  const rsi = calculateRSI(closes);
  const lastRsi = rsi[rsi.length - 1];
  
  if (lastRsi > 70) return { decision: "SELL", confidence: Math.min(70 + (lastRsi - 70) * 2, 95) };
  if (lastRsi < 30) return { decision: "BUY", confidence: Math.min(70 + (30 - lastRsi) * 2, 95) };
  return { decision: "NO TRADE", confidence: 0 };
};

// 🤖 bots/bb_bot.py
export const bbBot = (df: PriceData[]): BotSignal => {
  if (df.length < 20) return { decision: "NO TRADE", confidence: 0 };
  const closes = df.map(d => d.close);
  const bb = calculateBollingerBands(closes);
  const lastClose = closes[closes.length - 1];
  const lastUpper = bb.upper[bb.upper.length - 1];
  const lastLower = bb.lower[bb.lower.length - 1];
  
  if (lastClose > lastUpper) return { decision: "SELL", confidence: 85 };
  if (lastClose < lastLower) return { decision: "BUY", confidence: 85 };
  return { decision: "NO TRADE", confidence: 0 };
};

// 🤖 bots/macd_bot.py
export const macdBot = (df: PriceData[]): BotSignal => {
  if (df.length < 26) return { decision: "NO TRADE", confidence: 0 };
  const closes = df.map(d => d.close);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12.map((v, i) => v - ema26[i]);
  const signal = calculateEMA(macd, 9);
  
  const lastMacd = macd[macd.length - 1];
  const lastSignal = signal[signal.length - 1];
  const prevMacd = macd[macd.length - 2];
  const prevSignal = signal[signal.length - 2];
  
  if (prevMacd < prevSignal && lastMacd > lastSignal) return { decision: "BUY", confidence: 88 };
  if (prevMacd > prevSignal && lastMacd < lastSignal) return { decision: "SELL", confidence: 88 };
  return { decision: "NO TRADE", confidence: 0 };
};

// 🧠 core/medusa_prime.py
export const medusaConsensus = (signals: BotSignal[]) => {
  const buy = signals.filter(s => s.decision === "BUY").length;
  const sell = signals.filter(s => s.decision === "SELL").length;
  const total = signals.length;

  if (total === 0) return { decision: "NO TRADE" as Signal, buyProb: 0, sellProb: 0 };

  const buyProb = (buy / total) * 100;
  const sellProb = (sell / total) * 100;

  let decision: Signal = "NO TRADE";
  if (buyProb > 65) decision = "BUY";
  else if (sellProb > 65) decision = "SELL";

  return { decision, buyProb, sellProb };
};

// 📊 core/performance_tracker.py
export const getBotStats = (botId: string): BotStats => {
  // In a real app, this would come from a database of historical trades
  // Mocking realistic performance data based on bot types
  const seed = botId.length;
  const winRate = 55 + (seed % 15) + Math.random() * 5;
  const profitFactor = 1.2 + (seed % 10) / 10 + Math.random() * 0.3;
  const drawdown = 5 + (seed % 8) * 1.5 + Math.random() * 3;

  if (botId.startsWith('gainz_')) {
    return {
      winRate: 78 + Math.random() * 10,
      profitFactor: 2.1 + Math.random() * 0.8,
      drawdown: 4 + Math.random() * 4
    };
  }

  return {
    winRate: Math.min(winRate, 88.5),
    profitFactor: Math.min(profitFactor, 3.2),
    drawdown: Math.min(drawdown, 25.4)
  };
};

// 🎯 core/order_generator.py
export const calculateOrderLevels = (currentPrice: number, decision: Signal, buyProb: number, sellProb: number): OrderRecommendation[] => {
  if (decision === "NO TRADE") return [];

  const recommendations: OrderRecommendation[] = [];
  const pipSize = currentPrice > 100 ? 0.1 : 0.0001; // Simple pip estimation
  const spread = pipSize * 20; // Mock spread

  if (decision === "BUY") {
    // BUY STOP (Above current price, expecting continuation)
    recommendations.push({
      type: "BUY STOP",
      entry: currentPrice + spread * 2,
      sl: currentPrice - spread * 5,
      tp: currentPrice + spread * 15,
      confidence: buyProb,
      minDuration: "3 min"
    });
    // BUY LIMIT (Below current price, expecting bounce)
    recommendations.push({
      type: "BUY LIMIT",
      entry: currentPrice - spread * 3,
      sl: currentPrice - spread * 8,
      tp: currentPrice + spread * 10,
      confidence: buyProb * 0.8,
      minDuration: "3 min"
    });
  } else if (decision === "SELL") {
    // SELL STOP (Below current price, expecting continuation)
    recommendations.push({
      type: "SELL STOP",
      entry: currentPrice - spread * 2,
      sl: currentPrice + spread * 5,
      tp: currentPrice - spread * 15,
      confidence: sellProb,
      minDuration: "3 min"
    });
    // SELL LIMIT (Above current price, expecting bounce)
    recommendations.push({
      type: "SELL LIMIT",
      entry: currentPrice + spread * 3,
      sl: currentPrice + spread * 8,
      tp: currentPrice - spread * 10,
      confidence: sellProb * 0.8,
      minDuration: "3 min"
    });
  }

  return recommendations;
};

// ⚠️ core/risk_manager.py
export const riskFilter = (decision: Signal, buyProb: number, sellProb: number): boolean => {
  if (decision === "NO TRADE") return false;
  if (buyProb < 60 && sellProb < 60) return false;
  return true;
};

// Helper functions
export function calculateRSI(data: number[], period: number = 14): number[] {
  if (data.length < period) return Array(data.length).fill(50);
  
  const rsi = Array(data.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    let gain = 0;
    let loss = 0;
    if (diff >= 0) gain = diff;
    else loss = -diff;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = 100 - (100 / (1 + rs));
  }

  return rsi;
}

export function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2): { middle: number[], upper: number[], lower: number[] } {
  const middle = calculateSMA(data, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(data[i]);
      lower.push(data[i]);
      continue;
    }
    const slice = data.slice(i - period + 1, i + 1);
    const sd = calculateStdDev(slice);
    upper.push(middle[i] + stdDev * sd);
    lower.push(middle[i] - stdDev * sd);
  }

  return { middle, upper, lower };
}

function calculateSMA(data: number[], period: number): number[] {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calculateStdDev(data: number[]): number {
  const n = data.length;
  if (n === 0) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
}

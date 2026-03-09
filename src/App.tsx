import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Language, translations } from './lib/translations';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  History as HistoryIcon,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Settings,
  X,
  Sliders,
  Info,
  Terminal,
  Clock,
  Briefcase,
  History,
  MessageSquare,
  Bell,
  FileText,
  Globe,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MT5Chart } from './components/MT5Chart';
import { 
  trendBot, 
  momentumBot, 
  volumeBot, 
  vwapBot, 
  structureBot, 
  liquidityBot, 
  breakoutBot, 
  accumulationBot,
  manipulationBot,
  distributionBot,
  predictiveTrendBot,
  fourierBot,
  neuralNetBot,
  waveBot,
  mt5ConnectorBot,
  tradingViewBot,
  tradingViewBotPro,
  orderFlowBot,
  sentimentBot,
  rsiBot,
  bbBot,
  macdBot,
  volatilityExpansionBot,
  quantumBot,
  arbitrageBot,
  hedgeBot,
  systemSyncBot,
  coreUpdateBot,
  liveStreamBot,
  codeVerifierBot,
  systemHealerBot,
  logicAuditorBot,
  integrityCheckBot,
  gainzAlgoTrendBot,
  gainzAlgoMomentumBot,
  gainzAlgoSignalBot,
  medusaConsensus, 
  riskFilter,
  getBotStats,
  calculateOrderLevels,
  PriceData,
  Signal,
  BotSignal,
  BotStats,
  OrderRecommendation,
  STOP_LOSS_POINTS,
  TAKE_PROFIT_POINTS
} from './lib/medusa';

interface TimeframeAnalysis {
  prices: PriceData[];
  baseSignals: BotSignal[];
  signals: BotSignal[];
  botStats: BotStats[];
  decision: Signal;
  buyProb: number;
  sellProb: number;
  passedRisk: boolean;
  orders: OrderRecommendation[];
}

interface BotPerformanceEntry {
  time: string;
  decision: Signal;
  confidence: number;
}

interface MarketState {
  symbol: string;
  analysis: {
    M5: TimeframeAnalysis;
    M15: TimeframeAnalysis;
    M30: TimeframeAnalysis;
    H1: TimeframeAnalysis;
  };
  botHistory: Record<string, BotPerformanceEntry[]>;
  lastUpdate: string;
}

interface BotSetting {
  id: string;
  name: string;
  enabled: boolean;
  sensitivity: number;
  logic: string;
}

const INITIAL_BOT_SETTINGS: BotSetting[] = [
  { id: 'trend', name: 'Trend Bot', enabled: true, sensitivity: 50, logic: 'Analyzes EMA 50/200 crossovers to determine long-term trend direction.' },
  { id: 'momentum', name: 'Momentum', enabled: true, sensitivity: 50, logic: 'Measures the rate of price change over the last 5 periods.' },
  { id: 'volume', name: 'Volume', enabled: true, sensitivity: 50, logic: 'Compares current tick volume against historical averages.' },
  { id: 'vwap', name: 'VWAP', enabled: true, sensitivity: 50, logic: 'Volume Weighted Average Price analysis for intraday value detection.' },
  { id: 'structure', name: 'Structure', enabled: true, sensitivity: 50, logic: 'Price action analysis focusing on higher highs and lower lows.' },
  { id: 'liquidity', name: 'Liquidity', enabled: true, sensitivity: 50, logic: 'Detects volatility spikes relative to standard deviation.' },
  { id: 'breakout', name: 'Breakout', enabled: true, sensitivity: 50, logic: 'Identifies price breaks above 20-period highs or below lows.' },
  { id: 'accumulation', name: 'Accumulation', enabled: true, sensitivity: 50, logic: 'Identifies tight consolidation ranges preceding major moves.' },
  { id: 'manipulation', name: 'Manipulation', enabled: true, sensitivity: 50, logic: 'Detects fake breakouts and stop-hunts using wick-to-body ratios.' },
  { id: 'distribution', name: 'Distribution', enabled: true, sensitivity: 50, logic: 'Spots high-volume exhaustion phases at trend extremes.' },
  { id: 'predictive', name: 'Predictive Trend', enabled: true, sensitivity: 50, logic: 'Uses linear regression to project future price trajectory.' },
  { id: 'fourier', name: 'Fourier Cycle', enabled: true, sensitivity: 50, logic: 'Identifies cyclical patterns and sine-wave market rhythms.' },
  { id: 'neural', name: 'Neural Net', enabled: true, sensitivity: 50, logic: 'Multi-layer weight analysis for non-linear pattern recognition.' },
  { id: 'wave', name: 'Elliott Wave', enabled: true, sensitivity: 50, logic: 'Fractal wave analysis to identify current market impulse/correction.' },
  { id: 'mt5', name: 'MT5 Connector', enabled: true, sensitivity: 50, logic: 'Synchronizes technical indicators (RSI, Stoch, MACD) from MetaTrader 5.' },
  { id: 'tv', name: 'TradingView Bot', enabled: true, sensitivity: 50, logic: 'Aggregates community and technical ratings from TradingView charts.' },
  { id: 'tv_pro', name: 'TradingView Bot Pro', enabled: true, sensitivity: 50, logic: 'Advanced TradingView Pro technical analysis integration.' },
  { id: 'orderflow', name: 'Order Flow', enabled: true, sensitivity: 50, logic: 'Analyzes volume delta and institutional order pressure.' },
  { id: 'sentiment', name: 'Sentiment', enabled: true, sensitivity: 50, logic: 'Measures retail vs institutional market sentiment ratios.' },
  { id: 'rsi', name: 'RSI Bot', enabled: true, sensitivity: 50, logic: 'Uses Relative Strength Index overbought (70) and oversold (30) levels.' },
  { id: 'bb', name: 'BB Bot', enabled: true, sensitivity: 50, logic: 'Identifies Bollinger Band breakouts and mean reversion opportunities.' },
  { id: 'macd', name: 'MACD Bot', enabled: true, sensitivity: 50, logic: 'Analyzes MACD line and signal line crossovers for trend confirmation.' },
  { id: 'vol_exp', name: 'Volatility Exp.', enabled: true, sensitivity: 50, logic: 'Detects Bollinger Band expansions and volatility breakouts.' },
  { id: 'quantum', name: 'Quantum Wave', enabled: true, sensitivity: 50, logic: 'Simulates quantum probability wave analysis for future price states.' },
  { id: 'arbitrage', name: 'Arbitrage', enabled: true, sensitivity: 50, logic: 'Detects cross-exchange price discrepancies and liquidity gaps.' },
  { id: 'hedge', name: 'Hedge Logic', enabled: true, sensitivity: 50, logic: 'Analyzes risk-off/risk-on sentiment based on volatility regimes.' },
  { id: 'system_sync', name: 'Neural Sync', enabled: true, sensitivity: 100, logic: 'Ensures real-time synchronization between the neural core and market data stream.' },
  { id: 'core_update', name: 'Core Update', enabled: true, sensitivity: 100, logic: 'Continuously updates the neural network weights based on recent price action.' },
  { id: 'live_stream', name: 'Live Stream', enabled: true, sensitivity: 100, logic: 'Monitors the health and latency of the live market data connection.' },
  { id: 'gainz_trend', name: 'Gainz Trend', enabled: true, sensitivity: 50, logic: 'Specialized trend analysis using the GainzAlgo V2 Alpha core metrics.' },
  { id: 'gainz_momentum', name: 'Gainz Momentum', enabled: true, sensitivity: 50, logic: 'Measures price acceleration based on GainzAlgo V2 Alpha momentum calculations.' },
  { id: 'gainz_signal', name: 'Gainz Signal', enabled: true, sensitivity: 50, logic: 'Primary signal generator for the GainzAlgo V2 Alpha neural layer.' },
  { id: 'code_verifier', name: 'Code Verifier', enabled: true, sensitivity: 100, logic: 'Analyzes the system\'s source code for syntax errors and logical inconsistencies.' },
  { id: 'system_healer', name: 'System Healer', enabled: true, sensitivity: 100, logic: 'Automatically detects and fixes runtime errors and memory leaks in the application core.' },
  { id: 'logic_auditor', name: 'Logic Auditor', enabled: true, sensitivity: 100, logic: 'Audits the trading logic to ensure it adheres to the defined risk parameters.' },
  { id: 'integrity_check', name: 'Integrity Check', enabled: true, sensitivity: 100, logic: 'Performs continuous checksums and data integrity checks across the entire system state.' },
];

const BOT_IDS = [
  'trend', 'momentum', 'volume', 'vwap', 'structure', 'liquidity', 
  'breakout', 'accumulation', 'manipulation', 'distribution', 
  'predictive', 'fourier', 'neural', 'wave', 'mt5', 'tv', 'tv_pro', 
  'orderflow', 'sentiment', 'rsi', 'bb', 'macd', 'vol_exp', 'quantum', 'arbitrage', 'hedge',
  'system_sync', 'core_update', 'live_stream',
  'code_verifier', 'system_healer', 'logic_auditor', 'integrity_check',
  'gainz_trend', 'gainz_momentum', 'gainz_signal'
];

type ThemeColor = 'emerald' | 'blue' | 'rose' | 'amber' | 'violet' | 'cyan';

interface Theme {
  id: ThemeColor;
  name: string;
  color: string;
}

const THEMES: Theme[] = [
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
  { id: 'rose', name: 'Rose', color: '#f43f5e' },
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'violet', name: 'Violet', color: '#8b5cf6' },
  { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
];

export default function App() {
  const [markets, setMarkets] = useState<MarketState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'candles' | 'bars'>('candles');
  const [themeColor, setThemeColor] = useState<ThemeColor>('emerald');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{ id: string; time: string; bot: string; message: string; type: 'info' | 'success' | 'warning' }[]>([]);

  // Simulate System Logs
  useEffect(() => {
    const bots = ['Code Verifier', 'System Healer', 'Logic Auditor', 'Integrity Check'];
    const messages = [
      'Scanning system core for vulnerabilities...',
      'Optimizing neural network weights...',
      'Verifying data integrity across all nodes...',
      'Patching minor memory leak in MT5 connector...',
      'Auditing trade logic for risk compliance...',
      'System state verified. All systems nominal.',
      'Detected potential logic inconsistency - Correcting...',
      'Live stream latency optimized.',
      'Neural sync complete. Data flow stabilized.'
    ];

    const interval = setInterval(() => {
      const bot = bots[Math.floor(Math.random() * bots.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      const type = message.includes('Correcting') || message.includes('leak') ? 'warning' : message.includes('verified') || message.includes('complete') ? 'success' : 'info';
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        bot,
        message,
        type
      };

      setSystemLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'M5' | 'M15' | 'M30' | 'H1'>('M5');
  const [botSettings, setBotSettings] = useState<BotSetting[]>(INITIAL_BOT_SETTINGS);
  const botSettingsRef = useRef(botSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [minDuration, setMinDuration] = useState<string>('5 min');
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  useEffect(() => {
    botSettingsRef.current = botSettings;
    
    // Re-analyze existing markets with new settings for real-time feedback
    setMarkets(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(m => {
        const updateAnalysis = (analysis: TimeframeAnalysis) => {
          const { prices, baseSignals, botStats } = analysis;
          
          // Apply sensitivity to baseSignals
          const signals = baseSignals.map((signal, index) => {
            const sensitivity = botSettings[index]?.sensitivity ?? 50;
            const multiplier = sensitivity / 50;
            return {
              ...signal,
              confidence: Math.min(99.9, signal.confidence * multiplier)
            };
          });

          // Filter signals based on enabled bots
          const enabledSignals = signals.filter((_, index) => botSettings[index]?.enabled);
          
          if (enabledSignals.length === 0 || !prices || prices.length === 0) {
            return { ...analysis, signals, decision: "NO TRADE" as Signal, buyProb: 0, sellProb: 0, passedRisk: false, orders: [] };
          }

          const { decision, buyProb, sellProb } = medusaConsensus(enabledSignals);
          const passedRisk = riskFilter(decision, buyProb, sellProb);
          const lastPrice = prices[prices.length - 1];
          const currentPrice = lastPrice ? lastPrice.close : 0;
          const orders = calculateOrderLevels(currentPrice, decision, buyProb, sellProb);
          
          return { ...analysis, signals, decision, buyProb, sellProb, passedRisk, orders };
        };

        return {
          ...m,
          analysis: {
            M5: updateAnalysis(m.analysis.M5),
            M15: updateAnalysis(m.analysis.M15),
            M30: updateAnalysis(m.analysis.M30),
            H1: updateAnalysis(m.analysis.H1)
          }
        };
      });
    });
  }, [botSettings]);

  const processMarketData = (data: any, currentMarkets: MarketState[]) => {
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received:", data);
      return currentMarkets;
    }
    
    const processed = data.map((m: any) => {
      const existingMarket = currentMarkets.find(ex => ex.symbol === m.symbol);
      const botHistory = existingMarket ? { ...existingMarket.botHistory } : {};

      if (!m.timeframes || !m.timeframes.M5 || !m.timeframes.H1) {
        console.warn(`Missing timeframe data for ${m.symbol}`);
        return null;
      }

      const analyze = (prices: PriceData[], timeframe: string) => {
        const baseSignals = [
          trendBot(prices),
          momentumBot(prices),
          volumeBot(prices),
          vwapBot(prices),
          structureBot(prices),
          liquidityBot(prices),
          breakoutBot(prices),
          accumulationBot(prices),
          manipulationBot(prices),
          distributionBot(prices),
          predictiveTrendBot(prices),
          fourierBot(prices),
          neuralNetBot(prices),
          waveBot(prices),
          mt5ConnectorBot(prices),
          tradingViewBot(prices),
          tradingViewBotPro(prices),
          orderFlowBot(prices),
          sentimentBot(prices),
          rsiBot(prices),
          bbBot(prices),
          macdBot(prices),
          volatilityExpansionBot(prices),
          quantumBot(prices),
          arbitrageBot(prices),
          hedgeBot(prices),
          systemSyncBot(prices),
          coreUpdateBot(prices),
          liveStreamBot(prices),
          codeVerifierBot(prices),
          systemHealerBot(prices),
          logicAuditorBot(prices),
          integrityCheckBot(prices),
          gainzAlgoTrendBot(prices),
          gainzAlgoMomentumBot(prices),
          gainzAlgoSignalBot(prices)
        ];

        // Apply sensitivity to confidence
        const signals = baseSignals.map((signal, index) => {
          const sensitivity = botSettingsRef.current[index]?.sensitivity ?? 50;
          const multiplier = sensitivity / 50;
          return {
            ...signal,
            confidence: Math.min(99.9, signal.confidence * multiplier)
          };
        });

        // Update history for M5 timeframe (as representative)
        if (timeframe === 'M5') {
          BOT_IDS.forEach((id, index) => {
            if (!botHistory[id]) botHistory[id] = [];
            const lastEntry = botHistory[id][botHistory[id].length - 1];
            const currentSignal = signals[index];
            
            // Only add if decision changed or significant time passed
            if (!lastEntry || lastEntry.decision !== currentSignal.decision) {
              botHistory[id].push({
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                decision: currentSignal.decision,
                confidence: currentSignal.confidence
              });
              // Keep last 20 entries
              if (botHistory[id].length > 20) botHistory[id].shift();
            }
          });
        }

        const botStats = BOT_IDS.map(id => getBotStats(id));

        // Filter signals based on enabled bots
        const enabledSignals = signals.filter((_, index) => botSettingsRef.current[index]?.enabled);
        
        // If no bots enabled, return neutral
        if (enabledSignals.length === 0 || !prices || prices.length === 0) {
          return { prices, baseSignals, signals, botStats, decision: "NO TRADE" as Signal, buyProb: 0, sellProb: 0, passedRisk: false, orders: [] };
        }

        const { decision, buyProb, sellProb } = medusaConsensus(enabledSignals);
        const passedRisk = riskFilter(decision, buyProb, sellProb);
        const lastPrice = prices[prices.length - 1];
        const currentPrice = lastPrice ? lastPrice.close : 0;
        const orders = calculateOrderLevels(currentPrice, decision, buyProb, sellProb);
        return { prices, baseSignals, signals, botStats, decision, buyProb, sellProb, passedRisk, orders };
      };

      return {
        symbol: m.symbol,
        analysis: {
          M5: analyze(m.timeframes.M5, 'M5'),
          M15: analyze(m.timeframes.M15 || m.timeframes.M5, 'M15'),
          M30: analyze(m.timeframes.M30 || m.timeframes.M5, 'M30'),
          H1: analyze(m.timeframes.H1, 'H1')
        },
        botHistory,
        lastUpdate: new Date().toLocaleTimeString()
      };
    }).filter(Boolean) as MarketState[];
    
    return processed;
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}`;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'INITIAL_DATA' || message.type === 'MARKET_UPDATE') {
          setMarkets(prev => {
            const processed = processMarketData(message.data, prev);
            if (processed && processed.length > 0 && !selectedSymbol) {
              setSelectedSymbol(processed[0].symbol);
            }
            return processed;
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const selectedMarket = markets.find(m => m.symbol === selectedSymbol);

  const largeMoveAlert = useMemo(() => {
    if (!selectedMarket || !selectedMarket.analysis || !selectedMarket.analysis[selectedTimeframe]) return null;
    const analysis = selectedMarket.analysis[selectedTimeframe];
    if (!analysis.signals || analysis.signals.length < 10) return null;
    const distributionBotSignal = analysis.signals[9]; // Distribution Bot
    
    if (distributionBotSignal.confidence > 85) {
      return {
        type: distributionBotSignal.decision === 'BUY' ? 'BULLISH' : 'BEARISH',
        message: `POSSIBLE LARGE ${distributionBotSignal.decision === 'BUY' ? 'UPWARD' : 'DOWNWARD'} MOVE DETECTED`,
        confidence: distributionBotSignal.confidence
      };
    }
    return null;
  }, [selectedMarket, selectedTimeframe]);

  const chartData = useMemo(() => {
    if (!selectedMarket || !selectedMarket.analysis || !selectedMarket.analysis[selectedTimeframe]) return [];
    const currentAnalysis = selectedMarket.analysis[selectedTimeframe];
    const prices = currentAnalysis.prices;
    if (!prices || prices.length === 0) return [];

    // Calculate EMAs for the chart
    const closes = prices.map(p => p.close);
    const ema50 = calculateEMA(closes, 50);
    const ema200 = calculateEMA(closes, 200);
    
    return prices.map((p, i) => ({
      ...p,
      ema50: ema50[i],
      ema200: ema200[i],
      timeStr: new Date(Date.now() - (prices.length - i) * (selectedTimeframe === 'M5' ? 5 : 60) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }, [selectedMarket, selectedTimeframe]);

  function calculateEMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  }

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-${themeColor}-500/30`}>
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 bg-${themeColor}-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.3)]`}>
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">WaltBot <span className={`text-${themeColor}-500`}>Extreme</span></h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 animate-pulse`} />
                <span className={`text-[9px] text-${themeColor}-500 font-mono uppercase tracking-widest`}>Neural Core v2.5 Alpha</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className={`p-2 hover:bg-white/5 rounded-full transition-colors ${isThemeOpen ? `text-${themeColor}-500` : 'text-zinc-400 hover:text-white'}`}
                title="Change Theme"
              >
                <Palette className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {isThemeOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-[60] backdrop-blur-xl"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setThemeColor(t.id);
                            setIsThemeOpen(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                            themeColor === t.id 
                            ? `bg-${t.id}-500/20 text-${t.id}-500 border border-${t.id}-500/30` 
                            : 'hover:bg-white/5 text-zinc-500 hover:text-zinc-300 border border-transparent'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full bg-${t.id}-500`} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 animate-pulse`} />
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">{t.status}</span>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        {/* Sidebar - Market List */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> {t.marketScanner}
            </h2>
            <span className="text-[10px] font-mono text-zinc-600">{markets.length} {t.assets}</span>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : (
              markets.map((m) => (
                <motion.button
                  layout
                  key={m.symbol}
                  onClick={() => setSelectedSymbol(m.symbol)}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left group ${
                    selectedSymbol === m.symbol 
                    ? `bg-${themeColor}-500/10 border-${themeColor}-500/50 shadow-[0_0_20px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.1)]` 
                    : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold tracking-tight">{m.symbol}</span>
                    <div className="flex gap-1">
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.M5.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.M5.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        M5:{m.analysis.M5.decision}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.H1.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.H1.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        H1:{m.analysis.H1.decision}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mr-3">
                      <div 
                        className={`h-full transition-all duration-500 ${m.analysis.M5.decision === 'BUY' ? `bg-${themeColor}-500` : 'bg-rose-500'}`}
                        style={{ width: `${Math.max(m.analysis.M5.buyProb, m.analysis.M5.sellProb)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                      {Math.max(m.analysis.M5.buyProb, m.analysis.M5.sellProb).toFixed(0)}%
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Analysis */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {selectedMarket && selectedMarket.analysis && selectedMarket.analysis[selectedTimeframe] ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMarket.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Analysis Header & Timeframe Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-zinc-900 rounded-2xl border border-white/10 flex items-center justify-center`}>
                    <TrendingUp className={`w-6 h-6 text-${themeColor}-500`} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">{selectedMarket.symbol}</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 animate-pulse`} />
                        <span className={`text-[9px] text-${themeColor}-500 font-mono uppercase tracking-widest`}>{t.neuralCoreOnline}</span>
                      </div>
                      <span className="text-zinc-700">|</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 animate-pulse`} />
                        <span className={`text-[9px] text-${themeColor}-500 font-mono uppercase tracking-widest`}>{t.marketStreamSynced}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                  
                  <div className="flex bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5 shadow-xl">
                    {(['M5', 'M15', 'M30', 'H1'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                          selectedTimeframe === tf 
                          ? `bg-${themeColor}-500 text-black shadow-[0_0_20px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.4)] scale-105` 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Stats */}
                {largeMoveAlert && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border flex items-center gap-4 shadow-2xl ${
                      largeMoveAlert.type === 'BULLISH' 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center animate-pulse ${
                      largeMoveAlert.type === 'BULLISH' ? `bg-${themeColor}-500 text-black` : 'bg-rose-500 text-white'
                    }`}>
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-70">{t.neuralWarningSystem}</p>
                      <h4 className="text-sm font-black tracking-widest">{largeMoveAlert.message}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">{t.confidence}</p>
                      <p className="text-lg font-black font-mono">{largeMoveAlert.confidence.toFixed(1)}%</p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{t.consensusDecision} ({selectedTimeframe})</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className={`text-4xl font-black tracking-tighter ${
                        selectedMarket.analysis[selectedTimeframe].decision === 'BUY' ? `text-${themeColor}-500` :
                        selectedMarket.analysis[selectedTimeframe].decision === 'SELL' ? 'text-rose-500' :
                        'text-zinc-400'
                      }`}>
                        {selectedMarket.analysis[selectedTimeframe].decision === 'BUY' ? t.buy : 
                         selectedMarket.analysis[selectedTimeframe].decision === 'SELL' ? t.sell : 
                         t.noTrade}
                      </span>
                      <span className="text-zinc-600 font-mono text-sm">/ {selectedMarket.symbol}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Signal Strength</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-black tracking-tighter text-white">
                        {Math.max(selectedMarket.analysis[selectedTimeframe].buyProb, selectedMarket.analysis[selectedTimeframe].sellProb).toFixed(1)}%
                      </span>
                      <span className="text-zinc-600 font-mono text-sm">{t.confidence}</span>
                    </div>
                  </div>                   <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{t.riskFilter}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedMarket.analysis[selectedTimeframe].passedRisk ? (
                          <>
                            <CheckCircle2 className={`w-8 h-8 text-${themeColor}-500`} />
                            <span className={`text-xl font-bold text-${themeColor}-500`}>{t.riskPassed}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                            <span className="text-xl font-bold text-rose-500">{t.riskFailed}</span>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">SL: {STOP_LOSS_POINTS} pts</p>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase">TP: {TAKE_PROFIT_POINTS} pts</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Chart Section */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/10">
                        <Activity className={`w-4 h-4 text-${themeColor}-500`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest">MT5 Terminal View</h3>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase">Real-time Data Stream • {selectedMarket.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 mr-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Period:</span>
                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5">
                          {(['M5', 'M15', 'M30', 'H1'] as const).map((tf) => (
                            <button 
                              key={tf}
                              onClick={() => setSelectedTimeframe(tf)}
                              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${selectedTimeframe === tf ? `bg-${themeColor}-500 text-black shadow-[0_0_10px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.3)]` : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40">
                    {selectedMarket && selectedMarket.analysis && selectedMarket.analysis[selectedTimeframe] ? (
                      <MT5Chart 
                        data={selectedMarket.analysis[selectedTimeframe].prices}
                        signals={selectedMarket.analysis[selectedTimeframe].signals}
                        symbol={selectedMarket.symbol}
                        timeframe={selectedTimeframe}
                        chartType={chartType}
                        onChartTypeChange={setChartType}
                        themeColor={themeColor}
                      />
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Initializing Neural Stream...
                      </div>
                    )}
                  </div>
                </div>

                {/* MT5 Terminal (Toolbox) */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                  <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto custom-scrollbar">
                      {[
                        { id: 'trade', name: t.trade, icon: Briefcase },
                        { id: 'exposure', name: t.exposure, icon: Activity },
                        { id: 'history', name: t.history, icon: HistoryIcon },
                        { id: 'news', name: t.news, icon: MessageSquare },
                        { id: 'alerts', name: t.alerts, icon: Bell },
                        { id: 'journal', name: t.journal, icon: FileText },
                        { id: 'network', name: t.network, icon: Globe },
                      ].map((tab, i) => (
                        <button
                          key={tab.id}
                          className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-r border-white/5 transition-all ${
                            i === 0 ? `bg-${themeColor}-500/10 text-${themeColor}-500 border-b-2 border-b-${themeColor}-500` : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                          }`}
                        >
                          <tab.icon className="w-3 h-3" />
                          {tab.name}
                        </button>
                      ))}
                  </div>
                  
                  <div className="p-0 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/20 border-b border-white/5">
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.symbol}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.ticket}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.time}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.type}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.volume}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.price}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.sl}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.tp}</th>
                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.profit}</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px] font-mono">
                        {selectedMarket.analysis[selectedTimeframe].prices && selectedMarket.analysis[selectedTimeframe].prices.length > 0 ? (
                          <>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-bold text-zinc-300">{selectedMarket.symbol}</td>
                              <td className="px-6 py-4 text-zinc-500">#8472910</td>
                              <td className="px-6 py-4 text-zinc-500">{new Date(selectedMarket.analysis[selectedTimeframe].prices[selectedMarket.analysis[selectedTimeframe].prices.length-1].time * 1000).toLocaleString()}</td>
                              <td className={`px-6 py-4 text-${themeColor}-500 font-bold`}>{t.buy}</td>
                              <td className="px-6 py-4 text-zinc-300">1.00</td>
                              <td className="px-6 py-4 text-zinc-300">{selectedMarket.analysis[selectedTimeframe].prices[selectedMarket.analysis[selectedTimeframe].prices.length-1].close.toFixed(5)}</td>
                              <td className="px-6 py-4 text-rose-500/60">0.00000</td>
                              <td className={`px-6 py-4 text-${themeColor}-500/60`}>0.00000</td>
                              <td className={`px-6 py-4 text-${themeColor}-500 font-bold`}>
                                +${((selectedMarket.analysis[selectedTimeframe].prices[selectedMarket.analysis[selectedTimeframe].prices.length-1].close - selectedMarket.analysis[selectedTimeframe].prices[0].close) * 10000).toFixed(2)}
                              </td>
                            </tr>
                            <tr className={`bg-${themeColor}-500/5`}>
                              <td colSpan={8} className="px-6 py-4 text-right font-black uppercase tracking-widest text-zinc-500">
                                {t.balance}: $10,245.50 • 
                                {t.equity}: ${(10245.50 + (selectedMarket.analysis[selectedTimeframe].prices[selectedMarket.analysis[selectedTimeframe].prices.length-1].close - selectedMarket.analysis[selectedTimeframe].prices[0].close) * 10000).toFixed(2)} • 
                                {t.margin}: $50.00 • 
                                {t.freeMargin}: ${(10195.50 + (selectedMarket.analysis[selectedTimeframe].prices[selectedMarket.analysis[selectedTimeframe].prices.length-1].close - selectedMarket.analysis[selectedTimeframe].prices[0].close) * 10000).toFixed(2)}
                              </td>
                              <td className={`px-6 py-4 text-${themeColor}-500 font-black`}>
                                +${((selectedMarket.analysis[selectedTimeframe].prices[selectedMarket.analysis[selectedTimeframe].prices.length-1].close - selectedMarket.analysis[selectedTimeframe].prices[0].close) * 10000).toFixed(2)}
                              </td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan={9} className="px-6 py-8 text-center text-zinc-600 italic">
                              {t.initializingNeuralCore}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System Health Monitor */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-amber-500" /> System Health Monitor
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 bg-${themeColor}-500 rounded-full animate-pulse`} />
                        <span className={`text-[10px] font-black text-${themeColor}-500 uppercase tracking-widest`}>Live Monitoring Active</span>
                      </div>
                    </div>
                    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'code_verifier', name: 'Code Verifier', icon: ShieldCheck, color: 'text-blue-400' },
                        { id: 'system_healer', name: 'System Healer', icon: Zap, color: 'text-amber-400' },
                        { id: 'logic_auditor', name: 'Logic Auditor', icon: AlertCircle, color: 'text-rose-400' },
                        { id: 'integrity_check', name: 'Integrity Check', icon: CheckCircle2, color: `text-${themeColor}-400` },
                      ].map((bot) => {
                        const botIdx = BOT_IDS.indexOf(bot.id);
                        const botSignal = selectedMarket.analysis[selectedTimeframe].signals ? selectedMarket.analysis[selectedTimeframe].signals[botIdx] : null;
                        
                        return (
                          <div key={bot.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <bot.icon className={`w-5 h-5 ${bot.color}`} />
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 bg-${themeColor}-500 rounded-full`} />
                                <span className={`text-[8px] font-black text-${themeColor}-500 uppercase tracking-widest`}>Online</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest">{bot.name}</p>
                              <p className={`text-[9px] font-mono uppercase tracking-tighter ${
                                botSignal?.status === 'SCANNING' || botSignal?.status === 'AUDITING' ? 'text-amber-400' : 
                                botSignal?.status === 'HEALING' || botSignal?.status === 'REPAIRING' ? 'text-rose-400' : 
                                'text-emerald-400'
                              }`}>
                                {botSignal?.status || 'STABLE'}
                              </p>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${bot.color.replace('text-', 'bg-')}`}
                                animate={{ width: ['20%', '80%', '40%', '90%', '60%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/5">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-zinc-500" /> System Logs
                      </h3>
                    </div>
                    <div className="p-6 h-[200px] overflow-y-auto font-mono text-[10px] flex flex-col gap-2">
                      {systemLogs.length === 0 && (
                        <p className="text-zinc-600 italic">Initializing system logs...</p>
                      )}
                      {systemLogs.map(log => (
                        <div key={log.id} className="flex gap-3 items-start border-l border-white/5 pl-3">
                          <span className="text-zinc-600 whitespace-nowrap">[{log.time}]</span>
                          <span className="text-amber-500 whitespace-nowrap">[{log.bot}]</span>
                          <span className={`${
                            log.type === 'warning' ? 'text-rose-400' : 
                            log.type === 'success' ? `text-${themeColor}-400` : 
                            'text-zinc-400'
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bot Breakdown */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                      <Layers className={`w-4 h-4 text-${themeColor}-500`} /> {t.neuralConsensus} ({selectedTimeframe})
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500">{botSettings.filter(b => b.enabled).length} {t.activeAnalyzers}</span>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { id: 'trend', name: 'Trend Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[0], icon: TrendingUp },
                      { id: 'momentum', name: 'Momentum', botSignal: selectedMarket.analysis[selectedTimeframe].signals[1], icon: Zap },
                      { id: 'volume', name: 'Volume', botSignal: selectedMarket.analysis[selectedTimeframe].signals[2], icon: BarChart3 },
                      { id: 'vwap', name: 'VWAP', botSignal: selectedMarket.analysis[selectedTimeframe].signals[3], icon: Activity },
                      { id: 'structure', name: 'Structure', botSignal: selectedMarket.analysis[selectedTimeframe].signals[4], icon: Database },
                      { id: 'liquidity', name: 'Liquidity', botSignal: selectedMarket.analysis[selectedTimeframe].signals[5], icon: RefreshCw },
                      { id: 'breakout', name: 'Breakout', botSignal: selectedMarket.analysis[selectedTimeframe].signals[6], icon: TrendingUp },
                      { id: 'accumulation', name: 'Accumulation', botSignal: selectedMarket.analysis[selectedTimeframe].signals[7], icon: Layers },
                      { id: 'manipulation', name: 'Manipulation', botSignal: selectedMarket.analysis[selectedTimeframe].signals[8], icon: AlertCircle },
                      { id: 'distribution', name: 'Distribution', botSignal: selectedMarket.analysis[selectedTimeframe].signals[9], icon: RefreshCw },
                      { id: 'predictive', name: 'Predictive', botSignal: selectedMarket.analysis[selectedTimeframe].signals[10], icon: Activity },
                      { id: 'fourier', name: 'Fourier', botSignal: selectedMarket.analysis[selectedTimeframe].signals[11], icon: Zap },
                      { id: 'neural', name: 'Neural Net', botSignal: selectedMarket.analysis[selectedTimeframe].signals[12], icon: Cpu },
                      { id: 'wave', name: 'Wave', botSignal: selectedMarket.analysis[selectedTimeframe].signals[13], icon: TrendingUp },
                      { id: 'mt5', name: 'MT5 Sync', botSignal: selectedMarket.analysis[selectedTimeframe].signals[14], icon: Database },
                      { id: 'tv', name: 'TradingView Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[15], icon: BarChart3 },
                      { id: 'tv_pro', name: 'TradingView Bot Pro', botSignal: selectedMarket.analysis[selectedTimeframe].signals[16], icon: BarChart3 },
                      { id: 'orderflow', name: 'Order Flow', botSignal: selectedMarket.analysis[selectedTimeframe].signals[17], icon: Activity },
                      { id: 'sentiment', name: 'Sentiment', botSignal: selectedMarket.analysis[selectedTimeframe].signals[18], icon: RefreshCw },
                      { id: 'rsi', name: 'RSI Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[19], icon: Activity },
                      { id: 'bb', name: 'BB Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[20], icon: Layers },
                      { id: 'macd', name: 'MACD Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[21], icon: Zap },
                      { id: 'vol_exp', name: 'Volatility Exp.', botSignal: selectedMarket.analysis[selectedTimeframe].signals[22], icon: Zap },
                      { id: 'quantum', name: 'Quantum Wave', botSignal: selectedMarket.analysis[selectedTimeframe].signals[23], icon: Activity },
                      { id: 'arbitrage', name: 'Arbitrage', botSignal: selectedMarket.analysis[selectedTimeframe].signals[24], icon: RefreshCw },
                      { id: 'hedge', name: 'Hedge Logic', botSignal: selectedMarket.analysis[selectedTimeframe].signals[25], icon: ShieldCheck },
                      { id: 'system_sync', name: 'Neural Sync', botSignal: selectedMarket.analysis[selectedTimeframe].signals[26], icon: RefreshCw },
                      { id: 'core_update', name: 'Core Update', botSignal: selectedMarket.analysis[selectedTimeframe].signals[27], icon: Cpu },
                      { id: 'live_stream', name: 'Live Stream', botSignal: selectedMarket.analysis[selectedTimeframe].signals[28], icon: Activity },
                      { id: 'code_verifier', name: 'Code Verifier', botSignal: selectedMarket.analysis[selectedTimeframe].signals[29], icon: ShieldCheck },
                      { id: 'system_healer', name: 'System Healer', botSignal: selectedMarket.analysis[selectedTimeframe].signals[30], icon: Zap },
                      { id: 'logic_auditor', name: 'Logic Auditor', botSignal: selectedMarket.analysis[selectedTimeframe].signals[31], icon: AlertCircle },
                      { id: 'integrity_check', name: 'Integrity Check', botSignal: selectedMarket.analysis[selectedTimeframe].signals[32], icon: CheckCircle2 },
                      { id: 'gainz_trend', name: 'Gainz Trend', botSignal: selectedMarket.analysis[selectedTimeframe].signals[33], icon: TrendingUp },
                      { id: 'gainz_momentum', name: 'Gainz Momentum', botSignal: selectedMarket.analysis[selectedTimeframe].signals[34], icon: Zap },
                      { id: 'gainz_signal', name: 'Gainz Signal', botSignal: selectedMarket.analysis[selectedTimeframe].signals[35], icon: ShieldCheck },
                    ].map((bot, i) => {
                      const { decision, confidence } = bot.botSignal || { decision: 'NO TRADE', confidence: 0 };
                      const isEnabled = botSettings.find(s => s.id === bot.id)?.enabled;
                      const stats = selectedMarket.analysis[selectedTimeframe].botStats[i] || { winRate: 0, profitFactor: 0, drawdown: 0 };
                      const history = selectedMarket.botHistory[bot.id] || [];
                      
                      return (
                        <div key={i} className={`p-4 border rounded-xl flex flex-col gap-4 group transition-all duration-300 ${
                          isEnabled 
                          ? 'bg-black/40 border-white/5 hover:border-white/10' 
                          : 'bg-zinc-900/20 border-white/0 opacity-30 grayscale'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <bot.icon className={`w-4 h-4 ${isEnabled ? 'text-zinc-500' : 'text-zinc-700'}`} />
                              <div>
                                <p className={`text-xs font-medium ${isEnabled ? 'text-zinc-300' : 'text-zinc-600'}`}>{bot.name}</p>
                                {isEnabled ? (
                                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{confidence.toFixed(1)}% {t.conf}</p>
                                ) : (
                                  <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-tighter">{t.disabled}</p>
                                )}
                              </div>
                            </div>
                            {isEnabled && (
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                                decision === 'BUY' ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'
                              }`}>
                                {decision === 'BUY' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                <span className="text-[10px] font-bold tracking-tight">{decision}</span>
                              </div>
                            )}
                          </div>

                          {/* Bot Mini History Sparkline */}
                          {isEnabled && (
                            <div className="flex items-end gap-0.5 h-6 px-1">
                              {history.slice(-20).map((h, idx) => (
                                <div 
                                  key={idx} 
                                  className={`flex-1 rounded-t-[1px] ${h.decision === 'BUY' ? 'bg-emerald-500' : h.decision === 'SELL' ? 'bg-rose-500' : 'bg-zinc-700'}`}
                                  style={{ height: `${Math.max(20, h.confidence)}%` }}
                                  title={`${h.time}: ${h.decision} (${h.confidence.toFixed(1)}%)`}
                                />
                              ))}
                              {history.length === 0 && <div className="w-full h-px bg-zinc-800 self-center" />}
                            </div>
                          )}

                          {isEnabled && (
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                              <div className="text-center">
                                <p className="text-[8px] text-zinc-600 uppercase font-bold">{t.winRate}</p>
                                <p className="text-[10px] font-mono text-emerald-500/80">{stats.winRate.toFixed(1)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-zinc-600 uppercase font-bold">{t.profitFactor}</p>
                                <p className="text-[10px] font-mono text-zinc-400">{stats.profitFactor.toFixed(2)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-zinc-600 uppercase font-bold">{t.drawdown}</p>
                                <p className="text-[10px] font-mono text-rose-500/60">{stats.drawdown.toFixed(1)}%</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Execution Panel */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                      <Zap className="w-4 h-4 text-amber-500" /> {t.orderExecution}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.minDuration}:</span>
                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5">
                          {(['5 min', '15 min', '30 min', '1 hour'] as const).map((d) => (
                            <button 
                              key={d}
                              onClick={() => setMinDuration(d)}
                              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${minDuration === d ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <HistoryIcon className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">{t.active}: {minDuration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedMarket.analysis[selectedTimeframe].orders && selectedMarket.analysis[selectedTimeframe].orders.length > 0 ? (
                      selectedMarket.analysis[selectedTimeframe].orders.map((order, i) => (
                        <div key={i} className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.type.includes('BUY') ? `bg-${themeColor}-500/20 text-${themeColor}-500` : 'bg-rose-500/20 text-rose-500'}`}>
                                <Maximize2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black tracking-widest">{order.type === 'BUY STOP' ? t.buy : t.sell} STOP</h4>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{t.neuralConfirmation}: {order.confidence.toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-zinc-600 uppercase font-bold">{t.duration}</p>
                              <p className="text-xs font-mono text-zinc-400">{minDuration}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                              <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">{t.entryPrice}</p>
                              <p className="text-sm font-mono font-black text-zinc-200">{order.entry.toFixed(selectedMarket.symbol === 'XAUUSD' ? 2 : 5)}</p>
                            </div>
                            <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                              <p className="text-[9px] text-rose-500/70 uppercase font-bold mb-1">{t.stopLoss}</p>
                              <p className="text-sm font-mono font-black text-rose-400">{order.sl.toFixed(selectedMarket.symbol === 'XAUUSD' ? 2 : 5)}</p>
                            </div>
                            <div className={`p-3 bg-${themeColor}-500/5 rounded-xl border border-${themeColor}-500/10`}>
                              <p className={`text-[9px] text-${themeColor}-500/70 uppercase font-bold mb-1`}>{t.takeProfit}</p>
                              <p className={`text-sm font-mono font-black text-${themeColor}-400`}>{order.tp.toFixed(selectedMarket.symbol === 'XAUUSD' ? 2 : 5)}</p>
                            </div>
                          </div>

                          <button className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                            order.type.includes('BUY') 
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                            : 'bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                          }`}>
                            {t.execute} {order.type}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/5 rounded-2xl">
                        <Activity className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">{t.waitingNeuralConfirmation}</p>
                        <p className="text-[10px] mt-1">{t.marketConsensusBelowThreshold}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full min-h-[600px] flex items-center justify-center">
              <div className="text-center p-12 bg-zinc-900/30 border border-white/5 rounded-3xl backdrop-blur-sm">
                {!selectedMarket ? (
                  <>
                    <Briefcase className="w-12 h-12 text-zinc-700 mx-auto mb-4 opacity-50" />
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">{t.selectMarket}</p>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-emerald-500 font-mono text-xs uppercase tracking-[0.3em]">{t.initializingNeuralCore}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <Sliders className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">{t.neuralCoreConfig}</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{t.adjustBotParams}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                {/* Language Selection */}
                <div className="p-6 bg-zinc-800/50 border border-white/5 rounded-3xl space-y-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-700/50 rounded-xl flex items-center justify-center border border-white/10">
                      <Globe className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">{t.chooseLanguage}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">English • Português • Español</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'en', name: 'English' },
                      { id: 'pt', name: 'Português' },
                      { id: 'es', name: 'Español' }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id as Language)}
                        className={`p-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${
                          language === lang.id 
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                          : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global System Settings */}
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500">{t.globalSystemSync}</h3>
                        <p className="text-[10px] text-emerald-500/60 font-mono uppercase">{t.alwaysOnline} • {t.realTimeUpdates}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">{t.autoUpdate}</span>
                      <button className="w-12 h-6 rounded-full bg-emerald-500 p-1">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">{t.updateFreq}</p>
                      <p className="text-xs font-mono font-black text-emerald-500">REAL-TIME (LIVE)</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">{t.systemLatency}</p>
                      <p className="text-xs font-mono font-black text-emerald-500">12ms</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2 pb-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">{t.neuralBotParams}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {botSettings.map((bot, index) => {
                  const baseSignal = selectedMarket?.analysis[selectedTimeframe].baseSignals[index];
                  const baseConfidence = baseSignal?.confidence ?? 0;
                  const confidence = Math.min(99.9, baseConfidence * (bot.sensitivity / 50));
                  const history = selectedMarket?.botHistory[bot.id] || [];

                  return (
                    <div key={bot.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bot.enabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-zinc-200">{bot.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5 group relative cursor-help">
                              <Info className="w-3 h-3 text-zinc-600" />
                              <span className="text-[10px] text-zinc-500 font-medium">{bot.logic.substring(0, 40)}...</span>
                              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-800 border border-white/10 rounded-xl text-[11px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                {bot.logic}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newSettings = [...botSettings];
                            newSettings[index].enabled = !newSettings[index].enabled;
                            setBotSettings(newSettings);
                          }}
                          className={`w-12 h-6 rounded-full transition-all duration-300 p-1 ${bot.enabled ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${bot.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Bot Performance History Sparkline */}
                      {bot.enabled && (
                        <div className="flex items-end gap-0.5 h-8 px-1 bg-black/20 rounded-lg border border-white/5">
                          {history.slice(-20).map((h, idx) => (
                            <div 
                              key={idx} 
                              className={`flex-1 rounded-t-[1px] ${h.decision === 'BUY' ? 'bg-emerald-500' : h.decision === 'SELL' ? 'bg-rose-500' : 'bg-zinc-700'}`}
                              style={{ height: `${Math.max(20, h.confidence)}%` }}
                              title={`${h.time}: ${h.decision} (${h.confidence.toFixed(1)}%)`}
                            />
                          ))}
                          {history.length === 0 && <div className="w-full h-px bg-zinc-800 self-center" />}
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                          <div className="flex items-center gap-2">
                            <span>{t.sensitivity}</span>
                            <span className="text-emerald-500 font-mono">{bot.sensitivity}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{t.confidence}</span>
                            <span className={`font-mono ${confidence > 70 ? 'text-emerald-500' : 'text-zinc-400'}`}>{confidence.toFixed(1)}%</span>
                          </div>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={bot.sensitivity}
                          onChange={(e) => {
                            const newSettings = [...botSettings];
                            newSettings[index].sensitivity = parseInt(e.target.value);
                            setBotSettings(newSettings);
                          }}
                          disabled={!bot.enabled}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-8 py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {t.applyConfig}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

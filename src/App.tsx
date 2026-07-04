import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Language, translations } from './lib/translations';
import { 
  Plus,
  Minus,
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
  Lock,
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
  Target,
  Palette,
  PieChart,
  ChevronUp,
  ChevronDown,
  Filter,
  Calendar,
  Menu,
  Bookmark,
  Camera,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MT5Chart } from './components/MT5Chart';
import { brokerageService, ConnectionStatus } from './services/brokerageService';

import { healingEngine } from './services/selfHealingService';

const CountdownTimer = ({ expiryTime, themeColor }: { expiryTime?: number; themeColor: string }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiryTime) return;

    const updateTimer = () => {
      const now = Date.now() / 1000;
      const remaining = Math.max(0, expiryTime - now);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  if (timeLeft === null) return <span className="text-zinc-600">--:--</span>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);
  
  const isHighRisk = timeLeft < 30 && timeLeft > 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <Clock className={`w-3 h-3 ${isHighRisk ? 'text-amber-500 animate-pulse' : 'text-zinc-500'}`} />
        <span className={`font-mono font-bold ${isHighRisk ? 'text-amber-500' : 'text-zinc-300'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      {isHighRisk && (
        <span className="text-[7px] text-amber-500 font-black uppercase tracking-widest leading-none mt-1 whitespace-nowrap">
          ⚠️ Risco Reversão
        </span>
      )}
    </div>
  );
};

const parseDurationToSeconds = (durationStr: string): number => {
  const value = parseInt(durationStr);
  if (durationStr.includes('min')) return value * 60;
  if (durationStr.includes('hour') || durationStr.includes('h')) return value * 3600;
  return value;
};
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
  rsiDivergenceBot,
  meanReversionBot,
  candlestickReversalBot,
  exhaustionBot,
  supportResistanceBot,
  usTimeSyncBot,
  kiribatiTimeSyncBot,
  globalClockBot,
  marketSessionBot,
  dstAdjusterBot,
  latencyOptimizerBot,
  crossSessionBot,
  earlyBirdBot,
  closingBellBot,
  neuralTimeBot,
  ultraSniperBot,
  tpoBot,
  orderBookBot,
  confluenceBot,
  smaBot,
  fvgStandardBot,
  fvgMitigationBot,
  fvgTrendBot,
  fvgVolumeBot,
  fvgAggressiveBot,
  fvgDeepBot,
  fvgInstitutionalBot,
  medusaConsensus, 
  riskFilter,
  getBotStats,
  calculateOrderLevels,
  PriceData,
  Signal,
  BotSignal,
  BotStats,
  OrderRecommendation,
  Trade,
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

interface ConsensusEntry {
  time: number;
  buyProb: number;
  sellProb: number;
  decision: Signal;
}

interface MarketState {
  symbol: string;
  analysis: {
    M1: TimeframeAnalysis;
    M5: TimeframeAnalysis;
    M15: TimeframeAnalysis;
    M30: TimeframeAnalysis;
    H1: TimeframeAnalysis;
    H4: TimeframeAnalysis;
    D1: TimeframeAnalysis;
  };
  botHistory: Record<string, BotPerformanceEntry[]>;
  consensusHistory: Record<string, ConsensusEntry[]>;
  lastUpdate: string;
}

interface BotSetting {
  id: string;
  name: string;
  enabled: boolean;
  sensitivity: number;
  logic: string;
}

const BROKERS = [
  { id: 'binance', name: 'Binance', type: 'API', icon: 'https://bin.vercel.app/binance.png' },
  { id: 'deriv', name: 'Deriv', type: 'MT5', icon: 'https://deriv.com/static/060938f7d9834882e53e48e02d8495f5/deriv-logo.svg' },
  { id: 'pocket_option', name: 'Pocket Option', type: 'API', icon: 'https://pocketoption.com/favicon.ico' },
  { id: 'ic_markets', name: 'IC Markets', type: 'MT5', icon: 'https://www.icmarkets.com/favicon.ico' },
  { id: 'exness', name: 'Exness', type: 'MT5', icon: 'https://www.exness.com/favicon.ico' },
  { id: 'roboforex', name: 'RoboForex', type: 'MT5', icon: 'https://roboforex.com/favicon.ico' },
  { id: 'pepperstone', name: 'Pepperstone', type: 'MT5', icon: 'https://pepperstone.com/favicon.ico' },
  { id: 'xm', name: 'XM.com', type: 'MT5', icon: 'https://xm.com/favicon.ico' },
  { id: 'vantage', name: 'Vantage', type: 'MT5', icon: 'https://vantagemarkets.com/favicon.ico' },
  { id: 'fbs', name: 'FBS', type: 'MT5', icon: 'https://fbs.com/favicon.ico' },
];

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
  { id: 'code_verifier', name: 'Code Verifier', enabled: true, sensitivity: 100, logic: 'Analyzes the system\'s source code for syntax errors and logical inconsistencies.' },
  { id: 'system_healer', name: 'System Healer', enabled: true, sensitivity: 100, logic: 'Automatically detects and fixes runtime errors and memory leaks in the application core.' },
  { id: 'logic_auditor', name: 'Logic Auditor', enabled: true, sensitivity: 100, logic: 'Audits the trading logic to ensure it adheres to the defined risk parameters.' },
  { id: 'integrity_check', name: 'Integrity Check', enabled: true, sensitivity: 100, logic: 'Performs continuous checksums and data integrity checks across the entire system state.' },
  { id: 'gainz_trend', name: 'Gainz Trend', enabled: true, sensitivity: 50, logic: 'Specialized trend analysis using the GainzAlgo V2 Alpha core metrics.' },
  { id: 'gainz_momentum', name: 'Gainz Momentum', enabled: true, sensitivity: 50, logic: 'Measures price acceleration based on GainzAlgo V2 Alpha momentum calculations.' },
  { id: 'gainz_signal', name: 'Gainz Signal', enabled: true, sensitivity: 50, logic: 'Primary signal generator for the GainzAlgo V2 Alpha neural layer.' },
  { id: 'rsi_div', name: 'RSI Divergence', enabled: true, sensitivity: 50, logic: 'Detects bullish/bearish divergences between price and RSI for reversal signals.' },
  { id: 'mean_rev', name: 'Mean Reversion', enabled: true, sensitivity: 50, logic: 'Identifies overextended price levels using Bollinger Bands and RSI for reversals.' },
  { id: 'candle_rev', name: 'Candle Reversal', enabled: true, sensitivity: 50, logic: 'Analyzes candlestick patterns like Pin Bars and Engulfing for reversal confirmation.' },
  { id: 'exhaustion', name: 'Exhaustion', enabled: true, sensitivity: 50, logic: 'Detects high-volume exhaustion phases at market extremes with low price progress.' },
  { id: 'sup_res', name: 'Support/Resist', enabled: true, sensitivity: 50, logic: 'Identifies potential reversals at key historical support and resistance levels.' },
  { id: 'us_sync', name: 'US Time Sync', enabled: true, sensitivity: 100, logic: 'Synchronizes chart data with United States market hours (Eastern Time).' },
  { id: 'kiribati_sync', name: 'Kiribati Sync', enabled: true, sensitivity: 100, logic: 'Synchronizes chart data with Kiribati time (UTC+14) for early market opening.' },
  { id: 'global_clock', name: 'Global Clock', enabled: true, sensitivity: 100, logic: 'Manages global time offsets for synchronized neural analysis across timezones.' },
  { id: 'market_session', name: 'Market Session', enabled: true, sensitivity: 100, logic: 'Identifies active market sessions (NY, London, Tokyo, Kiribati) for volatility mapping.' },
  { id: 'dst_adjuster', name: 'DST Adjuster', enabled: true, sensitivity: 100, logic: 'Automatically handles Daylight Saving Time adjustments for all synchronized markets.' },
  { id: 'latency_opt', name: 'Latency Opt.', enabled: true, sensitivity: 100, logic: 'Optimizes data flow and execution speed based on geographical timezone proximity.' },
  { id: 'cross_session', name: 'Cross Session', enabled: true, sensitivity: 100, logic: 'Analyzes price action and liquidity during major market session overlaps.' },
  { id: 'early_bird', name: 'Early Bird', enabled: true, sensitivity: 100, logic: 'Focuses on the very first market openings globally (Kiribati/New Zealand).' },
  { id: 'closing_bell', name: 'Closing Bell', enabled: true, sensitivity: 100, logic: 'Monitors high-volume volatility during the US market closing auctions.' },
  { id: 'neural_time', name: 'Neural Time', enabled: true, sensitivity: 100, logic: 'Integrates time-based features and cyclical patterns into the neural consensus layer.' },
  { id: 'ultra_sniper', name: 'Ultra Sniper Bot', enabled: true, sensitivity: 50, logic: 'Institutional-grade gold bot using ADX, ATR, and multi-EMA trend analysis for high-precision entries.' },
  { id: 'tpo', name: 'TPO Analysis', enabled: true, sensitivity: 50, logic: 'Time Price Opportunity analysis to identify value areas and point of control.' },
  { id: 'orderbook', name: 'Order Book', enabled: true, sensitivity: 50, logic: 'Analyzes bid/ask imbalance and liquidity depth for short-term pressure.' },
  { id: 'confluence', name: 'Boa Análise', enabled: true, sensitivity: 50, logic: 'High-level confluence bot that aggregates multiple signals for high-probability entries.' },
  { id: 'sma', name: 'SMA Bot', enabled: true, sensitivity: 50, logic: 'Analyzes SMA 20/50 crossovers for short-to-medium term trend confirmation.' },
  { id: 'fvg_standard', name: 'FVG Standard', enabled: true, sensitivity: 50, logic: 'Identifies standard Fair Value Gaps in price action.' },
  { id: 'fvg_mitigation', name: 'FVG Mitigation', enabled: true, sensitivity: 50, logic: 'Detects when price is mitigating an unmitigated FVG.' },
  { id: 'fvg_trend', name: 'FVG Trend', enabled: true, sensitivity: 50, logic: 'Filters FVGs that align with the overall market trend.' },
  { id: 'fvg_volume', name: 'FVG Volume', enabled: true, sensitivity: 50, logic: 'Focuses on FVGs formed with high relative volume.' },
  { id: 'fvg_aggressive', name: 'FVG Aggressive', enabled: true, sensitivity: 50, logic: 'Signals when multiple FVGs appear in short succession.' },
  { id: 'fvg_deep', name: 'FVG Deep', enabled: true, sensitivity: 50, logic: 'Focuses on significant price gaps (Deep FVGs).' },
  { id: 'fvg_institutional', name: 'FVG Institutional', enabled: true, sensitivity: 50, logic: 'Identifies FVGs at the start of major institutional expansions.' },
];

const BOT_IDS = [
  'trend', 'momentum', 'volume', 'vwap', 'structure', 'liquidity', 
  'breakout', 'accumulation', 'manipulation', 'distribution', 
  'predictive', 'fourier', 'neural', 'wave', 'mt5', 'tv', 'tv_pro', 
  'orderflow', 'sentiment', 'rsi', 'bb', 'macd', 'vol_exp', 'quantum', 'arbitrage', 'hedge',
  'system_sync', 'core_update', 'live_stream',
  'code_verifier', 'system_healer', 'logic_auditor', 'integrity_check',
  'gainz_trend', 'gainz_momentum', 'gainz_signal',
  'rsi_div', 'mean_rev', 'candle_rev', 'exhaustion', 'sup_res',
  'us_sync', 'kiribati_sync', 'global_clock', 'market_session', 'dst_adjuster',
  'latency_opt', 'cross_session', 'early_bird', 'closing_bell', 'neural_time', 'ultra_sniper', 'tpo', 'orderbook', 'confluence', 'sma',
  'fvg_standard', 'fvg_mitigation', 'fvg_trend', 'fvg_volume', 'fvg_aggressive', 'fvg_deep', 'fvg_institutional'
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

const TIMEZONES = [
  { id: 'NY', name: 'New York', offset: -4, icon: '🇺🇸', zone: 'America/New_York' },
  { id: 'LDN', name: 'London', offset: 1, icon: '🇬🇧', zone: 'Europe/London' },
  { id: 'TKY', name: 'Tokyo', offset: 9, icon: '🇯🇵', zone: 'Asia/Tokyo' },
  { id: 'KIR', name: 'Kiribati', offset: 14, icon: '🇰🇮', zone: 'Pacific/Kiritimati' },
];

export default function App() {
  const [markets, setMarkets] = useState<MarketState[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'candles' | 'bars'>('candles');
  const [themeColor, setThemeColor] = useState<ThemeColor>('emerald');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{ id: string; time: string; bot: string; message: string; type: 'info' | 'success' | 'warning' }[]>([]);

  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [proKey, setProKey] = useState('');
  const [proError, setProError] = useState('');

  const handleUnlockPro = () => {
    if (proKey === '1230') {
      setIsPro(true);
      setShowProModal(false);
      setProKey('');
      setProError('');
      const log = {
        id: Math.random().toString(36).substr(2, 9),
        time: getTimeWithZone(),
        bot: 'System Core',
        message: language === 'pt' ? 'Versão PRO desbloqueada com sucesso!' : 'PRO Version successfully unlocked!',
        type: 'success' as const
      };
      setSystemLogs(prev => [log, ...prev].slice(0, 10));
    } else {
      setProError(t.invalidKey);
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefresh = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: getTimeWithZone(),
      bot: 'System Core',
      message: language === 'pt' ? 'Atualização manual do Núcleo Neural iniciada...' : language === 'es' ? 'Actualización manual del Núcleo Neural iniciada...' : 'Manual Neural Core Refresh initiated...',
      type: 'info' as const
    };
    setSystemLogs(prev => [newLog, ...prev].slice(0, 10));

    setTimeout(() => {
      setIsUpdating(false);
      const successLog = {
        id: Math.random().toString(36).substr(2, 9),
        time: getTimeWithZone(),
        bot: 'System Core',
        message: language === 'pt' ? 'Atualização do Núcleo Neural concluída. Todos os nós sincronizados.' : language === 'es' ? 'Actualización del Núcleo Neural completada. Todos los nodos sincronizados.' : 'Neural Core Update Complete. All nodes synchronized.',
        type: 'success' as const
      };
      setSystemLogs(prev => [successLog, ...prev].slice(0, 10));
    }, 1500);
  };

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
      const healingErrors = healingEngine.getRecentErrors().filter(e => !e.fixed);
      let bot = bots[Math.floor(Math.random() * bots.length)];
      let message = messages[Math.floor(Math.random() * messages.length)];
      let type: 'info' | 'success' | 'warning' = message.includes('Correcting') || message.includes('leak') ? 'warning' : message.includes('verified') || message.includes('complete') ? 'success' : 'info';

      // Inject real healing activity if errors exist
      if (healingErrors.length > 0 && Math.random() > 0.5) {
        const err = healingErrors[0];
        bot = 'System Healer Bot';
        message = `Autonomous Correction: Fixed ${err.type} inconsistency in core module.`;
        type = 'warning';
      } else if (Math.random() > 0.7) {
        // AI Learning activity
        bot = 'AI Learning Core';
        message = `Adapting neural weights: Learned from recent market divergence to improve accuracy.`;
        type = 'success';
      }
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        time: getTimeWithZone(),
        bot,
        message,
        type
      };

      setSystemLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1'>('M5');
  const [terminalTab, setTerminalTab] = useState('trade');
  const [systemLatency, setSystemLatency] = useState(12);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [activePreset, setActivePreset] = useState<'aggressive' | 'balanced' | 'conservative' | 'custom'>('balanced');

  // Trade History Filtering & Sorting State
  const [historyFilterSymbol, setHistoryFilterSymbol] = useState('ALL');
  const [historyFilterType, setHistoryFilterType] = useState('ALL');
  const [historyFilterDateStart, setHistoryFilterDateStart] = useState('');
  const [historyFilterDateEnd, setHistoryFilterDateEnd] = useState('');
  const [historySortField, setHistorySortField] = useState<keyof Trade>('time');
  const [historySortOrder, setHistorySortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Trade Tab Filtering & Sorting State
  const [tradeFilterSymbol, setTradeFilterSymbol] = useState('ALL');
  const [tradeFilterType, setTradeFilterType] = useState('ALL');
  const [tradeFilterDateStart, setTradeFilterDateStart] = useState('');
  const [tradeFilterDateEnd, setTradeFilterDateEnd] = useState('');
  const [tradeSortField, setTradeSortField] = useState<keyof Trade>('time');
  const [tradeSortOrder, setTradeSortOrder] = useState<'asc' | 'desc'>('desc');

  const applyPreset = (preset: 'aggressive' | 'balanced' | 'conservative') => {
    const sensitivity = preset === 'aggressive' ? 90 : preset === 'balanced' ? 50 : 25;
    setBotSettings(prev => prev.map(bot => ({ ...bot, sensitivity })));
    setActivePreset(preset);
  };

  const executeTrade = (order: OrderRecommendation, symbol: string) => {
    const durationSec = parseDurationToSeconds(order.minDuration || minDuration);
    const now = Date.now() / 1000;
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      symbol,
      type: order.type.includes('BUY') ? 'BUY' : 'SELL',
      entryPrice: order.entry,
      stopLoss: order.sl,
      takeProfit: order.tp,
      volume: 1.0,
      time: now,
      duration: durationSec,
      expiryTime: now + durationSec,
      status: 'OPEN',
      profit: 0,
      currentPrice: order.entry,
    };
    setActiveTrades(prev => [newTrade, ...prev]);
  };

  const closeTrade = (id: string) => {
    setActiveTrades(prev => prev.map(t => t.id === id ? { ...t, status: 'CLOSED' } : t));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrades(prev => prev.map(trade => {
        if (trade.status === 'CLOSED') return trade;
        
        const market = markets.find(m => m.symbol === trade.symbol);
        if (!market || !market.analysis[selectedTimeframe].prices.length) return trade;
        
        const currentPrice = market.analysis[selectedTimeframe].prices[market.analysis[selectedTimeframe].prices.length - 1].close;
        const pips = trade.type === 'BUY' 
          ? (currentPrice - trade.entryPrice) 
          : (trade.entryPrice - currentPrice);
        
        const multiplier = trade.symbol === 'XAUUSD' ? 100 : 10000;
        const profit = pips * multiplier * trade.volume;
        
        // Auto-close if SL/TP hit
        let status = trade.status;
        if (trade.type === 'BUY') {
          if (currentPrice <= trade.stopLoss || (trade.takeProfit > 0 && currentPrice >= trade.takeProfit)) {
            status = 'CLOSED';
          }
        } else {
          if (currentPrice >= trade.stopLoss || (trade.takeProfit > 0 && currentPrice <= trade.takeProfit)) {
            status = 'CLOSED';
          }
        }
        
        return { ...trade, profit, status, currentPrice };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [markets, selectedTimeframe]);
  const [botSettings, setBotSettings] = useState<BotSetting[]>(INITIAL_BOT_SETTINGS);
  const botSettingsRef = useRef(botSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChartVaultOpen, setIsChartVaultOpen] = useState(false);
  const [savedCharts, setSavedCharts] = useState<{id: string, symbol: string, timeframe: string, time: string, prob: number}[]>(() => {
    const saved = localStorage.getItem('waltbot_charts');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSentimentModalOpen, setIsSentimentModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [user, setUser] = useState<{ id: number, username: string, role: string, token: string } | null>(() => {
    const saved = localStorage.getItem('waltbot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [securityTab, setSecurityTab] = useState<'auth' | 'brokerage' | 'admin'>('auth');
  const [brokerSearch, setBrokerSearch] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [activeBrokerage, setActiveBrokerage] = useState<any>(null);
  const [accountType, setAccountType] = useState<'Real' | 'Demo'>('Real');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [brokerageName, setBrokerageName] = useState('');
  const [minDuration, setMinDuration] = useState<string>('5 min');
  const [language, setLanguage] = useState<Language>('pt');
  const [selectedTimezone, setSelectedTimezone] = useState('NY');
  const selectedTimezoneRef = useRef(selectedTimezone);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    selectedTimezoneRef.current = selectedTimezone;
  }, [selectedTimezone]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeForZone = (date: Date, zone: string, options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      ...options
    }).format(date);
  };

  const getTimeWithZone = (date: Date = new Date(), options?: Intl.DateTimeFormatOptions) => {
    const zone = TIMEZONES.find(t => t.id === selectedTimezoneRef.current)?.zone || 'America/New_York';
    return formatTimeForZone(date, zone, options);
  };

  const isMarketOpen = (date: Date, zone: string) => {
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).format(date);
    const [hour, minute] = timeStr.split(':').map(Number);
    
    // Standard Market Hours
    if (zone === 'America/New_York') return (hour >= 9 && hour < 16) || (hour === 9 && minute >= 30);
    if (zone === 'Europe/London') return (hour >= 8 && hour < 16) || (hour === 16 && minute <= 30);
    if (zone === 'Asia/Tokyo') return (hour >= 9 && hour < 15);
    return hour >= 8 && hour < 17; // Default
  };

  const getSessionMultiplier = (date: Date, zone: string) => {
    return isMarketOpen(date, zone) ? 1.15 : 0.85;
  };

  const t = translations[language];

  useEffect(() => {
    if (user) {
      brokerageService.getConnectedBrokerages(user.token).then(data => {
        if (data && data.length > 0) setActiveBrokerage(data[0]);
      });
    } else {
      setActiveBrokerage(null);
    }
  }, [user]);

  useEffect(() => {
    botSettingsRef.current = botSettings;
    
    // Re-analyze existing markets with new settings for real-time feedback
    setMarkets(prev => {
      if (prev.length === 0) return prev;
      
      const currentZone = TIMEZONES.find(t => t.id === selectedTimezone);
      const sessionMultiplier = currentZone ? getSessionMultiplier(new Date(), currentZone.zone) : 1.0;

      return prev.map(m => {
        const updateAnalysis = (analysis: TimeframeAnalysis, tf: string) => {
          const { prices, baseSignals } = analysis;
          
          // Apply sensitivity to baseSignals
          const signals = baseSignals.map((signal, index) => {
            const sensitivity = botSettings[index]?.sensitivity ?? 50;
            let multiplier = (sensitivity / 50) * sessionMultiplier;
            
            // Boost sensitivity for M1, M5 and H1 as requested
            if (tf === 'M1' || tf === 'M5' || tf === 'H1') multiplier *= 1.1;

            return {
              ...signal,
              botId: BOT_IDS[index],
              confidence: Math.min(99.9, signal.confidence * multiplier)
            };
          });

          // Filter signals based on enabled bots
          const enabledSignals = signals.filter((_, index) => botSettings[index]?.enabled);
          
          if (enabledSignals.length === 0 || !prices || prices.length === 0) {
            return { ...analysis, signals, decision: "NO TRADE" as Signal, buyProb: 0, sellProb: 0, passedRisk: false, orders: [] } as TimeframeAnalysis;
          }

          const inhibitor = healingEngine.getInhibitor(m.symbol, tf);
          const { decision, buyProb, sellProb } = medusaConsensus(enabledSignals, sessionMultiplier, inhibitor);
          const passedRisk = riskFilter(decision, buyProb, sellProb, sessionMultiplier);
          const lastPrice = prices[prices.length - 1];
          const currentPrice = lastPrice ? lastPrice.close : 0;
          const orders = calculateOrderLevels(currentPrice, decision, buyProb, sellProb);
          
          return { ...analysis, signals, decision, buyProb, sellProb, passedRisk, orders } as TimeframeAnalysis;
        };

        const rawAnalysis: Record<string, TimeframeAnalysis> = {
          M1: updateAnalysis(m.analysis.M1, 'M1'),
          M5: updateAnalysis(m.analysis.M5, 'M5'),
          M15: updateAnalysis(m.analysis.M15, 'M15'),
          M30: updateAnalysis(m.analysis.M30, 'M30'),
          H1: updateAnalysis(m.analysis.H1, 'H1'),
          H4: updateAnalysis(m.analysis.H4, 'H4'),
          D1: updateAnalysis(m.analysis.D1, 'D1')
        };

        const buyCount = Object.values(rawAnalysis).filter(a => a.decision === 'BUY').length;
        const sellCount = Object.values(rawAnalysis).filter(a => a.decision === 'SELL').length;

        const finalAnalysis: Record<string, TimeframeAnalysis> = {};
        Object.entries(rawAnalysis).forEach(([tf, analysis]) => {
          let confirmedDecision = analysis.decision;
          let confirmedOrders = [...analysis.orders];
          
          if (confirmedDecision === 'BUY' && buyCount < 2) {
            confirmedDecision = 'NO TRADE';
            confirmedOrders = [];
          } else if (confirmedDecision === 'SELL' && sellCount < 2) {
            confirmedDecision = 'NO TRADE';
            confirmedOrders = [];
          }

          finalAnalysis[tf] = {
            ...analysis,
            decision: confirmedDecision,
            orders: confirmedOrders
          };
        });

        return {
          ...m,
          analysis: finalAnalysis as any
        };

      });
    });
  }, [botSettings, selectedTimezone]);

  const processMarketData = (data: any, currentMarkets: MarketState[]) => {
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format received:", data);
      return currentMarkets;
    }
    
    const processed = data.map((m: any) => {
      // AI Learning: Learn from previous analysis results before processing new ones
      const existingMarket = currentMarkets.find(ex => ex.symbol === m.symbol);
      if (existingMarket) {
        // Simple simulation: if we had a strong signal and price moved against it, it's an "error"
        Object.entries(existingMarket.analysis).forEach(([tf, analysis]) => {
          if (analysis.decision !== 'NO TRADE' && analysis.prices.length > 1) {
            const last = analysis.prices[analysis.prices.length - 1].close;
            const prev = analysis.prices[analysis.prices.length - 2].close;
            const movedUp = last > prev;
            
            const isLoss = (analysis.decision === 'BUY' && !movedUp) || (analysis.decision === 'SELL' && movedUp);
            if (isLoss) {
              healingEngine.learnFromMarketOutcome({
                symbol: m.symbol,
                timeframe: tf,
                prediction: analysis.decision,
                actualResult: 'LOSS',
                timestamp: Date.now()
              });
            } else {
              healingEngine.learnFromMarketOutcome({
                symbol: m.symbol,
                timeframe: tf,
                prediction: analysis.decision,
                actualResult: 'WIN',
                timestamp: Date.now()
              });
            }
          }
        });
      }

      const botHistory = existingMarket ? { ...existingMarket.botHistory } : {};
      const consensusHistory = existingMarket ? { ...existingMarket.consensusHistory } : {};

      if (!m.timeframes || !m.timeframes.M5 || !m.timeframes.H1 || !m.timeframes.M1 || !m.timeframes.H4 || !m.timeframes.D1) {
        console.warn(`Missing timeframe data for ${m.symbol}`);
        return null;
      }

      const analyze = (prices: PriceData[], timeframe: string) => {
        const currentZone = TIMEZONES.find(t => t.id === selectedTimezoneRef.current);
        const sessionMultiplier = currentZone ? getSessionMultiplier(new Date(), currentZone.zone) : 1.0;

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
          gainzAlgoSignalBot(prices),
          rsiDivergenceBot(prices),
          meanReversionBot(prices),
          candlestickReversalBot(prices),
          exhaustionBot(prices),
          supportResistanceBot(prices),
          usTimeSyncBot(prices),
          kiribatiTimeSyncBot(prices),
          globalClockBot(prices),
          marketSessionBot(prices),
          dstAdjusterBot(prices),
          latencyOptimizerBot(prices),
          crossSessionBot(prices),
          earlyBirdBot(prices),
          closingBellBot(prices),
          neuralTimeBot(prices),
          ultraSniperBot(prices),
          tpoBot(prices),
          orderBookBot(prices),
          confluenceBot(prices),
          smaBot(prices),
          fvgStandardBot(prices),
          fvgMitigationBot(prices),
          fvgTrendBot(prices),
          fvgVolumeBot(prices),
          fvgAggressiveBot(prices),
          fvgDeepBot(prices),
          fvgInstitutionalBot(prices)
        ];

        // Apply sensitivity to confidence
        const signals = baseSignals.map((signal, index) => {
          const sensitivity = botSettingsRef.current[index]?.sensitivity ?? 50;
          let multiplier = (sensitivity / 50) * sessionMultiplier;
          
          // Boost sensitivity for M1, M5 and H1 as requested
          if (timeframe === 'M1' || timeframe === 'M5' || timeframe === 'H1') multiplier *= 1.1;

          return {
            ...signal,
            botId: BOT_IDS[index],
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
                time: getTimeWithZone(),
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

        const inhibitor = healingEngine.getInhibitor(m.symbol, timeframe);
        const { decision, buyProb, sellProb } = medusaConsensus(enabledSignals, sessionMultiplier, inhibitor);
        const passedRisk = riskFilter(decision, buyProb, sellProb, sessionMultiplier);
        const lastPrice = prices[prices.length - 1];
        const currentPrice = lastPrice ? lastPrice.close : 0;
        const orders = calculateOrderLevels(currentPrice, decision, buyProb, sellProb);

        return { prices, baseSignals, signals, botStats, decision, buyProb, sellProb, passedRisk, orders };
      };

        const rawAnalysis: Record<string, any> = {
          M1: analyze(m.timeframes.M1 || m.timeframes.M5, 'M1'),
          M5: analyze(m.timeframes.M5, 'M5'),
          M15: analyze(m.timeframes.M15 || m.timeframes.M5, 'M15'),
          M30: analyze(m.timeframes.M30 || m.timeframes.M5, 'M30'),
          H1: analyze(m.timeframes.H1, 'H1'),
          H4: analyze(m.timeframes.H4 || m.timeframes.H1, 'H4'),
          D1: analyze(m.timeframes.D1 || m.timeframes.H1, 'D1')
        };

        // Multi-timeframe confirmation: Count how many frames have a clear signal
        const buyCount = Object.values(rawAnalysis).filter(a => a.decision === 'BUY').length;
        const sellCount = Object.values(rawAnalysis).filter(a => a.decision === 'SELL').length;

        // Apply confirmation filter to each timeframe
        const finalAnalysis: Record<string, any> = {};
        Object.entries(rawAnalysis).forEach(([tf, analysis]) => {
          let confirmedDecision = analysis.decision;
          let confirmedOrders = [...analysis.orders];
          
          if (confirmedDecision === 'BUY' && buyCount < 2) {
            confirmedDecision = 'NO TRADE';
            confirmedOrders = [];
          } else if (confirmedDecision === 'SELL' && sellCount < 2) {
            confirmedDecision = 'NO TRADE';
            confirmedOrders = [];
          }

          finalAnalysis[tf] = {
            ...analysis,
            decision: confirmedDecision,
            orders: confirmedOrders
          };

          // Update consensus history with confirmed decision
          if (!consensusHistory[tf]) consensusHistory[tf] = [];
          const lastPrice = analysis.prices[analysis.prices.length - 1];
          const lastConsensus = consensusHistory[tf][consensusHistory[tf].length - 1];
          
          if (lastPrice?.time && (!lastConsensus || lastConsensus.time !== lastPrice.time)) {
            consensusHistory[tf].push({
              time: lastPrice.time,
              buyProb: analysis.buyProb,
              sellProb: analysis.sellProb,
              decision: confirmedDecision
            });
            if (consensusHistory[tf].length > 500) consensusHistory[tf].shift();
          }
        });

        return {
          symbol: m.symbol,
          analysis: finalAnalysis,
          botHistory,
          consensusHistory,
          lastUpdate: getTimeWithZone()
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

  const sentimentCounts = useMemo(() => {
    if (!selectedMarket || !selectedMarket.analysis[selectedTimeframe]) return { buy: 0, sell: 0, neutral: 0, total: 0 };
    const signals = selectedMarket.analysis[selectedTimeframe].signals;
    if (!signals) return { buy: 0, sell: 0, neutral: 0, total: 0 };
    const stats = { buy: 0, sell: 0, neutral: 0, total: 0 };
    
    botSettings.forEach((setting, index) => {
      if (setting.enabled && signals[index]) {
        stats.total++;
        if (signals[index].decision === 'BUY') stats.buy++;
        else if (signals[index].decision === 'SELL') stats.sell++;
        else stats.neutral++;
      }
    });
    return stats;
  }, [selectedMarket, selectedTimeframe, botSettings]);

  const handleSaveSnapshot = () => {
    if (!selectedMarket) return;
    const newSnapshot = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedSymbol,
      timeframe: selectedTimeframe,
      time: getTimeWithZone(),
      prob: Math.max(selectedMarket.analysis[selectedTimeframe].buyProb, selectedMarket.analysis[selectedTimeframe].sellProb)
    };
    const updatedCharts = [newSnapshot, ...savedCharts];
    setSavedCharts(updatedCharts);
    localStorage.setItem('waltbot_charts', JSON.stringify(updatedCharts));
  };

  const handleDeleteSnapshot = (id: string) => {
    const updatedCharts = savedCharts.filter(c => c.id !== id);
    setSavedCharts(updatedCharts);
    localStorage.setItem('waltbot_charts', JSON.stringify(updatedCharts));
  };

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
      timeStr: formatTimeForZone(
        new Date(Date.now() - (prices.length - i) * (selectedTimeframe === 'M5' ? 5 : 60) * 60000),
        TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York',
        { hour: '2-digit', minute: '2-digit' }
      )
    }));
  }, [selectedMarket, selectedTimeframe]);

  const uniqueSymbols = useMemo(() => {
    const symbols = new Set<string>();
    activeTrades.forEach(t => symbols.add(t.symbol));
    return Array.from(symbols).sort();
  }, [activeTrades]);

  const filteredHistory = useMemo(() => {
    let history = activeTrades.filter(t => t.status === 'CLOSED');

    // Filter by Symbol
    if (historyFilterSymbol !== 'ALL' && historyFilterSymbol.trim() !== '') {
      history = history.filter(t => t.symbol.toUpperCase().includes(historyFilterSymbol.toUpperCase()));
    }

    // Filter by Type
    if (historyFilterType !== 'ALL') {
      history = history.filter(t => t.type === historyFilterType);
    }

    // Filter by Date Range
    if (historyFilterDateStart) {
      const start = new Date(historyFilterDateStart).getTime() / 1000;
      history = history.filter(t => t.time >= start);
    }
    if (historyFilterDateEnd) {
      const end = new Date(historyFilterDateEnd).getTime() / 1000 + 86399; // End of day
      history = history.filter(t => t.time <= end);
    }

    // Sorting
    history.sort((a, b) => {
      const valA = a[historySortField];
      const valB = b[historySortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return historySortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return historySortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });

    return history;
  }, [activeTrades, historyFilterSymbol, historyFilterType, historyFilterDateStart, historyFilterDateEnd, historySortField, historySortOrder]);

  const filteredTrades = useMemo(() => {
    let trades = activeTrades.filter(t => t.status === 'OPEN');

    // Filter by Symbol
    if (tradeFilterSymbol !== 'ALL') {
      trades = trades.filter(t => t.symbol === tradeFilterSymbol);
    }

    // Filter by Type
    if (tradeFilterType !== 'ALL') {
      trades = trades.filter(t => t.type === tradeFilterType);
    }

    // Filter by Date Range
    if (tradeFilterDateStart) {
      const start = new Date(tradeFilterDateStart).getTime() / 1000;
      trades = trades.filter(t => t.time >= start);
    }
    if (tradeFilterDateEnd) {
      const end = new Date(tradeFilterDateEnd).getTime() / 1000 + 86399; // End of day
      trades = trades.filter(t => t.time <= end);
    }

    // Sorting
    trades.sort((a, b) => {
      const valA = a[tradeSortField];
      const valB = b[tradeSortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return tradeSortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return tradeSortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
      }

      return 0;
    });

    return trades;
  }, [activeTrades, tradeFilterSymbol, tradeFilterType, tradeFilterDateStart, tradeFilterDateEnd, tradeSortField, tradeSortOrder]);

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
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className={`w-10 h-10 bg-${themeColor}-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.3)]`}>
              <Cpu className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                WaltBot <span className={`text-${themeColor}-500`}>Extreme</span>
                {isPro && (
                  <span className="bg-amber-500 text-black text-[8px] px-1.5 py-0.5 rounded-md font-black tracking-widest animate-pulse">PRO</span>
                )}
              </h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-${themeColor}-500 animate-pulse`} />
                <span className={`text-[9px] text-${themeColor}-500 font-mono uppercase tracking-widest`}>Neural Core v2.5 Alpha</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-center gap-1 flex-1 max-w-xs px-8">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                animate={{ 
                  width: isUpdating ? "100%" : ["20%", "45%", "30%", "60%", "40%"],
                  backgroundColor: isUpdating ? "#f59e0b" : THEMES.find(t => t.id === themeColor)?.color || "#10b981"
                }}
                transition={{ 
                  width: { duration: isUpdating ? 1.5 : 10, repeat: isUpdating ? 0 : Infinity, ease: "easeInOut" },
                  backgroundColor: { duration: 0.3 }
                }}
                className="h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              />
            </div>
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Neural Processing Load</span>
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
              <div className={`w-1.5 h-1.5 rounded-full ${isUpdating ? 'bg-amber-500 animate-ping' : `bg-${themeColor}-500 animate-pulse`}`} />
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                {isUpdating ? (language === 'pt' ? 'Atualizando...' : language === 'es' ? 'Actualizando...' : 'Updating...') : (isPro ? t.proActive : t.status)}
              </span>
            </div>
            {!isPro && (
              <button 
                onClick={() => setShowProModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"
              >
                <Zap className="w-3 h-3" /> {t.unlockPro}
              </button>
            )}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isUpdating}
              className={`p-2 hover:bg-white/5 rounded-full transition-all text-zinc-400 hover:text-white ${isUpdating ? 'animate-spin text-amber-500' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        {/* Sidebar - Market List */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Timezone Selector */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Globe className="w-3 h-3" /> {language === 'pt' ? 'FUSOS HORÁRIOS' : 'GLOBAL TIMEZONES'}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {TIMEZONES.map((tz) => {
                const isOpen = isMarketOpen(currentTime, tz.zone);
                const multiplier = getSessionMultiplier(currentTime, tz.zone);
                return (
                  <button
                    key={tz.id}
                    onClick={() => setSelectedTimezone(tz.id)}
                    className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden group ${
                      selectedTimezone === tz.id
                        ? `bg-${themeColor}-500/10 border-${themeColor}-500/50 text-white`
                        : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 relative z-10">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <span>{tz.icon}</span>
                        {tz.name}
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? `bg-${themeColor}-500 shadow-[0_0_8px_rgba(${themeColor === 'emerald' ? '16,185,129' : '59,130,246'},0.5)]` : 'bg-zinc-700'}`} />
                    </div>
                    <div className="flex items-center justify-between relative z-10 mb-2">
                      <div className="text-[10px] font-mono opacity-70">
                        {formatTimeForZone(currentTime, tz.zone)}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${isOpen ? `text-${themeColor}-400` : 'opacity-40'}`}>
                        {isOpen ? (language === 'pt' ? 'ABERTO' : 'OPEN') : (language === 'pt' ? 'FECHADO' : 'CLOSED')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-${themeColor}-500`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(multiplier / 1.15) * 100}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600">
                        {multiplier > 1 ? '+' : ''}{((multiplier - 1) * 100).toFixed(0)}%
                      </span>
                    </div>

                    {selectedTimezone === tz.id && (
                      <motion.div 
                        layoutId="tz-active"
                        className={`absolute inset-0 bg-${themeColor}-500/5`}
                        initial={false}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

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
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.M1.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.M1.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        M1:{m.analysis.M1.decision.substring(0, 1)}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.M5.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.M5.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        M5:{m.analysis.M5.decision.substring(0, 1)}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.M15.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.M15.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        M15:{m.analysis.M15.decision.substring(0, 1)}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.H1.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.H1.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        H1:{m.analysis.H1.decision.substring(0, 1)}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.H4.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.H4.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        H4:{m.analysis.H4.decision.substring(0, 1)}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
                        m.analysis.D1.decision === 'BUY' ? `text-${themeColor}-400 bg-${themeColor}-400/10` :
                        m.analysis.D1.decision === 'SELL' ? 'text-rose-400 bg-rose-400/10' :
                        'text-zinc-500 bg-zinc-500/10'
                      }`}>
                        D1:{m.analysis.D1.decision.substring(0, 1)}
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
                  
                  <div className="flex bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-1.5 border border-white/5 shadow-xl overflow-x-auto max-w-full">
                    {(['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap ${
                          selectedTimeframe === tf 
                          ? `bg-${themeColor}-500 text-black shadow-[0_0_20px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.4)] scale-105` 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleSaveSnapshot}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    {t.saveSnapshot}
                  </button>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <span className="text-zinc-400 font-mono text-xl">
                        [{Math.max(selectedMarket.analysis[selectedTimeframe].buyProb, selectedMarket.analysis[selectedTimeframe].sellProb).toFixed(1)}%]
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
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
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
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4 text-zinc-500">
                      <Globe className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{language === 'pt' ? 'ANÁLISE DE SESSÃO' : 'SESSION ANALYSIS'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black tracking-tighter text-white">
                            {TIMEZONES.find(t => t.id === selectedTimezone)?.name}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          {isMarketOpen(currentTime, TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York') 
                            ? (language === 'pt' ? 'VOLATILIDADE ALTA' : 'HIGH VOLATILITY') 
                            : (language === 'pt' ? 'VOLATILIDADE BAIXA' : 'LOW VOLATILITY')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                          isMarketOpen(currentTime, TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York')
                          ? `bg-${themeColor}-500/20 text-${themeColor}-500 border border-${themeColor}-500/30`
                          : 'bg-zinc-800 text-zinc-500 border border-white/5'
                        }`}>
                          {isMarketOpen(currentTime, TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York') 
                            ? (language === 'pt' ? 'ABERTO' : 'OPEN') 
                            : (language === 'pt' ? 'FECHADO' : 'CLOSED')}
                        </span>
                        <div className="mt-2 flex items-center gap-1.5 justify-end">
                          <Zap className={`w-3 h-3 ${getSessionMultiplier(currentTime, TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York') > 1 ? 'text-emerald-400' : 'text-rose-400'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${getSessionMultiplier(currentTime, TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York') > 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {getSessionMultiplier(currentTime, TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York') > 1 ? '+15% Boost' : '-15% Damp'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-zinc-400">
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">TPO Profile</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600">VALUE AREA: 70%</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Point of Control (POC)</span>
                        <span className="text-white font-mono">{selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status === 'TPO_ANALYSIS')?.decision === 'BUY' ? 'ABOVE' : 'BELOW'}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${themeColor}-500 transition-all duration-1000`} 
                          style={{ width: `${Math.min(99, (selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status === 'TPO_ANALYSIS')?.confidence || 50))}%` }} 
                        />
                      </div>
                      <p className="text-[10px] text-zinc-600 leading-relaxed italic">
                        {language === 'pt' 
                          ? 'O preço está sendo negociado em relação ao Ponto de Controle (POC), indicando aceitação ou rejeição de valor.' 
                          : 'Price is trading relative to the Point of Control (POC), indicating value acceptance or rejection.'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-zinc-400">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Order Flow</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status?.includes('FLOW'))?.decision === 'BUY' 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : 'bg-rose-500/20 text-rose-500'
                      }`}>
                        {selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status?.includes('FLOW'))?.status}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Cumulative Delta</span>
                          <div className="text-2xl font-black tracking-tighter text-white">
                            {selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status?.includes('FLOW'))?.decision === 'BUY' ? '+' : '-' }
                            {Math.floor(Math.random() * 5000 + 1000)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Aggression</span>
                          <div className={`text-sm font-bold ${
                            selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status?.includes('FLOW'))?.decision === 'BUY' ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            {selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status?.includes('FLOW'))?.confidence.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 h-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-full ${
                              i < 12 ? (selectedMarket.analysis[selectedTimeframe].baseSignals.find(s => s.status?.includes('FLOW'))?.decision === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-zinc-800'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-zinc-400">
                        <Database className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Order Book</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-zinc-600">LIVE L2</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between text-[9px] font-bold text-emerald-500/50">
                            <span>BIDS</span>
                            <span>64%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[64%]" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between text-[9px] font-bold text-rose-500/50">
                            <span>46%</span>
                            <span>ASKS</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden flex justify-end">
                            <div className="h-full bg-rose-500 w-[46%]" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500">Liquidity Depth</span>
                          <span className="text-emerald-500 font-bold">HIGH</span>
                        </div>
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
                        <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5 overflow-x-auto">
                          {(['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'] as const).map((tf) => (
                            <button 
                              key={tf}
                              onClick={() => setSelectedTimeframe(tf)}
                              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${selectedTimeframe === tf ? `bg-${themeColor}-500 text-black shadow-[0_0_10px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'blue' ? '59,130,246' : themeColor === 'rose' ? '244,63,94' : themeColor === 'amber' ? '245,158,11' : themeColor === 'violet' ? '139,92,246' : '6,182,212'},0.3)]` : 'text-zinc-500 hover:text-zinc-300'}`}
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
                        decision={selectedMarket.analysis[selectedTimeframe].decision}
                        buyProb={selectedMarket.analysis[selectedTimeframe].buyProb}
                        sellProb={selectedMarket.analysis[selectedTimeframe].sellProb}
                        symbol={selectedMarket.symbol}
                        timeframe={selectedTimeframe}
                        chartType={chartType}
                        onChartTypeChange={setChartType}
                        themeColor={themeColor}
                        trades={activeTrades}
                        consensusHistory={selectedMarket.consensusHistory[selectedTimeframe]}
                        timezone={TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York'}
                      />
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Initializing Neural Stream...
                      </div>
                    )}
                  </div>
                </div>

                {/* MT5 Terminal (Toolbox) */}
                <div id="mt5-terminal" className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                  <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto custom-scrollbar">
                      {[
                        { id: 'trade', name: t.trade, icon: Briefcase },
                        { id: 'chart', name: t.chart, icon: TrendingUp },
                        { id: 'exposure', name: t.exposure, icon: Activity },
                        { id: 'history', name: t.history, icon: HistoryIcon },
                        { id: 'news', name: t.news, icon: MessageSquare },
                        { id: 'alerts', name: t.alerts, icon: Bell },
                        { id: 'journal', name: t.journal, icon: FileText },
                        { id: 'network', name: t.network, icon: Globe },
                        { id: 'health', name: 'Health & AI', icon: ShieldCheck },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setTerminalTab(tab.id)}
                          className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-r border-white/5 transition-all ${
                            terminalTab === tab.id ? `bg-${themeColor}-500/10 text-${themeColor}-500 border-b-2 border-b-${themeColor}-500` : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                          }`}
                        >
                          <tab.icon className="w-3 h-3" />
                          {tab.name}
                        </button>
                      ))}
                  </div>
                  
                  <div className="p-0 overflow-x-auto custom-scrollbar min-h-[150px]">
                    {terminalTab === 'chart' && (
                      <div className="p-4 bg-black/40">
                        {selectedMarket && selectedMarket.analysis && selectedMarket.analysis[selectedTimeframe] ? (
                          <MT5Chart 
                            data={selectedMarket.analysis[selectedTimeframe].prices}
                            signals={selectedMarket.analysis[selectedTimeframe].signals}
                            decision={selectedMarket.analysis[selectedTimeframe].decision}
                            buyProb={selectedMarket.analysis[selectedTimeframe].buyProb}
                            sellProb={selectedMarket.analysis[selectedTimeframe].sellProb}
                            symbol={selectedMarket.symbol}
                            timeframe={selectedTimeframe}
                            chartType={chartType}
                            onChartTypeChange={setChartType}
                            themeColor={themeColor}
                            trades={activeTrades}
                            consensusHistory={selectedMarket.consensusHistory[selectedTimeframe]}
                            timezone={TIMEZONES.find(t => t.id === selectedTimezone)?.zone || 'America/New_York'}
                          />
                        ) : (
                          <div className="h-[400px] flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Initializing Neural Stream...
                          </div>
                        )}
                      </div>
                    )}
                    {terminalTab === 'trade' && (
                      <div className="flex flex-col">
                        {/* Filter Bar */}
                        <div className="bg-black/20 border-b border-white/5 p-4 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Filter className="w-3 h-3 text-zinc-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Filters:</span>
                          </div>
                          
                          {/* Symbol Filter */}
                          <select 
                            value={tradeFilterSymbol}
                            onChange={(e) => setTradeFilterSymbol(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="ALL">ALL SYMBOLS</option>
                            {uniqueSymbols.map(sym => (
                              <option key={sym} value={sym}>{sym}</option>
                            ))}
                          </select>

                          {/* Type Filter */}
                          <select 
                            value={tradeFilterType}
                            onChange={(e) => setTradeFilterType(e.target.value)}
                            className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="ALL">ALL TYPES</option>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                          </select>

                          {/* Date Range */}
                          <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            <input 
                              type="date" 
                              value={tradeFilterDateStart}
                              onChange={(e) => setTradeFilterDateStart(e.target.value)}
                              className="bg-transparent text-[10px] font-mono text-zinc-300 focus:outline-none [color-scheme:dark]"
                            />
                            <span className="text-zinc-600 text-[10px]">—</span>
                            <input 
                              type="date" 
                              value={tradeFilterDateEnd}
                              onChange={(e) => setTradeFilterDateEnd(e.target.value)}
                              className="bg-transparent text-[10px] font-mono text-zinc-300 focus:outline-none [color-scheme:dark]"
                            />
                          </div>

                          {/* Clear Filters */}
                          {(tradeFilterSymbol !== 'ALL' || tradeFilterType !== 'ALL' || tradeFilterDateStart || tradeFilterDateEnd) && (
                            <button 
                              onClick={() => {
                                setTradeFilterSymbol('ALL');
                                setTradeFilterType('ALL');
                                setTradeFilterDateStart('');
                                setTradeFilterDateEnd('');
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>

                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-black/20 border-b border-white/5">
                              {[
                                { id: 'symbol', name: t.symbol },
                                { id: 'id', name: t.ticket },
                                { id: 'time', name: t.time },
                                { id: 'type', name: t.type },
                                { id: 'volume', name: t.volume },
                                { id: 'entryPrice', name: t.entryPrice },
                                { id: 'currentPrice', name: t.price },
                                { id: 'stopLoss', name: t.sl },
                                { id: 'takeProfit', name: t.tp },
                                { id: 'expiryTime', name: language === 'pt' ? 'Tempo' : 'Timer' },
                                { id: 'profit', name: t.profit },
                              ].map((col) => (
                                <th 
                                  key={col.id}
                                  onClick={() => {
                                    if (tradeSortField === col.id) {
                                      setTradeSortOrder(tradeSortOrder === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setTradeSortField(col.id as keyof Trade);
                                      setTradeSortOrder('desc');
                                    }
                                  }}
                                  className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors group"
                                >
                                  <div className="flex items-center gap-1">
                                    {col.name}
                                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                      {tradeSortField === col.id ? (
                                        tradeSortOrder === 'asc' ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />
                                      ) : (
                                        <ChevronUp className="w-2 h-2 opacity-30" />
                                      )}
                                    </div>
                                  </div>
                                </th>
                              ))}
                              <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500"></th>
                            </tr>
                          </thead>
                          <tbody className="text-[10px] font-mono">
                            {filteredTrades.length > 0 ? (
                              <>
                                {filteredTrades.map(trade => (
                                  <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-zinc-300">{trade.symbol}</td>
                                    <td className="px-6 py-4 text-zinc-500">#{trade.id}</td>
                                    <td className="px-6 py-4 text-zinc-500">{getTimeWithZone(new Date(trade.time * 1000), { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                    <td className={`px-6 py-4 text-${trade.type === 'BUY' ? themeColor : 'rose'}-500 font-bold`}>{trade.type}</td>
                                    <td className="px-6 py-4 text-zinc-300">{trade.volume.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-zinc-300">{trade.entryPrice.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className="px-6 py-4 text-zinc-300">{(trade.currentPrice || trade.entryPrice).toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className="px-6 py-4 text-rose-500/60">{trade.stopLoss.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className={`px-6 py-4 text-${themeColor}-500/60`}>{trade.takeProfit.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className="px-6 py-4">
                                      <CountdownTimer expiryTime={trade.expiryTime} themeColor={themeColor} />
                                    </td>
                                    <td className={`px-6 py-4 text-${trade.profit >= 0 ? themeColor : 'rose'}-500 font-bold`}>
                                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                      <button 
                                        onClick={() => closeTrade(trade.id)}
                                        className="p-1 hover:bg-rose-500/20 rounded-md transition-colors text-rose-500"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                <tr className={`bg-${themeColor}-500/5`}>
                                  <td colSpan={10} className="px-6 py-4 text-right font-black uppercase tracking-widest text-zinc-500">
                                    {t.balance}: $10,245.50 • 
                                    {t.equity}: ${(10245.50 + filteredTrades.reduce((sum, t) => sum + t.profit, 0)).toFixed(2)} • 
                                    {t.margin}: ${(filteredTrades.length * 50).toFixed(2)} • 
                                    {t.freeMargin}: ${(10245.50 + filteredTrades.reduce((sum, t) => sum + t.profit, 0) - filteredTrades.length * 50).toFixed(2)}
                                  </td>
                                  <td className={`px-6 py-4 text-${filteredTrades.reduce((sum, t) => sum + t.profit, 0) >= 0 ? themeColor : 'rose'}-500 font-black`}>
                                    {filteredTrades.reduce((sum, t) => sum + t.profit, 0) >= 0 ? '+' : ''}${filteredTrades.reduce((sum, t) => sum + t.profit, 0).toFixed(2)}
                                  </td>
                                  <td></td>
                                </tr>
                              </>
                            ) : (
                              <tr>
                                <td colSpan={11} className="px-6 py-8 text-center text-zinc-600 italic">
                                  {activeTrades.filter(t => t.status === 'OPEN').length === 0 ? t.initializingNeuralCore : 'No trades match the current filters.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {terminalTab === 'network' && (
                      <div className="p-8 flex flex-col items-center justify-center gap-8 min-h-[200px]">
                        <div className="flex flex-col items-center gap-2">
                          <Globe className={`w-12 h-12 text-${themeColor}-500 animate-pulse`} />
                          <h4 className="text-sm font-black uppercase tracking-widest text-white">{t.systemLatency} Control</h4>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Neural Sync Optimization</p>
                        </div>

                        <div className="flex items-center gap-12">
                          <button 
                            onClick={() => setSystemLatency(prev => Math.max(1, prev - 1))}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/30 transition-all group"
                          >
                            <Minus className="w-5 h-5 text-zinc-400 group-hover:text-rose-500" />
                          </button>

                          <div className="flex flex-col items-center">
                            <span className={`text-5xl font-black font-mono text-${themeColor}-500 tabular-nums`}>{systemLatency}</span>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Milliseconds</span>
                          </div>

                          <button 
                            onClick={() => setSystemLatency(prev => Math.min(1000, prev + 1))}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all group"
                          >
                            <Plus className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
                          </button>
                        </div>

                        <div className="w-full max-w-md bg-white/5 h-1 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-${themeColor}-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(systemLatency / 1000) * 100}%` }}
                          />
                        </div>

                        <p className="text-[9px] text-zinc-600 font-mono uppercase text-center max-w-xs">
                          Adjusting latency affects neural execution speed. Minimum 1ms for maximum performance, maximum 1000ms for system stability.
                        </p>
                      </div>
                    )}

                    {terminalTab === 'history' && (
                      <div className="flex flex-col">
                        {/* Filter Bar */}
                        <div className="bg-black/20 border-b border-white/5 p-4 flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Filter className="w-3 h-3 text-zinc-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Filters:</span>
                          </div>
                          
                          {/* Symbol Search */}
                          <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input 
                              type="text"
                              placeholder="SEARCH SYMBOL..."
                              value={historyFilterSymbol === 'ALL' ? '' : historyFilterSymbol}
                              onChange={(e) => setHistoryFilterSymbol(e.target.value.toUpperCase())}
                              className={`bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-${themeColor}-500/50 w-40 transition-all`}
                            />
                          </div>

                          {/* Type Filter */}
                          <select 
                            value={historyFilterType}
                            onChange={(e) => setHistoryFilterType(e.target.value)}
                            className={`bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-${themeColor}-500/50 transition-all`}
                          >
                            <option value="ALL">ALL TYPES</option>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                          </select>

                          {/* Date Range */}
                          <div className={`flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-${themeColor}-500/50 transition-all`}>
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            <input 
                              type="date" 
                              value={historyFilterDateStart}
                              onChange={(e) => setHistoryFilterDateStart(e.target.value)}
                              className="bg-transparent text-[10px] font-mono text-zinc-300 focus:outline-none [color-scheme:dark]"
                            />
                            <span className="text-zinc-600 text-[10px]">—</span>
                            <input 
                              type="date" 
                              value={historyFilterDateEnd}
                              onChange={(e) => setHistoryFilterDateEnd(e.target.value)}
                              className="bg-transparent text-[10px] font-mono text-zinc-300 focus:outline-none [color-scheme:dark]"
                            />
                          </div>

                          {/* Clear Filters */}
                          {(historyFilterSymbol !== 'ALL' || historyFilterType !== 'ALL' || historyFilterDateStart || historyFilterDateEnd) && (
                            <button 
                              onClick={() => {
                                setHistoryFilterSymbol('ALL');
                                setHistoryFilterType('ALL');
                                setHistoryFilterDateStart('');
                                setHistoryFilterDateEnd('');
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>

                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-black/20 border-b border-white/5">
                              {[
                                { id: 'symbol', name: t.symbol },
                                { id: 'id', name: t.ticket },
                                { id: 'time', name: t.time },
                                { id: 'type', name: t.type },
                                { id: 'volume', name: t.volume },
                                { id: 'entryPrice', name: t.price },
                                { id: 'stopLoss', name: t.sl },
                                { id: 'takeProfit', name: t.tp },
                                { id: 'profit', name: t.profit },
                              ].map((col) => (
                                <th 
                                  key={col.id}
                                  onClick={() => {
                                    if (historySortField === col.id) {
                                      setHistorySortOrder(historySortOrder === 'asc' ? 'desc' : 'asc');
                                    } else {
                                      setHistorySortField(col.id as keyof Trade);
                                      setHistorySortOrder('desc');
                                    }
                                  }}
                                  className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors group"
                                >
                                  <div className="flex items-center gap-1">
                                    {col.name}
                                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                      {historySortField === col.id ? (
                                        historySortOrder === 'asc' ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />
                                      ) : (
                                        <ChevronUp className="w-2 h-2 opacity-30" />
                                      )}
                                    </div>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="text-[10px] font-mono">
                            {filteredHistory.length > 0 ? (
                              <>
                                {filteredHistory.map(trade => (
                                  <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors opacity-60">
                                    <td className="px-6 py-4 font-bold text-zinc-300">{trade.symbol}</td>
                                    <td className="px-6 py-4 text-zinc-500">#{trade.id}</td>
                                    <td className="px-6 py-4 text-zinc-500">{getTimeWithZone(new Date(trade.time * 1000), { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                    <td className={`px-6 py-4 text-${trade.type === 'BUY' ? themeColor : 'rose'}-500 font-bold`}>{trade.type}</td>
                                    <td className="px-6 py-4 text-zinc-300">{trade.volume.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-zinc-300">{trade.entryPrice.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className="px-6 py-4 text-rose-500/60">{trade.stopLoss.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className={`px-6 py-4 text-${themeColor}-500/60`}>{trade.takeProfit.toFixed(trade.symbol === 'XAUUSD' ? 2 : 5)}</td>
                                    <td className={`px-6 py-4 text-${trade.profit >= 0 ? themeColor : 'rose'}-500 font-bold`}>
                                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </>
                            ) : (
                              <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-zinc-600 italic">
                                  {activeTrades.filter(t => t.status === 'CLOSED').length === 0 ? 'No trade history available.' : 'No trades match the current filters.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {terminalTab === 'health' && (
                      <div className="flex flex-col gap-6 p-8">
                        {/* System Health Monitor */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                        {/* Additional Health Context */}
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Autonomous Reasoning Note
                          </h4>
                          <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                            The system healing engine is active. Hidden bots are monitoring for UI inconsistencies, data stream interruptions, and neural divergence. AI Learning Core adapts weights based on recent market outcomes to prevent recurring logic errors.
                          </p>
                        </div>
                      </div>
                    )}
                    {['exposure', 'news', 'alerts', 'journal'].includes(terminalTab) && (
                      <div className="p-12 text-center">
                        <p className="text-zinc-600 italic text-xs uppercase tracking-widest font-black opacity-50">
                          {terminalTab} module initialized. Waiting for data stream...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bot Breakdown */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
                  <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                      <Layers className={`w-4 h-4 text-${themeColor}-500`} /> {t.neuralConsensus} ({selectedTimeframe}) <span className="text-zinc-400 font-mono">[{Math.max(selectedMarket.analysis[selectedTimeframe].buyProb, selectedMarket.analysis[selectedTimeframe].sellProb).toFixed(1)}%]</span>
                    </h3>
                    <div className="flex items-center gap-4">
                      {/* System Health Shortcut */}
                      <button 
                        onClick={() => {
                          setTerminalTab('health');
                          document.getElementById('mt5-terminal')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 transition-all active:scale-95"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Health Monitor
                      </button>

                      {/* Mini Sentiment Bar */}
                      <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1 h-1 rounded-full bg-emerald-500 ${sentimentCounts.buy > sentimentCounts.sell ? 'animate-pulse' : ''}`} />
                          <span className="text-[9px] font-mono text-emerald-500">{((sentimentCounts.buy / Math.max(1, sentimentCounts.total)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500" style={{ width: `${(sentimentCounts.buy / Math.max(1, sentimentCounts.total)) * 100}%` }} />
                          <div className="h-full bg-zinc-700" style={{ width: `${(sentimentCounts.neutral / Math.max(1, sentimentCounts.total)) * 100}%` }} />
                          <div className="h-full bg-rose-500" style={{ width: `${(sentimentCounts.sell / Math.max(1, sentimentCounts.total)) * 100}%` }} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-rose-500">{((sentimentCounts.sell / Math.max(1, sentimentCounts.total)) * 100).toFixed(0)}%</span>
                          <div className={`w-1 h-1 rounded-full bg-rose-500 ${sentimentCounts.sell > sentimentCounts.buy ? 'animate-pulse' : ''}`} />
                        </div>
                      </div>

                      <button 
                        onClick={() => setIsSentimentModalOpen(true)}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 bg-${themeColor}-500/10 border border-${themeColor}-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-${themeColor}-400 hover:bg-${themeColor}-500/20 transition-all active:scale-95`}
                      >
                        <PieChart className="w-3 h-3" />
                        {t.measureSentiment}
                      </button>

                      <button 
                        onClick={() => setIsSecurityModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 transition-all active:scale-95"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {t.securityCore}
                      </button>
                      <span className="text-[10px] font-mono text-zinc-500">{botSettings.filter(b => b.enabled).length} {t.activeAnalyzers}</span>
                    </div>
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
                      { 
                        id: 'tv_pro', 
                        name: 'TradingView Bot Pro', 
                        botSignal: isPro ? selectedMarket.analysis[selectedTimeframe].signals[16] : { decision: 'NO TRADE', confidence: 0 }, 
                        icon: BarChart3,
                        locked: !isPro
                      },
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
                      { id: 'rsi_div', name: 'RSI Divergence', botSignal: selectedMarket.analysis[selectedTimeframe].signals[36], icon: TrendingUp },
                      { id: 'mean_rev', name: 'Mean Reversion', botSignal: selectedMarket.analysis[selectedTimeframe].signals[37], icon: RefreshCw },
                      { id: 'candle_rev', name: 'Candle Reversal', botSignal: selectedMarket.analysis[selectedTimeframe].signals[38], icon: Zap },
                      { id: 'exhaustion', name: 'Exhaustion', botSignal: selectedMarket.analysis[selectedTimeframe].signals[39], icon: BarChart3 },
                      { id: 'sup_res', name: 'Support/Resist', botSignal: selectedMarket.analysis[selectedTimeframe].signals[40], icon: Database },
                      { id: 'us_sync', name: 'US Time Sync', botSignal: selectedMarket.analysis[selectedTimeframe].signals[41], icon: Clock },
                      { id: 'kiribati_sync', name: 'Kiribati Sync', botSignal: selectedMarket.analysis[selectedTimeframe].signals[42], icon: Clock },
                      { id: 'global_clock', name: 'Global Clock', botSignal: selectedMarket.analysis[selectedTimeframe].signals[43], icon: Globe },
                      { id: 'market_session', name: 'Market Session', botSignal: selectedMarket.analysis[selectedTimeframe].signals[44], icon: Activity },
                      { id: 'dst_adjuster', name: 'DST Adjuster', botSignal: selectedMarket.analysis[selectedTimeframe].signals[45], icon: RefreshCw },
                      { id: 'latency_opt', name: 'Latency Opt.', botSignal: selectedMarket.analysis[selectedTimeframe].signals[46], icon: Zap },
                      { id: 'cross_session', name: 'Cross Session', botSignal: selectedMarket.analysis[selectedTimeframe].signals[47], icon: Layers },
                      { id: 'early_bird', name: 'Early Bird', botSignal: selectedMarket.analysis[selectedTimeframe].signals[48], icon: Zap },
                      { id: 'closing_bell', name: 'Closing Bell', botSignal: selectedMarket.analysis[selectedTimeframe].signals[49], icon: Bell },
                      { id: 'neural_time', name: 'Neural Time', botSignal: selectedMarket.analysis[selectedTimeframe].signals[50], icon: Cpu },
                      { id: 'ultra_sniper', name: 'Ultra Sniper Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[51], icon: Target },
                      { id: 'tpo', name: 'TPO Analysis', botSignal: selectedMarket.analysis[selectedTimeframe].signals[52], icon: BarChart3 },
                      { id: 'orderbook', name: 'Order Book', botSignal: selectedMarket.analysis[selectedTimeframe].signals[53], icon: Database },
                      { id: 'confluence', name: 'Boa Análise', botSignal: selectedMarket.analysis[selectedTimeframe].signals[54], icon: ShieldCheck },
                      { id: 'sma', name: 'SMA Bot', botSignal: selectedMarket.analysis[selectedTimeframe].signals[55], icon: Activity },
                      { id: 'fvg_standard', name: 'FVG Standard', botSignal: selectedMarket.analysis[selectedTimeframe].signals[56], icon: Layers },
                      { id: 'fvg_mitigation', name: 'FVG Mitigation', botSignal: selectedMarket.analysis[selectedTimeframe].signals[57], icon: RefreshCw },
                      { id: 'fvg_trend', name: 'FVG Trend', botSignal: selectedMarket.analysis[selectedTimeframe].signals[58], icon: TrendingUp },
                      { id: 'fvg_volume', name: 'FVG Volume', botSignal: selectedMarket.analysis[selectedTimeframe].signals[59], icon: BarChart3 },
                      { id: 'fvg_aggressive', name: 'FVG Aggressive', botSignal: selectedMarket.analysis[selectedTimeframe].signals[60], icon: Zap },
                      { id: 'fvg_deep', name: 'FVG Deep', botSignal: selectedMarket.analysis[selectedTimeframe].signals[61], icon: ArrowDown },
                      { id: 'fvg_institutional', name: 'FVG Institutional', botSignal: selectedMarket.analysis[selectedTimeframe].signals[62], icon: Cpu },
                    ].map((bot, i) => {
                      const { decision, confidence } = bot.botSignal || { decision: 'NO TRADE', confidence: 0 };
                      const isEnabled = botSettings.find(s => s.id === bot.id)?.enabled;
                      const stats = selectedMarket.analysis[selectedTimeframe].botStats[i] || { winRate: 0, profitFactor: 0, drawdown: 0 };
                      const history = selectedMarket.botHistory[bot.id] || [];
                      const isLocked = (bot as any).locked;
                      
                      return (
                        <div key={i} className={`p-4 border rounded-xl flex flex-col gap-4 group transition-all duration-300 relative overflow-hidden ${
                          isLocked 
                          ? 'bg-zinc-900/20 border-white/5 grayscale opacity-50'
                          : (isEnabled 
                            ? 'bg-black/40 border-white/5 hover:border-white/10' 
                            : 'bg-zinc-900/20 border-white/0 opacity-30 grayscale')
                        }`}>
                          {isLocked && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                              <Lock className="w-5 h-5 text-amber-500 mb-1" />
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">PRO ONLY</span>
                            </div>
                          )}
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

                          <button 
                            onClick={() => executeTrade(order, selectedMarket.symbol)}
                            className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
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
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${activeBrokerage ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                        {activeBrokerage 
                          ? `Bot Neural Link: Active (${activeBrokerage.name} ${activeBrokerage.accountType})` 
                          : 'Bot Neural Link: Local Analysis Only'}
                      </p>
                    </div>
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
                      <p className={`text-xs font-mono font-black text-${themeColor}-500`}>{systemLatency}ms</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-800/50 border border-white/5 rounded-3xl space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-700/50 rounded-xl flex items-center justify-center border border-white/10">
                        <Sliders className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300">{t.presets}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">Quick Sensitivity Profiles</p>
                      </div>
                    </div>
                    {activePreset === 'custom' && (
                      <span className={`text-[9px] font-black uppercase tracking-widest text-${themeColor}-500 bg-${themeColor}-500/10 px-2 py-1 rounded-md border border-${themeColor}-500/20`}>
                        {t.custom}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'conservative', name: t.conservative, color: 'rose' },
                      { id: 'balanced', name: t.balanced, color: 'emerald' },
                      { id: 'aggressive', name: t.aggressive, color: 'amber' }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id as any)}
                        className={`p-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${
                          activePreset === preset.id 
                          ? `bg-${preset.color}-500 border-${preset.color}-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]` 
                          : 'bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
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
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-zinc-200">{bot.name}</h3>
                              {activeBrokerage && bot.enabled && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                                  <Zap className="w-2 h-2" />
                                  Live Sync
                                </span>
                              )}
                            </div>
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
                            setActivePreset('custom');
                          }}
                          disabled={!bot.enabled}
                          className={`w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-${themeColor}-500 disabled:opacity-30 disabled:cursor-not-allowed`}
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

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[150] flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 bg-zinc-950 border-r border-white/10 h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-${themeColor}-500 rounded-lg flex items-center justify-center`}>
                    <Cpu className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-black italic uppercase tracking-tighter">WaltBot Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {[
                  { id: 'security', name: t.securityCore, icon: ShieldCheck, onClick: () => { setSecurityTab('auth'); setIsSecurityModalOpen(true); setIsMenuOpen(false); } },
                  { id: 'broker', name: t.connectBroker, icon: Globe, onClick: () => { setSecurityTab('brokerage'); setIsSecurityModalOpen(true); setIsMenuOpen(false); } },
                  { id: 'vault', name: t.chartVault, icon: Bookmark, onClick: () => { setIsChartVaultOpen(true); setIsMenuOpen(false); } },
                  { id: 'sentiment', name: t.measureSentiment, icon: PieChart, onClick: () => { setIsSentimentModalOpen(true); setIsMenuOpen(false); } },
                  { id: 'settings', name: t.settings, icon: Settings, onClick: () => { setIsSettingsOpen(true); setIsMenuOpen(false); } },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="p-8 border-t border-white/5 space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Neural Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-500">Core Sync: 100%</span>
                  </div>
                </div>
                {user && (
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Session</p>
                      <p className="text-xs font-black text-white">{user.username}</p>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chart Vault Modal */}
      <AnimatePresence>
        {isChartVaultOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChartVaultOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl flex flex-col h-[80vh] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                    <Bookmark className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter">{t.chartVault}</h2>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{savedCharts.length} {t.captured} ANALYSES</p>
                  </div>
                </div>
                <button onClick={() => setIsChartVaultOpen(false)} className="p-3 text-zinc-500 hover:text-white transition-colors hover:bg-white/5 rounded-2xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                {savedCharts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30">
                    <Camera className="w-20 h-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">{language === 'pt' ? 'NENHUMA CAPTURA ENCONTRADA' : 'NO CAPTURES FOUND'}</p>
                  </div>
                ) : (
                  savedCharts.map((chart) => (
                    <div key={chart.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col items-center justify-center`}>
                           <span className="text-[9px] font-black text-zinc-500 leading-none mb-0.5">{chart.timeframe}</span>
                           <span className="text-[10px] font-black text-white leading-none">{chart.symbol.slice(0, 3)}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <h4 className="text-sm font-black text-white">{chart.symbol}</h4>
                             <span className="text-[10px] font-mono text-${themeColor}-400">[{chart.prob.toFixed(1)}%]</span>
                          </div>
                          <p className="text-[9px] font-mono text-zinc-600 uppercase">{chart.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            setSelectedSymbol(chart.symbol);
                            setSelectedTimeframe(chart.timeframe as any);
                            setIsChartVaultOpen(false);
                          }}
                          className="px-4 py-2 bg-white/5 hover:bg-${themeColor}-500/20 text-white hover:text-${themeColor}-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:border-${themeColor}-500/20 transition-all"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteSnapshot(chart.id)}
                          className="p-2 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sentiment Analysis Modal */}
      <AnimatePresence>
        {isSentimentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSentimentModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 bg-${themeColor}-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-${themeColor}-500/20`}>
                    <PieChart className={`w-8 h-8 text-${themeColor}-500`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">{t.sentimentReport}</h2>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{t.analyzingBots}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Gauge/Visualizer */}
                  <div className="relative h-4 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                    <motion.div 
                      className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(sentimentCounts.buy / Math.max(1, sentimentCounts.total)) * 100}%` }}
                    />
                    <motion.div 
                      className="h-full bg-zinc-700"
                      initial={{ width: 0 }}
                      animate={{ width: `${(sentimentCounts.neutral / Math.max(1, sentimentCounts.total)) * 100}%` }}
                    />
                    <motion.div 
                      className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(sentimentCounts.sell / Math.max(1, sentimentCounts.total)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col items-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-bl-2xl flex items-center justify-center">
                        <ArrowUp className="w-3 h-3 text-emerald-500" />
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{t.buySentiment}</span>
                      <span className="text-3xl font-black text-white tabular-nums">
                        {((sentimentCounts.buy / Math.max(1, sentimentCounts.total)) * 100).toFixed(0)}%
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-1">{sentimentCounts.buy} BOTS</span>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t.neutralSentiment}</span>
                      <span className="text-3xl font-black text-zinc-400 tabular-nums">
                        {((sentimentCounts.neutral / Math.max(1, sentimentCounts.total)) * 100).toFixed(0)}%
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600 mt-1">{sentimentCounts.neutral} BOTS</span>
                    </div>

                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex flex-col items-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-2xl flex items-center justify-center">
                        <ArrowDown className="w-3 h-3 text-rose-500" />
                      </div>
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">{t.sellSentiment}</span>
                      <span className="text-3xl font-black text-white tabular-nums">
                        {((sentimentCounts.sell / Math.max(1, sentimentCounts.total)) * 100).toFixed(0)}%
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-1">{sentimentCounts.sell} BOTS</span>
                    </div>
                  </div>

                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.activeAnalyzers} Context</h4>
                      <span className="text-[10px] font-mono text-zinc-600">{sentimentCounts.total} BOTS SYNCED</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {botSettings.map((bot, i) => {
                        if (!bot.enabled) return null;
                        const sig = selectedMarket?.analysis[selectedTimeframe].signals?.[i];
                        return (
                          <div 
                            key={bot.id} 
                            className={`w-2 h-2 rounded-[2px] ${
                              sig?.decision === 'BUY' ? 'bg-emerald-500' : 
                              sig?.decision === 'SELL' ? 'bg-rose-500' : 
                              'bg-zinc-700'
                            } opacity-60 hover:opacity-100 transition-opacity cursor-help`}
                            title={`${bot.name}: ${sig?.decision || 'NO TRADE'}`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Consensus Force:</span>
                      </div>
                      <span className={`text-[11px] font-black font-mono text-${themeColor}-500`}>
                        {Math.max(selectedMarket?.analysis[selectedTimeframe].buyProb || 0, selectedMarket?.analysis[selectedTimeframe].sellProb || 0).toFixed(2)}% STRENGTH
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSentimentModalOpen(false)}
                  className={`w-full py-4 bg-${themeColor}-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-${themeColor}-400 transition-all shadow-lg active:scale-[0.98]`}
                >
                  Close Analysis
                </button>
              </div>
              
              <button 
                onClick={() => setIsSentimentModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Core Modal */}
      <AnimatePresence>
        {isSecurityModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSecurityModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[70vh]"
            >
              {/* Sidebar */}
              <div className="w-full md:w-64 bg-black/40 border-r border-white/5 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black tracking-tight uppercase">{t.securityCore}</h2>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Neural Encryption V2</p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {[
                    { id: 'auth', name: 'Profile', icon: Lock },
                    { id: 'brokerage', name: 'Broker Link', icon: Globe },
                    { id: 'admin', name: 'Admin Hub', icon: Sliders, hide: user?.role !== 'admin' },
                  ].map((tab) => !tab.hide && (
                    <button
                      key={tab.id}
                      onClick={() => setSecurityTab(tab.id as any)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                        securityTab === tab.id ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  ))}
                </div>

                {user && (
                  <button 
                    onClick={() => {
                      setUser(null);
                      localStorage.removeItem('waltbot_user');
                    }}
                    className="mt-4 p-4 rounded-2xl border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-3 h-3" /> {t.logout}
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-black/20">
                {securityTab === 'auth' && (
                  <div className="max-w-md mx-auto space-y-8">
                    {!user ? (
                      <>
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter">{authMode === 'login' ? t.login : t.register}</h3>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{t.authRequired}</p>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const username = formData.get('username') as string;
                          const password = formData.get('password') as string;
                          
                          fetch(`/api/auth/${authMode}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                          }).then(res => res.json()).then(data => {
                            if (data.token) {
                              setUser(data);
                              localStorage.setItem('waltbot_user', JSON.stringify(data));
                            } else {
                              alert(data.error || "Authentication failed");
                            }
                          });
                        }} className="space-y-4">
                          <div className="space-y-2 text-left">
                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.username}</label>
                            <input name="username" type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                          </div>
                          <div className="space-y-2 text-left">
                            <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.password}</label>
                            <input name="password" type="password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                          </div>
                          <button type="submit" className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-lg active:scale-[0.98] mt-4">
                            {authMode === 'login' ? t.login : t.register}
                          </button>
                        </form>

                        <button 
                          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                          className="w-full text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                          {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                        </button>
                      </>
                    ) : (
                      <div className="space-y-8 text-center pt-12">
                        <div className="relative">
                          <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                            <Lock className="w-10 h-10 text-amber-500" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-zinc-950 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-black" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{user.username}</h3>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active Neural Session • {user.role}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left">
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Encrypted Hash</p>
                            <p className="text-[10px] font-mono text-zinc-400 truncate">SHA-256 Verified</p>
                          </div>
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left">
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Session TTL</p>
                            <p className="text-[10px] font-mono text-zinc-400">23h 59m Remaining</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {securityTab === 'brokerage' && (
                  <div className="space-y-8">
                    {!user ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 pt-24">
                        <Lock className="w-12 h-12 text-zinc-700" />
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{t.authRequired}</p>
                        <button onClick={() => setSecurityTab('auth')} className="text-[10px] font-bold text-amber-500 underline">Switch to Login</button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">{t.connectBroker}</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">MT5 & API Neural Link</p>
                          </div>
                          {selectedBroker && (
                            <button 
                              onClick={() => setSelectedBroker(null)}
                              className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:underline"
                            >
                              ← {language === 'pt' ? 'Escolher outra' : 'Change Broker'}
                            </button>
                          )}
                        </div>

                        {!selectedBroker ? (
                          <div className="space-y-6">
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                              <input 
                                type="text"
                                placeholder={t.searchBroker}
                                value={brokerSearch}
                                onChange={(e) => setBrokerSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-600"
                              />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {BROKERS.filter(b => b.name.toLowerCase().includes(brokerSearch.toLowerCase())).map(broker => (
                                <button
                                  key={broker.id}
                                  onClick={() => setSelectedBroker(broker)}
                                  className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/10 hover:border-amber-500/50 transition-all group"
                                >
                                  <div className="w-10 h-10 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                                    <img src={broker.icon} alt={broker.name} className="w-full h-full object-contain opacity-50 group-hover:opacity-100" referrerPolicy="no-referrer" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-300">{broker.name}</p>
                                    <span className="text-[7px] text-zinc-500 font-mono tracking-widest bg-white/5 px-1.5 rounded uppercase">{broker.type}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              if (!user) return;
                              
                              setConnectionStatus(ConnectionStatus.CONNECTING);
                              const formData = new FormData(e.currentTarget);
                              const credentials = {
                                name: selectedBroker.name,
                                accountType,
                                server: formData.get('server') as string,
                                login: formData.get('login') as string,
                                password: formData.get('password') as string,
                                apiKey: formData.get('apiKey') as string,
                                secretKey: formData.get('secretKey') as string
                              };
                              
                              const result = await brokerageService.connectAccount(credentials, user.token);
                              setConnectionStatus(result.status);
                              
                              if (result.success) {
                                alert(result.message);
                                setSelectedBroker(null);
                                setConnectionStatus(ConnectionStatus.IDLE);
                                // Set this as active for the bots
                                setActiveBrokerage({ name: selectedBroker.name, accountType });
                              } else {
                                alert(result.message);
                              }
                            }} className="space-y-4 p-8 bg-black/40 border border-white/10 rounded-[32px] relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className={`w-24 h-24 ${connectionStatus === ConnectionStatus.CONNECTING ? 'animate-pulse text-amber-500' : 'text-zinc-500'}`} />
                              </div>
                              <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 mb-4">
                                {(['Real', 'Demo'] as const).map(type => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAccountType(type)}
                                    className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                      accountType === type ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                  >
                                    {type === 'Real' ? t.realAccount : t.demoAccount}
                                  </button>
                                ))}
                              </div>

                              {selectedBroker.type === 'MT5' ? (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.server}</label>
                                    <input name="server" type="text" placeholder="e.g. Deriv-Server" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.login}</label>
                                    <input name="login" type="text" placeholder="12345678" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.password}</label>
                                    <input name="password" type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.apiKey}</label>
                                    <input name="apiKey" type="text" placeholder="AES-256 API KEY" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t.secretKey}</label>
                                    <input name="secretKey" type="password" placeholder="SECRET KEY" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all" required />
                                  </div>
                                </>
                              )}

                              <button 
                                type="submit" 
                                disabled={connectionStatus === ConnectionStatus.CONNECTING}
                                className={`w-full py-4 font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 ${
                                  connectionStatus === ConnectionStatus.CONNECTING 
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-amber-500 text-black hover:bg-amber-400'
                                }`}
                              >
                                {connectionStatus === ConnectionStatus.CONNECTING ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    {language === 'pt' ? 'Conectando...' : 'Connecting...'}
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-4 h-4" />
                                    {t.connectBroker}
                                  </>
                                )}
                              </button>
                            </form>

                            <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-2">{t.connectedBrokers}</h4>
                              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-3xl text-center opacity-30">
                                   <p className="text-[8px] font-black uppercase tracking-widest">Fetch from /api/brokerage/list</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {securityTab === 'admin' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">{t.adminPanel}</h3>
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Root System Oversight</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="p-8 bg-zinc-900 border border-white/10 rounded-[32px] space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-500" /> {t.userManagement}
                          </h4>
                          <div className="space-y-2">
                            {[
                              { username: 'sonada061', role: 'admin', status: 'active' },
                              { username: 'trader_alex', role: 'user', status: 'active' },
                              { username: 'dev_test', role: 'user', status: 'idle' },
                            ].map(u => (
                              <div key={u.username} className="p-4 bg-black/40 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                  <p className="text-[10px] font-bold text-zinc-300">{u.username}</p>
                                  <span className="text-[8px] px-2 py-0.5 bg-white/5 rounded-full text-zinc-500 uppercase">{u.role}</span>
                                </div>
                                <button className="text-[9px] text-rose-400 font-black hover:underline uppercase">Ban</button>
                              </div>
                            ))}
                          </div>
                       </div>

                       <div className="p-8 bg-zinc-900 border border-white/10 rounded-[32px] space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" /> {t.brokerageAudit}
                          </h4>
                          <div className="space-y-2">
                            {[
                              { name: 'Binance', owner: 'sonada061', health: '100%' },
                              { name: 'Pocket Option', owner: 'sonada061', health: '98%' },
                              { name: 'Deriv', owner: 'trader_alex', health: '100%' },
                            ].map(b => (
                              <div key={b.name} className="p-4 bg-black/40 rounded-2xl flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-bold text-zinc-300">{b.name}</p>
                                  <p className="text-[8px] text-zinc-600 font-black uppercase">Owner: {b.owner}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] text-emerald-500 font-bold">{b.health}</p>
                                  <p className="text-[7px] text-zinc-600 font-black uppercase">Health</p>
                                </div>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setIsSecurityModalOpen(false)}
                className="absolute top-8 right-8 p-3 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-2xl hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pro Modal */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    <Zap className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">{t.proVersion}</h2>
                    <p className="text-sm text-zinc-500 font-medium">{t.enterKey}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t.accessKey}</label>
                    <input 
                      type="password"
                      value={proKey}
                      onChange={(e) => setProKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlockPro()}
                      placeholder="••••"
                      className={`w-full bg-black/50 border ${proError ? 'border-rose-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-center text-2xl font-mono tracking-[1em] focus:outline-none focus:border-amber-500 transition-all`}
                      autoFocus
                    />
                    {proError && (
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider text-center">{proError}</p>
                    )}
                  </div>

                  <button 
                    onClick={handleUnlockPro}
                    className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                  >
                    {t.unlockPro}
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setShowProModal(false)}
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
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

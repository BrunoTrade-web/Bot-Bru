import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  LineData, 
  BarData,
  HistogramData,
  SeriesMarker, 
  CandlestickSeries, 
  LineSeries,
  BarSeries,
  HistogramSeries,
  Time,
  MouseEventParams
} from 'lightweight-charts';
import { 
  PriceData, 
  BotSignal, 
  Trade,
  calculateGainzAlgo, 
  calculateRSI, 
  calculateBollingerBands,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  detectFVGs,
  FVG
} from '../lib/medusa';
import { 
  TrendingUp, 
  Activity, 
  Layers, 
  MousePointer2, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  Settings2,
  Maximize2,
  Minimize2,
  BarChart,
  Database,
  ArrowRightLeft
} from 'lucide-react';

interface ConsensusEntry {
  time: Time;
  buyProb: number;
  sellProb: number;
  decision: string;
}

interface MT5ChartProps {
  data: PriceData[];
  signals: BotSignal[];
  decision?: string;
  buyProb?: number;
  sellProb?: number;
  symbol: string;
  timeframe: string;
  chartType: 'candles' | 'bars';
  onChartTypeChange?: (type: 'candles' | 'bars') => void;
  themeColor?: string;
  trades?: Trade[];
  consensusHistory?: ConsensusEntry[];
  timezone?: string;
}

interface Trendline {
  id: string;
  p1: { time: Time; price: number };
  p2: { time: Time; price: number };
}

export const MT5Chart: React.FC<MT5ChartProps> = ({ 
  data, 
  signals, 
  decision,
  buyProb,
  sellProb,
  symbol, 
  timeframe, 
  chartType, 
  onChartTypeChange, 
  themeColor = 'emerald',
  trades = [],
  consensusHistory = [],
  timezone = 'America/New_York'
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  
  const candlestickSeriesRef = useRef<any>(null);
  const ema50SeriesRef = useRef<any>(null);
  const ema200SeriesRef = useRef<any>(null);
  const bbUpperSeriesRef = useRef<any>(null);
  const bbLowerSeriesRef = useRef<any>(null);
  const bbMiddleSeriesRef = useRef<any>(null);
  const gainzUpperSeriesRef = useRef<any>(null);
  const gainzLowerSeriesRef = useRef<any>(null);
  const gainzSignalSeriesRef = useRef<any>(null);
  const rsiSeriesRef = useRef<any>(null);
  const confidenceSeriesRef = useRef<any>(null);
  const tpoPocSeriesRef = useRef<any>(null);
  const tpoVaUpperSeriesRef = useRef<any>(null);
  const tpoVaLowerSeriesRef = useRef<any>(null);
  
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const macdLineSeriesRef = useRef<any>(null);
  const macdSignalSeriesRef = useRef<any>(null);
  const macdHistogramSeriesRef = useRef<any>(null);
  const sma20SeriesRef = useRef<any>(null);
  const sma50SeriesRef = useRef<any>(null);

  const trendlineSeriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const tradePriceLinesRef = useRef<any[]>([]);

  // UI State
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showGainz, setShowGainz] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showTPO, setShowTPO] = useState(false);
  const [showFVG, setShowFVG] = useState(true);
  const [drawMode, setDrawMode] = useState<'none' | 'trendline'>('none');
  const [trendlines, setTrendlines] = useState<Trendline[]>([]);
  const [drawingPoints, setDrawingPoints] = useState<{ time: Time; price: number }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d5db',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 200 : 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).format(date);
        }
      },
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(date);
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true,
      },
      crosshair: {
        mode: 0,
        vertLine: { width: 1 as any, color: 'rgba(255, 255, 255, 0.2)', style: 3 },
        horzLine: { width: 1 as any, color: 'rgba(255, 255, 255, 0.2)', style: 3 },
      },
      handleScroll: true,
      handleScale: true,
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    // Main Series
    const seriesOptions = {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    };

    const candlestickSeries = chartType === 'candles' 
      ? chart.addSeries(CandlestickSeries, seriesOptions)
      : chart.addSeries(BarSeries, {
          upColor: '#10b981',
          downColor: '#f43f5e',
          thinBars: false,
        });
    
    candlestickSeriesRef.current = candlestickSeries;

    // Indicators
    ema50SeriesRef.current = chart.addSeries(LineSeries, { color: '#10b981', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false });
    ema200SeriesRef.current = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
    
    bbUpperSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.3)', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
    bbLowerSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.3)', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
    bbMiddleSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(59, 130, 246, 0.2)', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false });

    gainzUpperSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(139, 92, 246, 0.3)', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false });
    gainzLowerSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(139, 92, 246, 0.3)', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false });
    gainzSignalSeriesRef.current = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 2, lastValueVisible: true, priceLineVisible: false });

    // TPO Indicators
    tpoPocSeriesRef.current = chart.addSeries(LineSeries, { color: '#ef4444', lineWidth: 2, lastValueVisible: true, priceLineVisible: false, title: 'POC' });
    tpoVaUpperSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(239, 68, 68, 0.3)', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, title: 'VAH' });
    tpoVaLowerSeriesRef.current = chart.addSeries(LineSeries, { color: 'rgba(239, 68, 68, 0.3)', lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, title: 'VAL' });

    sma20SeriesRef.current = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });
    sma50SeriesRef.current = chart.addSeries(LineSeries, { color: '#f43f5e', lineWidth: 1, lastValueVisible: false, priceLineVisible: false });

    // Confidence Series (Histogram at bottom)
    confidenceSeriesRef.current = chart.addSeries(HistogramSeries, {
      color: 'rgba(16, 185, 129, 0.2)',
      priceFormat: { type: 'percent' },
      priceScaleId: 'confidence',
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.priceScale('confidence').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
      visible: false,
    });

    // RSI Chart - Split into separate effect to handle conditional rendering
    // This effect only runs once to set up the main chart
    // We'll handle RSI in a separate effect that depends on showRSI

    // Drawing Logic
    const handleChartClick = (param: MouseEventParams) => {
      if (drawMode === 'trendline' && param.time && param.point) {
        const price = candlestickSeries.coordinateToPrice(param.point.y);
        if (price !== null) {
          const newPoint = { time: param.time, price };
          if (drawingPoints.length === 0) {
            setDrawingPoints([newPoint]);
          } else {
            const newLine: Trendline = {
              id: Math.random().toString(36).substr(2, 9),
              p1: drawingPoints[0],
              p2: newPoint,
            };
            setTrendlines(prev => [...prev, newLine]);
            setDrawingPoints([]);
            setDrawMode('none');
          }
        }
      }
    };

    chart.subscribeClick(handleChartClick);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        try {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
          if (rsiChartRef.current && rsiContainerRef.current) {
            rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
          }
        } catch (e) {
          // Chart might be disposed
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.unsubscribeClick(handleChartClick);
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      ema50SeriesRef.current = null;
      ema200SeriesRef.current = null;
      bbUpperSeriesRef.current = null;
      bbLowerSeriesRef.current = null;
      bbMiddleSeriesRef.current = null;
      gainzUpperSeriesRef.current = null;
      gainzLowerSeriesRef.current = null;
      gainzSignalSeriesRef.current = null;
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
        rsiSeriesRef.current = null;
      }
    };
  }, [drawMode, drawingPoints, isFullscreen, chartType, timezone]);

  // RSI Chart Initialization & Sync
  useEffect(() => {
    if (!showRSI || !rsiContainerRef.current || !chartRef.current) {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
        rsiSeriesRef.current = null;
      }
      return;
    }

    const rsiChart = createChart(rsiContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d5db',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: rsiContainerRef.current.clientWidth,
      height: 120,
      timeScale: {
        visible: false,
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true,
      },
      crosshair: {
        mode: 0,
        vertLine: { width: 1 as any, color: 'rgba(255, 255, 255, 0.2)', style: 3 },
        horzLine: { width: 1 as any, color: 'rgba(255, 255, 255, 0.2)', style: 3 },
      },
      handleScroll: true,
      handleScale: true,
    });

    rsiChartRef.current = rsiChart;
    rsiSeriesRef.current = rsiChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, lastValueVisible: true });

    // Sync with main chart
    const mainChart = chartRef.current;
    if (!mainChart) return;

    const syncMainToRsi = (range: any) => {
      if (range && rsiChartRef.current) {
        try {
          rsiChartRef.current.timeScale().setVisibleRange(range);
        } catch (e) {
          // RSI chart might be disposed
        }
      }
    };
    const syncRsiToMain = (range: any) => {
      if (range && chartRef.current) {
        try {
          chartRef.current.timeScale().setVisibleRange(range);
        } catch (e) {
          // Main chart might be disposed
        }
      }
    };

    mainChart.timeScale().subscribeVisibleTimeRangeChange(syncMainToRsi);
    rsiChart.timeScale().subscribeVisibleTimeRangeChange(syncRsiToMain);

    return () => {
      try {
        if (mainChart && chartRef.current === mainChart) {
          mainChart.timeScale().unsubscribeVisibleTimeRangeChange(syncMainToRsi);
        }
        if (rsiChart && rsiChartRef.current === rsiChart) {
          rsiChart.timeScale().unsubscribeVisibleTimeRangeChange(syncRsiToMain);
          rsiChart.remove();
        }
      } catch (e) {
        // Already disposed
      }
      rsiChartRef.current = null;
      rsiSeriesRef.current = null;
    };
  }, [showRSI, isFullscreen, timezone]); // Re-init when toggled or resized

  // MACD Chart Initialization & Sync
  useEffect(() => {
    if (!showMACD || !macdContainerRef.current || !chartRef.current) {
      if (macdChartRef.current) {
        macdChartRef.current.remove();
        macdChartRef.current = null;
        macdLineSeriesRef.current = null;
        macdSignalSeriesRef.current = null;
        macdHistogramSeriesRef.current = null;
      }
      return;
    }

    const macdChart = createChart(macdContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d5db',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: macdContainerRef.current.clientWidth,
      height: 120,
      timeScale: {
        visible: false,
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true,
      },
      crosshair: {
        mode: 0,
        vertLine: { width: 1 as any, color: 'rgba(255, 255, 255, 0.2)', style: 3 },
        horzLine: { width: 1 as any, color: 'rgba(255, 255, 255, 0.2)', style: 3 },
      },
      handleScroll: true,
      handleScale: true,
    });

    macdChartRef.current = macdChart;
    macdLineSeriesRef.current = macdChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, lastValueVisible: true });
    macdSignalSeriesRef.current = macdChart.addSeries(LineSeries, { color: '#f43f5e', lineWidth: 1, lastValueVisible: true });
    macdHistogramSeriesRef.current = macdChart.addSeries(HistogramSeries, {
      color: '#10b981',
      lastValueVisible: false,
    });

    // Sync with main chart
    const mainChart = chartRef.current;
    if (!mainChart) return;

    const syncMainToMacd = (range: any) => {
      if (range && macdChartRef.current) {
        try {
          macdChartRef.current.timeScale().setVisibleRange(range);
        } catch (e) {}
      }
    };
    const syncMacdToMain = (range: any) => {
      if (range && chartRef.current) {
        try {
          chartRef.current.timeScale().setVisibleRange(range);
        } catch (e) {}
      }
    };

    mainChart.timeScale().subscribeVisibleTimeRangeChange(syncMainToMacd);
    macdChart.timeScale().subscribeVisibleTimeRangeChange(syncMacdToMain);

    return () => {
      try {
        if (mainChart && chartRef.current === mainChart) {
          mainChart.timeScale().unsubscribeVisibleTimeRangeChange(syncMainToMacd);
        }
        if (macdChart && macdChartRef.current === macdChart) {
          macdChart.timeScale().unsubscribeVisibleTimeRangeChange(syncMacdToMain);
          macdChart.remove();
        }
      } catch (e) {}
      macdChartRef.current = null;
      macdLineSeriesRef.current = null;
      macdSignalSeriesRef.current = null;
      macdHistogramSeriesRef.current = null;
    };
  }, [showMACD, isFullscreen, timezone]);

  // Update Data & Indicators
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || data.length === 0) return;

    if (chartType === 'candles') {
      const formattedData: CandlestickData[] = data
        .map(d => ({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
        .filter(p => 
          p.time !== null && p.time !== undefined &&
          typeof p.open === 'number' && Number.isFinite(p.open) &&
          typeof p.high === 'number' && Number.isFinite(p.high) &&
          typeof p.low === 'number' && Number.isFinite(p.low) &&
          typeof p.close === 'number' && Number.isFinite(p.close)
        );
      candlestickSeriesRef.current.setData(formattedData);
    } else if (chartType === 'bars') {
      const formattedData: BarData[] = data
        .map(d => ({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
        .filter(p => 
          p.time !== null && p.time !== undefined &&
          typeof p.open === 'number' && Number.isFinite(p.open) &&
          typeof p.high === 'number' && Number.isFinite(p.high) &&
          typeof p.low === 'number' && Number.isFinite(p.low) &&
          typeof p.close === 'number' && Number.isFinite(p.close)
        );
      candlestickSeriesRef.current.setData(formattedData);
    } else {
      const formattedData: LineData[] = data
        .map(d => ({
          time: d.time as any,
          value: d.close,
        }))
        .filter(p => 
          p.time !== null && p.time !== undefined &&
          typeof p.value === 'number' && Number.isFinite(p.value)
        );
      candlestickSeriesRef.current.setData(formattedData);
    }

    const closes = data.map(d => d.close);

    // EMA
    if (showEMA) {
      const calculateEMA = (prices: number[], period: number) => {
        const k = 2 / (period + 1);
        const ema = [prices[0]];
        for (let i = 1; i < prices.length; i++) ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        return ema;
      };
      ema50SeriesRef.current.setData(
        calculateEMA(closes, 50)
          .map((v, i) => ({ time: data[i].time as any, value: v }))
          .filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value))
      );
      ema200SeriesRef.current.setData(
        calculateEMA(closes, 200)
          .map((v, i) => ({ time: data[i].time as any, value: v }))
          .filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value))
      );
    } else {
      ema50SeriesRef.current.setData([]);
      ema200SeriesRef.current.setData([]);
    }

    // Bollinger Bands
    if (showBB && bbUpperSeriesRef.current) {
      const bb = calculateBollingerBands(closes);
      bbUpperSeriesRef.current.setData(bb.upper.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      bbLowerSeriesRef.current.setData(bb.lower.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      bbMiddleSeriesRef.current.setData(bb.middle.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
    } else if (bbUpperSeriesRef.current) {
      bbUpperSeriesRef.current.setData([]);
      bbLowerSeriesRef.current.setData([]);
      bbMiddleSeriesRef.current.setData([]);
    }

    // GainzAlgo
    if (showGainz && gainzUpperSeriesRef.current) {
      const gainz = calculateGainzAlgo(data);
      gainzUpperSeriesRef.current.setData(gainz.map(g => ({ time: g.time as any, value: g.upper })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      gainzLowerSeriesRef.current.setData(gainz.map(g => ({ time: g.time as any, value: g.lower })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      gainzSignalSeriesRef.current.setData(gainz.map(g => ({ time: g.time as any, value: (data.find(d => d.time === g.time)?.close || 0) + (g.signal * 0.1) })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
    } else if (gainzUpperSeriesRef.current) {
      gainzUpperSeriesRef.current.setData([]);
      gainzLowerSeriesRef.current.setData([]);
      gainzSignalSeriesRef.current.setData([]);
    }

    // RSI
    if (showRSI && rsiSeriesRef.current) {
      const rsi = calculateRSI(closes);
      rsiSeriesRef.current.setData(rsi.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
    }

    // SMA
    if (showSMA && sma20SeriesRef.current) {
      const sma20 = calculateSMA(closes, 20);
      const sma50 = calculateSMA(closes, 50);
      sma20SeriesRef.current.setData(sma20.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      sma50SeriesRef.current.setData(sma50.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
    } else if (sma20SeriesRef.current) {
      sma20SeriesRef.current.setData([]);
      sma50SeriesRef.current.setData([]);
    }

    // MACD
    if (showMACD && macdLineSeriesRef.current) {
      const { macdLine, signalLine, histogram } = calculateMACD(closes);
      macdLineSeriesRef.current.setData(macdLine.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      macdSignalSeriesRef.current.setData(signalLine.map((v, i) => ({ time: data[i].time as any, value: v })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
      macdHistogramSeriesRef.current.setData(histogram.map((v, i) => ({ 
        time: data[i].time as any, 
        value: v,
        color: v >= 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'
      })).filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
    }

    // FVG Markers
    if (showFVG && candlestickSeriesRef.current) {
      const fvgs = detectFVGs(data);
      const markers: SeriesMarker<Time>[] = fvgs.map(f => ({
        time: data[f.index].time as Time,
        position: f.type === 'BULLISH' ? 'belowBar' : 'aboveBar',
        color: f.type === 'BULLISH' ? '#10b981' : '#f43f5e',
        shape: f.type === 'BULLISH' ? 'arrowUp' : 'arrowDown',
        text: `FVG ${f.mitigated ? '(M)' : ''}`,
      }));
      
      // Merge with existing markers if any (like trades)
      if (typeof candlestickSeriesRef.current.setMarkers === 'function') {
        candlestickSeriesRef.current.setMarkers(markers);
      }
    } else if (candlestickSeriesRef.current) {
      if (typeof candlestickSeriesRef.current.setMarkers === 'function') {
        candlestickSeriesRef.current.setMarkers([]);
      }
    }

    // TPO Calculation
    if (showTPO && tpoPocSeriesRef.current) {
      const prices = data.map(d => d.close);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const step = (maxPrice - minPrice) / 20;
      
      const profile: Record<number, number> = {};
      data.forEach(d => {
        const bucket = Math.floor((d.close - minPrice) / step);
        profile[bucket] = (profile[bucket] || 0) + 1;
      });
      
      let pocBucket = 0;
      let maxTPOs = 0;
      Object.entries(profile).forEach(([bucket, count]) => {
        if (count > maxTPOs) {
          maxTPOs = count;
          pocBucket = Number(bucket);
        }
      });
      
      const pocPrice = minPrice + pocBucket * step;
      const vah = pocPrice + step * 3;
      const val = pocPrice - step * 3;
      
      tpoPocSeriesRef.current.setData(data.map(d => ({ time: d.time as any, value: pocPrice })));
      tpoVaUpperSeriesRef.current.setData(data.map(d => ({ time: d.time as any, value: vah })));
      tpoVaLowerSeriesRef.current.setData(data.map(d => ({ time: d.time as any, value: val })));
    } else if (tpoPocSeriesRef.current) {
      tpoPocSeriesRef.current.setData([]);
      tpoVaUpperSeriesRef.current.setData([]);
      tpoVaLowerSeriesRef.current.setData([]);
    }

    // Confidence History
    if (confidenceSeriesRef.current && consensusHistory.length > 0) {
      const confidenceData: HistogramData[] = consensusHistory.map(h => {
        const confidence = h.decision === 'BUY' ? h.buyProb : h.decision === 'SELL' ? h.sellProb : 0;
        const color = h.decision === 'BUY' 
          ? `rgba(16, 185, 129, ${Math.max(0.1, confidence / 100)})` 
          : h.decision === 'SELL' 
            ? `rgba(244, 63, 94, ${Math.max(0.1, confidence / 100)})` 
            : 'rgba(113, 113, 122, 0.1)';
        
        return {
          time: h.time,
          value: confidence,
          color: color
        };
      });
      confidenceSeriesRef.current.setData(confidenceData);
    }

    // Markers
    const lastIdx = data.length - 1;
    if (data[lastIdx]?.time && candlestickSeriesRef.current) {
      const markers: SeriesMarker<Time>[] = [];

      // 1. Consensus Marker
      if (decision && decision !== 'NO TRADE') {
        markers.push({
          time: data[lastIdx].time as any,
          position: decision === 'BUY' ? 'belowBar' : 'aboveBar',
          color: decision === 'BUY' ? '#10b981' : '#f43f5e',
          shape: decision === 'BUY' ? 'arrowUp' : 'arrowDown',
          text: `CONSENSUS: ${decision} (${(decision === 'BUY' ? buyProb : sellProb)?.toFixed(1)}%)`,
          size: 2
        });
      }

      // 2. Neural High-Confidence Markers (Top 3)
      const highConfSignals = [...signals]
        .filter(s => s.decision !== 'NO TRADE' && s.confidence > 90)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      highConfSignals.forEach((s, i) => {
        markers.push({
          time: data[lastIdx].time as any,
          position: s.decision === 'BUY' ? 'belowBar' : 'aboveBar',
          color: s.decision === 'BUY' ? '#34d399' : '#fb7185',
          shape: 'circle',
          text: `${(s.botId || 'bot').split('_')[0]}: ${s.decision}`,
          size: 1
        });
      });

      if (markers.length > 0) {
        try {
          if (typeof candlestickSeriesRef.current.setMarkers === 'function') {
            candlestickSeriesRef.current.setMarkers(markers);
          }
        } catch (e) {
          // Series might be disposed
        }
      }
    }

  }, [data, signals, showEMA, showBB, showGainz, showRSI, showSMA, showMACD, showTPO, showFVG, chartType, decision, buyProb, sellProb, consensusHistory]);

  // Handle Trendlines Rendering
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;

    // Clear old trendlines
    trendlineSeriesRefs.current.forEach(series => {
      try {
        chart.removeSeries(series);
      } catch (e) {
        // Series might already be removed if chart was disposed
      }
    });
    trendlineSeriesRefs.current.clear();

    // Render current trendlines
    trendlines.forEach(line => {
      try {
        const series = chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 2,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        series.setData([
          { time: line.p1.time, value: line.p1.price },
          { time: line.p2.time, value: line.p2.price },
        ].filter(p => p.time !== null && p.time !== undefined && typeof p.value === 'number' && Number.isFinite(p.value)));
        trendlineSeriesRefs.current.set(line.id, series);
      } catch (e) {
        // Chart might be disposed
      }
    });
  }, [trendlines]);
  
  // Handle Trade Price Lines
  useEffect(() => {
    if (!candlestickSeriesRef.current) return;
    const series = candlestickSeriesRef.current;

    // Clear old trade lines
    tradePriceLinesRef.current.forEach(line => {
      try {
        if (typeof series.removePriceLine === 'function') {
          series.removePriceLine(line);
        }
      } catch (e) {}
    });
    tradePriceLinesRef.current = [];

    // Filter trades for current symbol
    const activeTrades = trades.filter(t => t.symbol === symbol && t.status === 'OPEN');

    activeTrades.forEach(trade => {
      // Entry Line
      if (typeof series.createPriceLine === 'function') {
        const entryLine = series.createPriceLine({
          price: trade.entryPrice,
          color: trade.type === 'BUY' ? '#10b981' : '#f43f5e',
          lineWidth: 2,
          lineStyle: 0, // Solid
          axisLabelVisible: true,
          title: `${trade.type} ENTRY`,
        });
        
        // SL Line
        const slLine = series.createPriceLine({
          price: trade.stopLoss,
          color: '#f43f5e',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'SL',
        });

        // TP Line
        const tpLine = series.createPriceLine({
          price: trade.takeProfit,
          color: '#10b981',
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: 'TP',
        });

        tradePriceLinesRef.current.push(entryLine, slLine, tpLine);
      }
    });
  }, [trades, symbol]);

  const clearTrendlines = () => {
    setTrendlines([]);
    setDrawingPoints([]);
  };

  return (
    <div className={`relative w-full bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-auto'}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setDrawMode('none')}
              className={`p-2 rounded-lg transition-all ${drawMode === 'none' ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-white'}`}
              title="Cursor"
            >
              <MousePointer2 size={16} />
            </button>
            <button 
              onClick={() => setDrawMode('trendline')}
              className={`p-2 rounded-lg transition-all ${drawMode === 'trendline' ? `bg-${themeColor}-500 text-black` : 'text-zinc-500 hover:text-white'}`}
              title="Draw Trendline"
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={clearTrendlines}
              className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 transition-all"
              title="Clear All Drawings"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowEMA(!showEMA)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showEMA ? `bg-${themeColor}-500/10 border-${themeColor}-500/20 text-${themeColor}-500` : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              EMA {showEMA ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowSMA(!showSMA)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showSMA ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              SMA {showSMA ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowBB(!showBB)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showBB ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              BB {showBB ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowGainz(!showGainz)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showGainz ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              GAINZ {showGainz ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowRSI(!showRSI)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showRSI ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              RSI {showRSI ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowMACD(!showMACD)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showMACD ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              MACD {showMACD ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowFVG(!showFVG)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showFVG ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              FVG {showFVG ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button 
              onClick={() => setShowTPO(!showTPO)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${showTPO ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              TPO {showTPO ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => onChartTypeChange?.('candles')}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartType === 'candles' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Candles
            </button>
            <button 
              onClick={() => onChartTypeChange?.('bars')}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartType === 'bars' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Bars
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{symbol}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{timeframe}</span>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-all border border-white/5"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative">
        <div ref={chartContainerRef} className="w-full" style={{ height: isFullscreen ? 'calc(100vh - 250px)' : '400px' }} />
        
        {/* Price Info Overlay */}
        <div className="absolute top-4 left-6 z-10 pointer-events-none flex flex-col gap-2">
          {data.length > 0 && (
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-zinc-500">O: <span className="text-white">{data[data.length-1].open?.toFixed(5) || '0.00000'}</span></span>
              <span className="text-zinc-500">H: <span className="text-white text-emerald-400">{data[data.length-1].high?.toFixed(5) || '0.00000'}</span></span>
              <span className="text-zinc-500">L: <span className="text-white text-rose-400">{data[data.length-1].low?.toFixed(5) || '0.00000'}</span></span>
              <span className="text-zinc-500">C: <span className="text-white">{data[data.length-1].close?.toFixed(5) || '0.00000'}</span></span>
              <span className={`px-1.5 rounded ${data[data.length-1].close >= data[data.length-1].open ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                {(data[data.length-1].close - data[data.length-1].open).toFixed(5)}
              </span>
            </div>
          )}
          {decision && decision !== 'NO TRADE' && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${decision === 'BUY' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-black'}`}>
              <TrendingUp size={10} />
              Neural Consensus: {decision} ({(decision === 'BUY' ? buyProb : sellProb)?.toFixed(1)}%)
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <ArrowRightLeft size={10} />
              Order Flow: {data.length > 1 && (data[data.length-1].tick_volume - data[data.length-2].tick_volume > 0 ? 'BULLISH' : 'BEARISH')}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <Database size={10} />
              Book: {((data[data.length-1]?.close * 10000 % 100) > 50 ? 'BID HEAVY' : 'ASK HEAVY')}
            </div>
          </div>
          {drawMode === 'trendline' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-black rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
              <Pencil size={10} />
              Drawing Trendline: {drawingPoints.length === 0 ? 'Click to Start' : 'Click to End'}
            </div>
          )}
        </div>
      </div>

      {/* RSI Area */}
      {showRSI && (
        <div className="border-t border-white/5 bg-black/20">
          <div className="px-6 py-1 flex items-center justify-between">
            <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Relative Strength Index (14)</span>
            <div className="flex gap-4 text-[9px] font-mono text-zinc-600">
              <span>OVERBOUGHT: 70</span>
              <span>OVERSOLD: 30</span>
            </div>
          </div>
          <div ref={rsiContainerRef} className="w-full h-[120px]" />
        </div>
      )}

      {/* MACD Area */}
      {showMACD && (
        <div className="border-t border-white/5 bg-black/20">
          <div className="px-6 py-1 flex items-center justify-between">
            <span className="text-[9px] font-black text-rose-500/50 uppercase tracking-widest">MACD (12, 26, 9)</span>
            <div className="flex gap-4 text-[9px] font-mono text-zinc-600">
              <span>MACD LINE</span>
              <span>SIGNAL LINE</span>
            </div>
          </div>
          <div ref={macdContainerRef} className="w-full h-[120px]" />
        </div>
      )}
    </div>
  );
};

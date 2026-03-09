import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData, 
  LineData, 
  BarData,
  SeriesMarker, 
  CandlestickSeries, 
  LineSeries,
  BarSeries,
  Time,
  MouseEventParams
} from 'lightweight-charts';
import { 
  PriceData, 
  BotSignal, 
  calculateGainzAlgo, 
  calculateRSI, 
  calculateBollingerBands 
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
  Minimize2
} from 'lucide-react';

interface MT5ChartProps {
  data: PriceData[];
  signals: BotSignal[];
  symbol: string;
  timeframe: string;
  chartType: 'candles' | 'bars';
  onChartTypeChange?: (type: 'candles' | 'bars') => void;
  themeColor?: string;
}

interface Trendline {
  id: string;
  p1: { time: Time; price: number };
  p2: { time: Time; price: number };
}

export const MT5Chart: React.FC<MT5ChartProps> = ({ data, signals, symbol, timeframe, chartType, onChartTypeChange, themeColor = 'emerald' }) => {
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
  
  const trendlineSeriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

  // UI State
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showGainz, setShowGainz] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
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
  }, [drawMode, drawingPoints, isFullscreen, chartType]);

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
  }, [showRSI, isFullscreen]); // Re-init when toggled or resized

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

    // Markers
    const lastIdx = data.length - 1;
    const lastSignal = signals[0];
    if (lastSignal?.decision !== 'NO TRADE' && data[lastIdx]?.time && candlestickSeriesRef.current) {
      try {
        if (typeof candlestickSeriesRef.current.setMarkers === 'function') {
          candlestickSeriesRef.current.setMarkers([{
            time: data[lastIdx].time as any,
            position: lastSignal.decision === 'BUY' ? 'belowBar' : 'aboveBar',
            color: lastSignal.decision === 'BUY' ? '#10b981' : '#f43f5e',
            shape: lastSignal.decision === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: lastSignal.decision,
          }]);
        }
      } catch (e) {
        // Series might be disposed
      }
    }

  }, [data, signals, showEMA, showBB, showGainz, showRSI, chartType]);

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
    </div>
  );
};

import streamlit as st
import pandas as pd
import numpy as np
import time
import requests
import plotly.graph_objects as go
from datetime import datetime
from config import STOP_LOSS_POINTS, TAKE_PROFIT_POINTS

# WaltBot Extreme - Python Dashboard
st.set_page_config(page_title="WaltBot Extreme", layout="wide", initial_sidebar_state="expanded")

# Custom CSS for Dark Mode
st.markdown("""
    <style>
    .main {
        background-color: #0a0a0a;
        color: #ffffff;
    }
    .stButton>button {
        width: 100%;
        border-radius: 10px;
        height: 3em;
        background-color: #10b981;
        color: black;
        font-weight: bold;
    }
    .stSelectbox {
        color: white;
    }
    .risk-card {
        padding: 1rem;
        border-radius: 12px;
        background-color: #1a1a1a;
        border: 1px solid #333;
        margin-bottom: 1rem;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🧠 MEDUSA EXTREME AI")
st.subheader("Neural Consensus Engine v4.0")

# Sidebar
st.sidebar.header("Market Controls")
selected_symbol = st.sidebar.selectbox("Select Symbol", ["XAUUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "EURJPY", "GBPJPY", "BTCUSD", "ETHUSD"])

# Timeframe Switcher
timeframe = st.sidebar.radio("Select Timeframe", ["M5", "H1"], index=0)

# Risk Info
st.sidebar.markdown(f"""
    <div class="risk-card">
        <p style="font-size: 0.8rem; color: #888; margin: 0;">RISK PARAMETERS</p>
        <p style="font-size: 1.2rem; font-weight: bold; color: #10b981; margin: 0;">SL: {STOP_LOSS_POINTS} PTS</p>
        <p style="font-size: 1.2rem; font-weight: bold; color: #10b981; margin: 0;">TP: {TAKE_PROFIT_POINTS} PTS</p>
    </div>
    """, unsafe_allow_html=True)

# Mock Data Fetching (Simulating API connection)
def get_data(symbol, tf):
    # In a real scenario, this would fetch from http://localhost:3000/api/market-data
    # For now, we simulate the logic from server.ts
    base_price = 2350 if symbol == "XAUUSD" else 150 if "JPY" in symbol else 1.1 if "USD" in symbol else 2500
    volatility = 0.002 if tf == "M5" else 0.01
    
    prices = []
    last_close = base_price
    for i in range(100):
        open_p = last_close
        close_p = open_p + (np.random.rand() - 0.5) * (base_price * volatility)
        high_p = max(open_p, close_p) + np.random.rand() * (base_price * volatility * 0.4)
        low_p = min(open_p, close_p) - np.random.rand() * (base_price * volatility * 0.4)
        last_close = close_p
        prices.append({
            "time": datetime.now(),
            "open": open_p,
            "high": high_p,
            "low": low_p,
            "close": close_p
        })
    return pd.DataFrame(prices)

# Main Dashboard Logic
data = get_data(selected_symbol, timeframe)

# Charting
fig = go.Figure(data=[go.Candlestick(x=data['time'],
                open=data['open'],
                high=data['high'],
                low=data['low'],
                close=data['close'],
                increasing_line_color='#10b981', 
                decreasing_line_color='#ef4444')])

fig.update_layout(
    title=f"{selected_symbol} - {timeframe} Live Chart",
    template="plotly_dark",
    xaxis_rangeslider_visible=False,
    height=600,
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)'
)

st.plotly_chart(fig, use_container_width=True)

# Neural Consensus Mockup
st.header("Neural Consensus Breakdown")
cols = st.columns(4)
bots = ["Trend Bot", "Momentum", "Volume", "VWAP", "Structure", "Liquidity", "Breakout"]

for i, bot in enumerate(bots):
    with cols[i % 4]:
        signal = "BUY" if np.random.rand() > 0.5 else "SELL"
        color = "green" if signal == "BUY" else "red"
        st.metric(bot, signal, delta=f"{np.random.randint(60, 95)}% Confidence", delta_color="normal")

# Auto-refresh
time.sleep(5)
st.rerun()

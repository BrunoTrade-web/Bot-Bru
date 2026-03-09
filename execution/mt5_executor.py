# execution/mt5_executor.py
import MetaTrader5 as mt5
from config import STOP_LOSS_POINTS, TAKE_PROFIT_POINTS

def execute(symbol, order_type, price, volume):
    """
    Executes a trade on MT5 with Stop Loss and Take Profit.
    """
    point = mt5.symbol_info(symbol).point
    
    if order_type == mt5.ORDER_TYPE_BUY:
        sl = price - STOP_LOSS_POINTS * point
        tp = price + TAKE_PROFIT_POINTS * point
    elif order_type == mt5.ORDER_TYPE_SELL:
        sl = price + STOP_LOSS_POINTS * point
        tp = price - TAKE_PROFIT_POINTS * point
    else:
        return None

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": order_type,
        "price": price,
        "sl": sl,
        "tp": tp,
        "deviation": 20,
        "magic": 234000,
        "comment": "WaltBot Extreme Trade",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    return result

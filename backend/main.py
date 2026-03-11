from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import yfinance as yf
import akshare as ak
import datetime
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StockPulse API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup (optional - for Supabase connection)
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Models
class StockResponse(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: int
    amount: float
    high: float
    low: float
    open: float
    prev_close: float
    updated_at: str
    market: str

class KLineResponse(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: int

# Helper functions
def get_us_stock_data(symbol: str) -> Optional[StockResponse]:
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # Get historical data for prev_close
        hist = ticker.history(period="2d")
        if len(hist) >= 2:
            prev_close = hist['Close'].iloc[-2]
        else:
            prev_close = info.get('previousClose', info.get('regularMarketPreviousClose', 0))
        
        current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close else 0
        
        return StockResponse(
            symbol=symbol,
            name=info.get('shortName', symbol),
            price=current_price,
            change=change,
            change_percent=change_percent,
            volume=info.get('volume', 0),
            amount=info.get('marketCap', 0),
            high=info.get('dayHigh', 0),
            low=info.get('dayLow', 0),
            open=info.get('open', 0),
            prev_close=prev_close,
            updated_at=datetime.datetime.now().isoformat(),
            market="US"
        )
    except Exception as e:
        print(f"Error fetching US stock {symbol}: {e}")
        return None

def get_cn_stock_data(symbol: str) -> Optional[StockResponse]:
    try:
        # Use akshare for Chinese stocks
        df = ak.stock_zh_a_spot_em()
        stock = df[df['代码'] == symbol]
        
        if stock.empty:
            # Try with prefix
            symbol_with_prefix = symbol if symbol.startswith(('6', '5', '8')) else f"{int(symbol):06d}"
            stock = df[df['代码'] == symbol_with_prefix]
        
        if stock.empty:
            return None
        
        row = stock.iloc[0]
        
        return StockResponse(
            symbol=symbol,
            name=row['名称'],
            price=float(row['最新价']) if row['最新价'] != '--' else 0,
            change=float(row['涨跌额']) if row['涨跌额'] != '--' else 0,
            change_percent=float(row['涨跌幅'].strip('%')) if row['涨跌幅'] != '--' else 0,
            volume=int(row['成交量']) if row['成交量'] != '--' else 0,
            amount=float(row['成交额']) if row['成交额'] != '--' else 0,
            high=float(row['最高']) if row['最高'] != '--' else 0,
            low=float(row['最低']) if row['最低'] != '--' else 0,
            open=float(row['今开']) if row['今开'] != '--' else 0,
            prev_close=float(row['昨收']) if row['昨收'] != '--' else 0,
            updated_at=datetime.datetime.now().isoformat(),
            market="CN"
        )
    except Exception as e:
        print(f"Error fetching CN stock {symbol}: {e}")
        return None

def get_us_history(symbol: str, period: str = "1mo") -> List[KLineResponse]:
    try:
        ticker = yf.Ticker(symbol)
        period_map = {
            "1D": "1d",
            "1W": "5d", 
            "1M": "1mo",
            "3M": "3mo",
            "1Y": "1y"
        }
        hist = ticker.history(period=period_map.get(period, "1mo"))
        
        result = []
        for idx, row in hist.iterrows():
            timestamp = int(idx.timestamp())
            result.append(KLineResponse(
                time=timestamp,
                open=float(row['Open']),
                high=float(row['High']),
                low=float(row['Low']),
                close=float(row['Close']),
                volume=int(row['Volume'])
            ))
        
        return result
    except Exception as e:
        print(f"Error fetching US history for {symbol}: {e}")
        return []

def get_cn_history(symbol: str, period: str = "1mo") -> List[KLineResponse]:
    try:
        # Use akshare for Chinese stock history
        period_map = {
            "1D": "daily",
            "1W": "daily",
            "1M": "monthly",
            "3M": "monthly",
            "1Y": "yearly"
        }
        
        # For now, return empty - akshare requires more complex setup
        return []
    except Exception as e:
        print(f"Error fetching CN history for {symbol}: {e}")
        return []

# API Routes
@app.get("/")
async def root():
    return {"message": "StockPulse API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/stock/{symbol}", response_model=StockResponse)
async def get_stock(symbol: str):
    # Determine market
    if symbol.isalpha() and symbol.isupper():
        # Likely US stock
        data = get_us_stock_data(symbol)
    else:
        # Likely Chinese stock
        data = get_cn_stock_data(symbol)
    
    if not data:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    return data

@app.get("/api/stocks")
async def get_stocks(symbols: str):
    symbol_list = symbols.split(",")
    results = []
    
    for symbol in symbol_list:
        symbol = symbol.strip()
        if symbol.isalpha() and symbol.isupper():
            data = get_us_stock_data(symbol)
        else:
            data = get_cn_stock_data(symbol)
        
        if data:
            results.append(data)
    
    return results

@app.get("/api/stock/{symbol}/history")
async def get_stock_history(symbol: str, period: str = "1M"):
    if symbol.isalpha() and symbol.isupper():
        return get_us_history(symbol, period)
    else:
        return get_cn_history(symbol, period)

@app.get("/api/search")
async def search_stocks(q: str):
    results = []
    
    # Search US stocks (limited)
    try:
        ticker = yf.Ticker(q)
        info = ticker.info
        if info.get('shortName'):
            results.append(StockResponse(
                symbol=q.upper(),
                name=info.get('shortName', q),
                price=info.get('currentPrice', 0),
                change=0,
                change_percent=0,
                volume=0,
                amount=0,
                high=0,
                low=0,
                open=0,
                prev_close=0,
                updated_at=datetime.datetime.now().isoformat(),
                market="US"
            ))
    except:
        pass
    
    # Search CN stocks
    try:
        df = ak.stock_zh_a_spot_em()
        matches = df[df['名称'].str.contains(q, na=False) | df['代码'].str.contains(q, na=False)]
        
        for _, row in matches.head(10).iterrows():
            results.append(StockResponse(
                symbol=row['代码'],
                name=row['名称'],
                price=float(row['最新价']) if row['最新价'] != '--' else 0,
                change=float(row['涨跌额']) if row['涨跌额'] != '--' else 0,
                change_percent=float(row['涨跌幅'].strip('%')) if row['涨跌幅'] != '--' else 0,
                volume=int(row['成交量']) if row['成交量'] != '--' else 0,
                amount=float(row['成交额']) if row['成交额'] != '--' else 0,
                high=float(row['最高']) if row['最高'] != '--' else 0,
                low=float(row['最低']) if row['最低'] != '--' else 0,
                open=float(row['今开']) if row['今开'] != '--' else 0,
                prev_close=float(row['昨收']) if row['昨收'] != '--' else 0,
                updated_at=datetime.datetime.now().isoformat(),
                market="CN"
            ))
    except Exception as e:
        print(f"Search error: {e}")
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

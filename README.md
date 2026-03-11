# StockPulse - 股票数据分析仪表盘

一个功能完整的股票数据分析仪表盘，支持 A股/美股实时数据、K线图、自选股管理和涨跌幅预警。

## 🏗️ 架构

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │  Supabase   │
│  (前端+API)  │◀──▶│  (Python后端)│───▶│  (PostgreSQL)│
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 快速部署

### 前端 (Vercel)

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目，获取 URL 和 Anon Key

2. ** Fork 或克隆仓库**

3. **部署到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - Import GitHub repository
   - 添加环境变量:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL` (Railway 部署后的 URL)

### 后端 (Railway)

1. **创建 Railway 项目**
   - 访问 [railway.app](https://railway.app)
   - 创建新项目，选择 "Deploy from GitHub repo"

2. **配置环境变量**
   - `DATABASE_URL` (可选，Supabase 的 PostgreSQL 连接字符串)

3. **部署**
   - Railway 会自动检测 `railway.toml` 并部署

### 数据库 (Supabase)

1. 在 Supabase SQL Editor 中执行以下 SQL:

```sql
-- 股票基本信息
CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  market VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 自选股
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  stock_id INTEGER REFERENCES stocks(id),
  added_at TIMESTAMP DEFAULT NOW()
);

-- 价格历史
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  stock_id INTEGER REFERENCES stocks(id),
  trade_date DATE NOT NULL,
  open DECIMAL(10,2),
  high DECIMAL(10,2),
  low DECIMAL(10,2),
  close DECIMAL(10,2),
  volume BIGINT,
  amount DECIMAL(20,2),
  UNIQUE(stock_id, trade_date)
);

-- 预警记录
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  stock_id INTEGER REFERENCES stocks(id),
  threshold DECIMAL(5,2),
  condition VARCHAR(10),
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ 本地开发

### 前端

```bash
cd frontend
cp .env.example .env.local
# 编辑 .env.local 填入配置
npm install
npm run dev
```

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入配置
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📦 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14, TypeScript, Tailwind CSS |
| 图表 | lightweight-charts (TradingView) |
| 后端 | Python FastAPI |
| 数据库 | Supabase (PostgreSQL) |
| 部署 | Vercel + Railway |

## 📄 许可证

MIT

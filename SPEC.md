# 股票数据分析仪表盘 - 规格说明书

## 1. 项目概述

- **项目名称**: StockPulse - 股票数据分析仪表盘
- **项目类型**: Web 应用 (全栈)
- **核心功能**: 实时股票行情展示、K线图分析、自选股管理、涨跌幅预警
- **目标用户**: 个人投资者、股票爱好者

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Next.js 14 | App Router, TypeScript |
| 样式 | Tailwind CSS | 响应式设计 |
| 图表 | lightweight-charts | TradingView 出品,K线图 |
| 后端 | Python FastAPI | Railway 部署 |
| 数据库 | Supabase (PostgreSQL) | 免费层 |
| 部署 | Vercel (前端) + Railway (后端) | 免费层 |

### 2.2 系统架构图

```
┌─────────────────┐
│   用户浏览器    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │
│  (Next.js前端)  │◀──▶│  (FastAPI后端)  │
│  :3000          │    │  :8000          │
└────────┬────────┘    └────────┬────────┘
         │                     │
         │              ┌──────┴──────┐
         │              ▼             │
         │     ┌─────────────────┐    │
         │     │  Supabase       │    │
         │     │ PostgreSQL      │    │
         │     └─────────────────┘    │
         │              │             │
         ▼              ▼             ▼
┌─────────────────────────────────────────┐
│            外部数据源                    │
│  • A股: akshare (开源)                   │
│  • 美股: yfinance                        │
└─────────────────────────────────────────┘
```

## 3. 功能规格

### 3.1 核心功能

#### F1: 实时行情展示
- **描述**: 显示 A股/美股 当前价格、涨跌幅、涨跌额
- **数据字段**:
  - 股票代码 (symbol)
  - 股票名称 (name)
  - 当前价格 (price)
  - 涨跌幅 (change_percent)
  - 涨跌额 (change)
  - 成交量 (volume)
  - 成交额 (amount)
  - 最高/最低 (high/low)
  - 昨收/今开 (prev_close/open)
  - 更新时间 (updated_at)

#### F2: K线图 + 均线
- **图表类型**: K线图(Candlestick)
- **均线**: MA5, MA10, MA20, MA60
- **时间周期**: 日线、周线、月线
- **功能**:
  - 缩放/平移
  - 十字光标
  - 数据 tooltip

#### F3: 成交量展示
- **位置**: K线图下方
- **颜色**: 上涨红色，下跌绿色
- **联动**: 与K线图同步缩放

#### F4: 自选股管理
- **功能**:
  - 添加自选股
  - 删除自选股
  - 排序 (涨跌幅/代码/名称)
  - 搜索股票
- **存储**: Supabase数据库

#### F5: 涨跌幅预警
- **触发条件**: 涨跌幅超过阈值 (±5%, ±7%, ±10%)
- **预警方式**: 页面提示 + 邮件通知
- **配置**: 用户可自定义阈值

#### F6: 历史数据存储
- **表结构**:
  - `stocks`: 股票基本信息
  - `watchlist`: 自选股
  - `price_history`: 历史行情
  - `alerts`: 预警记录
- **保留周期**: 1年

### 3.2 页面结构

```
/
├── /dashboard        # 主仪表盘 (默认页)
├── /watchlist       # 自选股管理
├── /stock/[symbol]  # 个股详情页
├── /alerts          # 预警设置
└── /settings        # 系统设置
```

### 3.3 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stock/{symbol} | 获取股票实时数据 |
| GET | /api/stock/{symbol}/history | 获取历史K线数据 |
| GET | /api/watchlist | 获取自选股列表 |
| POST | /api/watchlist | 添加自选股 |
| DELETE | /api/watchlist/{id} | 删除自选股 |
| GET | /api/alerts | 获取预警列表 |
| POST | /api/alerts | 创建预警 |
| DELETE | /api/alerts/{id} | 删除预警 |

## 4. 数据库设计

### 4.1 表结构

```sql
-- 股票基本信息
CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,  -- 股票代码
  name VARCHAR(100),                     -- 股票名称
  market VARCHAR(10),                   -- 市场 (CN/US)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 自选股
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),                 -- 用户ID (简单处理)
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
  threshold DECIMAL(5,2),              -- 阈值百分比
  condition VARCHAR(10),               -- 'above' 或 'below'
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. 界面设计

### 5.1 主仪表盘 (Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  StockPulse          [搜索股票] [+添加自选]    [🔔] [⚙️]   │
├─────────────────────────────────────────────────────────────┤
│  市场: [全部] [A股] [美股]    排序: [涨跌幅 ▼]             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ 600519  │ │ 000001  │ │   AAPL  │ │  TSLA   │         │
│ │ 贵州茅台 │ │ 平安银行 │ │ Apple   │ │ Tesla   │         │
│ │ ¥1850.00│ │ ¥12.50  │ │ $175.00 │ │ $240.00 │         │
│ │ +2.35% ▲│ │ -0.80% ▼│ │ +1.20% ▲│ │ -3.50% ▼│         │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    K线图 + 均线                              │
│  [1D] [1W] [1M] [3M] [1Y]                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │              📈 K线图表区域                          │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              📊 成交量区域                           │  │
│  └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  涨跌幅预警: ±5% ±7% ±10%  [开启]                          │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 配色方案

| 用途 | 颜色 | Hex |
|------|------|-----|
| 上涨 | 红色 | #EF4444 |
| 下跌 | 绿色 | #22C55E |
| 背景 | 深色 | #0F172A |
| 卡片 | 深灰 | #1E293B |
| 文字 | 白色 | #F8FAFC |
| 次要文字 | 灰色 | #94A3B8 |
| 强调 | 蓝色 | #3B82F6 |

## 6. 部署配置

### 6.1 Vercel (前端)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### 6.2 Railway (后端)

```toml
# railway.toml
[build]
builder = "python"
buildCommand = "pip install -r requirements.txt"

[deploy]
healthcheckPath = "/health"
```

## 7. 验收标准

### 功能验收
- [ ] 能够获取A股实时数据 (至少3只股票)
- [ ] 能够获取美股实时数据 (至少3只股票)
- [ ] K线图正确显示 (支持缩放)
- [ ] 均线计算正确 (MA5/MA10/MA20)
- [ ] 成交量与K线图联动
- [ ] 自选股添加/删除功能正常
- [ ] 涨跌幅超过阈值时有预警提示
- [ ] 历史数据正确存储到Supabase

### 部署验收
- [ ] 前端成功部署到 Vercel
- [ ] 后端成功部署到 Railway
- [ ] Supabase 数据库连接正常
- [ ] 页面加载时间 < 3秒

## 8. 开发计划

### Phase 1: 基础框架
- [ ] 初始化 Next.js 项目
- [ ] 配置 Supabase
- [ ] 搭建后端 API

### Phase 2: 核心功能
- [ ] 股票数据获取
- [ ] K线图 + 均线
- [ ] 自选股 CRUD

### Phase 3: 增强功能
- [ ] 涨跌幅预警
- [ ] 历史数据存储
- [ ] 邮件通知

### Phase 4: 部署上线
- [ ] Vercel 部署
- [ ] Railway 部署
- [ ] 测试调优

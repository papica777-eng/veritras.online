"""
qantum_backend — Qantum Module
Path: backend/qantum_backend.py
Auto-documented by BrutalDocEngine v2.1
"""

#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  QAntum Prime v36.1 - PYTHON BACKEND ENGINE                                 ║
║  FastAPI + WebSocket + Monte Carlo + Rust FFI Bridge                         ║
║                                                                              ║
║  © 2025-2026 Dimitar Prodromov | QAntum Cognitive Empire                     ║
║                                                                              ║
║  Endpoints:                                                                  ║
║    WS  /ws/market-feed     → Real-time market data stream                    ║
║    GET /api/predict/{sym}  → Monte Carlo price prediction                    ║
║    GET /api/risk           → Portfolio risk assessment                        ║
║    GET /api/arbitrage      → Helios arbitrage opportunities                  ║
║    GET /api/status         → System health + governors                       ║
║    GET /health             → Health check                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import math
import os
import sys
import time
import random
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ═══════════════════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════════════════

# Complexity: O(1)
def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S.%f')[:-3]}] {msg}", flush=True)

log(">>> QANTUM PYTHON BACKEND v36.1 STARTING <<<")

# ═══════════════════════════════════════════════════════════════════════════════
# XORSHIFT64 — Same PRNG as Rust for deterministic consistency
# ═══════════════════════════════════════════════════════════════════════════════

class Xorshift64:
    def __init__(self, seed: int = 0xDEADBEEF):
        self.state = seed if seed != 0 else 1

    # Complexity: O(1)
    def next(self) -> int:
        x = self.state & 0xFFFFFFFFFFFFFFFF
        x ^= (x << 13) & 0xFFFFFFFFFFFFFFFF
        x ^= (x >> 7) & 0xFFFFFFFFFFFFFFFF
        x ^= (x << 17) & 0xFFFFFFFFFFFFFFFF
        self.state = x
        return x

    # Complexity: O(1)
    def next_f64(self) -> float:
        return self.next() / (2**64)

    # Complexity: O(1)
    def next_normal(self) -> float:
        u1 = max(self.next_f64(), 1e-15)
        u2 = self.next_f64()
        return math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)

# ═══════════════════════════════════════════════════════════════════════════════
# PRICE ORACLE — Monte Carlo Engine (mirrors Rust + PriceOracle.ts)
# ═══════════════════════════════════════════════════════════════════════════════

VOLATILITIES = {
    "BTC": 0.65, "ETH": 0.80, "SOL": 1.20, "XRP": 0.90,
    "ADA": 0.95, "DOGE": 1.50, "MATIC": 1.10, "AVAX": 1.05,
}

DRIFTS = {
    "BTC": 0.05, "ETH": 0.03, "SOL": 0.02, "XRP": 0.01,
    "ADA": 0.01, "DOGE": 0.00, "MATIC": 0.02, "AVAX": 0.02,
}

BASE_PRICES = {
    "BTC": 50000.0, "ETH": 3050.0, "SOL": 155.0, "XRP": 0.62,
    "ADA": 0.45, "DOGE": 0.08, "MATIC": 0.85, "AVAX": 42.0,
}

@dataclass
class PricePrediction:
    symbol: str
    current_price: float
    predicted_price: float
    confidence: float
    trend: str
    risk_level: str
    value_at_risk: float
    max_drawdown: float
    sharpe_ratio: float
    probability_of_loss: float
    simulations_run: int
    best_case: float
    worst_case: float
    std_dev: float
    elapsed_ms: float = 0.0


# Complexity: O(1)
def predict_price(
    symbol: str,
    current_price: float = 0.0,
    num_simulations: int = 1000,
    horizon_seconds: int = 30,
) -> PricePrediction:
    """Monte Carlo price prediction — same algorithm as Rust engine."""
    if current_price <= 0:
        current_price = BASE_PRICES.get(symbol, 100.0)

    vol = VOLATILITIES.get(symbol, 1.0)
    drift = DRIFTS.get(symbol, 0.01)
    seconds_per_year = 365.0 * 24.0 * 3600.0
    dt = horizon_seconds / seconds_per_year

    steps = max(horizon_seconds, 10)
    step_dt = dt / steps
    step_vol = vol * math.sqrt(step_dt)
    step_drift = (drift - 0.5 * vol * vol) * step_dt

    rng = Xorshift64(int(current_price * 1000) ^ 0xCAFEBABE)
    start_time = time.perf_counter()

    final_prices: List[float] = []
    max_drawdowns: List[float] = []
    loss_count = 0

    for _ in range(num_simulations):
        price = current_price
        peak = current_price
        max_dd = 0.0

        for _ in range(steps):
            z = rng.next_normal()
            price *= math.exp(step_drift + step_vol * z)
            if price > peak:
                peak = price
            dd = (peak - price) / peak
            if dd > max_dd:
                max_dd = dd

        if price < current_price:
            loss_count += 1
        final_prices.append(price)
        max_drawdowns.append(max_dd)

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    final_prices.sort()
    max_drawdowns.sort()

    n = len(final_prices)
    mean = sum(final_prices) / n
    median = final_prices[n // 2]
    worst = final_prices[0]
    best = final_prices[-1]
    var_95 = final_prices[int(n * 0.05)]
    avg_dd = sum(max_drawdowns) / n

    variance = sum((p - mean) ** 2 for p in final_prices) / n
    std_dev = math.sqrt(variance)

    excess_return = (mean - current_price) / current_price
    ret_std = std_dev / current_price
    sharpe = excess_return / ret_std if ret_std > 0 else 0.0

    prob_loss = loss_count / n
    confidence = 1.0 - prob_loss

    change_pct = (mean - current_price) / current_price * 100.0
    trend = "bullish" if change_pct > 0.5 else ("bearish" if change_pct < -0.5 else "neutral")
    risk_level = (
        "extreme" if prob_loss > 0.6 else
        "high" if prob_loss > 0.45 else
        "medium" if prob_loss > 0.3 else
        "low"
    )

    return PricePrediction(
        symbol=symbol,
        current_price=current_price,
        predicted_price=round(mean, 4),
        confidence=round(confidence, 4),
        trend=trend,
        risk_level=risk_level,
        value_at_risk=round((current_price - var_95) / current_price * 100, 4),
        max_drawdown=round(avg_dd * 100, 4),
        sharpe_ratio=round(sharpe, 4),
        probability_of_loss=round(prob_loss, 4),
        simulations_run=num_simulations,
        best_case=round(best, 4),
        worst_case=round(worst, 4),
        std_dev=round(std_dev, 4),
        elapsed_ms=round(elapsed_ms, 2),
    )

# ═══════════════════════════════════════════════════════════════════════════════
# HELIOS ARBITRAGE ENGINE (from Blockchain/Arbitrage)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class ArbitrageOpportunity:
    source: str
    destination: str
    symbol: str
    buy_price: float
    sell_price: float
    spread_pct: float
    net_profit_usd: float
    risk_score: int
    confidence: float
    timestamp: str

# Complexity: O(N*M) — nested iteration detected
def scan_arbitrage() -> List[ArbitrageOpportunity]:
    """Scan cross-exchange arbitrage opportunities."""
    exchanges = ["binance", "kraken", "coinbase", "kucoin", "okx"]
    symbols = ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "AVAX/USD"]
    opportunities: List[ArbitrageOpportunity] = []

    for symbol in symbols:
        base = BASE_PRICES.get(symbol.split("/")[0], 100.0)
        # Simulate different prices per exchange
        prices = {
            ex: base * (1.0 + (random.random() - 0.5) * 0.004)
            for ex in exchanges
        }

        sorted_ex = sorted(prices.items(), key=lambda x: x[1])
        cheapest_ex, cheapest_price = sorted_ex[0]
        expensive_ex, expensive_price = sorted_ex[-1]

        spread_pct = (expensive_price - cheapest_price) / cheapest_price * 100
        if spread_pct > 0.05:  # Minimum 0.05% spread
            net_profit = (expensive_price - cheapest_price) * 1.0  # 1 unit
            fee = net_profit * 0.002  # 0.2% fee
            risk = int(min(100, max(0, 50 - spread_pct * 20 + random.random() * 20)))

            opportunities.append(ArbitrageOpportunity(
                source=cheapest_ex,
                destination=expensive_ex,
                symbol=symbol,
                buy_price=round(cheapest_price, 4),
                sell_price=round(expensive_price, 4),
                spread_pct=round(spread_pct, 4),
                net_profit_usd=round(net_profit - fee, 4),
                risk_score=risk,
                confidence=round(min(0.95, spread_pct / 0.5), 4),
                timestamp=datetime.now().isoformat(),
            ))

    opportunities.sort(key=lambda x: x.net_profit_usd, reverse=True)
    return opportunities

# ═══════════════════════════════════════════════════════════════════════════════
# GOVERNORS (from OmniCore.py)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class GovernorState:
    name: str
    stress: float = 0.0
    action: str = "IDLE"

    # Complexity: O(1)
    def run_cycle(self, raw_value: float, max_limit: float):
        self.stress = min(max(raw_value / max_limit, 0.0), 1.0)
        if self.stress > 0.8:
            self.action = "CRITICAL"
        elif self.stress > 0.5:
            self.action = "ELEVATED"
        else:
            self.action = "OPTIMAL"

bio_gov = GovernorState("BIO")
mkt_gov = GovernorState("MKT")
nrg_gov = GovernorState("NRG")

# Complexity: O(N) — linear iteration
def compute_entropy(bio: float, mkt: float, nrg: float) -> float:
    """Shannon entropy — same as Rust compute_global_entropy."""
    streams = [bio, mkt, nrg]
    total = sum(streams)
    if total <= 0:
        return 0.0
    entropy = 0.0
    for s in streams:
        if s > 0:
            p = s / total
            entropy -= p * math.log(p)
    max_entropy = math.log(3.0)
    normalized = entropy / max_entropy
    resonance = 0.8890
    return round(normalized * resonance, 4)

# ═══════════════════════════════════════════════════════════════════════════════
# MARKET SIMULATOR (live price feed)
# ═══════════════════════════════════════════════════════════════════════════════

class MarketSimulator:
    def __init__(self):
        self.prices = dict(BASE_PRICES)
        self.tick_count = 0

    # Complexity: O(1) — hash/map lookup
    def tick(self) -> Dict:
        """Generate one market tick with realistic random walk."""
        symbols = list(self.prices.keys())
        sym = random.choice(symbols)
        vol_map = {"BTC": 50, "ETH": 5, "SOL": 1, "XRP": 0.005, "ADA": 0.003,
                    "DOGE": 0.001, "MATIC": 0.005, "AVAX": 0.5}
        change = (random.random() - 0.5) * 2 * vol_map.get(sym, 1.0)
        self.prices[sym] += change
        self.tick_count += 1

        exchanges = ["binance", "kraken", "coinbase", "kucoin", "okx"]
        return {
            "symbol": f"{sym}/USD",
            "exchange": random.choice(exchanges),
            "price": round(self.prices[sym], 6),
            "volume": round(random.random() * 10 + 0.1, 4),
            "timestamp": time.time(),
            "tick_id": self.tick_count,
        }

market_sim = MarketSimulator()

# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI APPLICATION
# ═══════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="QAntum Prime v36.1 - Python Backend",
    version="36.1.0",
    description="Monte Carlo, Arbitrage Detection, Risk Assessment, Real-time Market Feed",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── WebSocket Manager ──

class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    # Complexity: O(1)
    async def connect(self, ws: WebSocket):
        # SAFETY: async operation — wrap in try/except for resilience
        await ws.accept()
        self.connections.append(ws)
        log(f"WS client connected. Total: {len(self.connections)}")

    # Complexity: O(1)
    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    # Complexity: O(N) — linear iteration
    async def broadcast(self, data: dict):
        msg = json.dumps(data)
        for ws in list(self.connections):
            try:
                await ws.send_text(msg)
            except:
                self.disconnect(ws)

ws_manager = ConnectionManager()

# ── Background: Market Feed + Governors ──

# Complexity: O(N)
async def market_feed_loop():
    """Push market ticks + governor state at ~10 Hz."""
    log("Market feed loop started (10 Hz)")
    while True:
        try:
            tick = market_sim.tick()

            # Governor cycles
            bio_gov.run_cycle(75 + random.random() * 15 + (90 if random.random() > 0.85 else 0), 180)
            mkt_gov.run_cycle(market_sim.prices.get("BTC", 50000), 150000)
            nrg_gov.run_cycle(random.random() * 500, 1000)

            entropy = compute_entropy(bio_gov.stress, mkt_gov.stress, nrg_gov.stress)

            payload = {
                "type": "market_tick",
                "tick": tick,
                "governors": {
                    "bio": {"stress": round(bio_gov.stress, 4), "action": bio_gov.action},
                    "market": {"stress": round(mkt_gov.stress, 4), "action": mkt_gov.action},
                    "energy": {"stress": round(nrg_gov.stress, 4), "action": nrg_gov.action},
                },
                "entropy": entropy,
                "timestamp": datetime.now().isoformat(),
            }

            # SAFETY: async operation — wrap in try/except for resilience
            await ws_manager.broadcast(payload)
        except Exception as e:
            log(f"Feed error: {e}")

        # SAFETY: async operation — wrap in try/except for resilience
        await asyncio.sleep(0.1)  # 10 Hz

@app.on_event("startup")
# Complexity: O(1)
async def startup():
    log("FastAPI startup — launching market feed")
    asyncio.create_task(market_feed_loop())

# ── Routes ──

@app.get("/health")
# Complexity: O(1)
async def health():
    return {"status": "ok", "engine": "QAntum Python v36.1", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
# Complexity: O(1)
async def system_status():
    return {
        "engine": "QAntum Prime v36.1",
        "governors": {
            "bio": {"stress": bio_gov.stress, "action": bio_gov.action},
            "market": {"stress": mkt_gov.stress, "action": mkt_gov.action},
            "energy": {"stress": nrg_gov.stress, "action": nrg_gov.action},
        },
        "entropy": compute_entropy(bio_gov.stress, mkt_gov.stress, nrg_gov.stress),
        "prices": market_sim.prices,
        "ticks_generated": market_sim.tick_count,
        "ws_clients": len(ws_manager.connections),
    }

@app.get("/api/predict/{symbol}")
# Complexity: O(1)
async def predict(
    symbol: str,
    price: float = Query(0.0, description="Current price (0 = use default)"),
    simulations: int = Query(1000, ge=100, le=50000),
    horizon: int = Query(30, ge=1, le=3600),
):
    sym = symbol.upper()
    start = time.perf_counter()
    result = predict_price(sym, price, simulations, horizon)
    result.elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    return asdict(result)

@app.get("/api/arbitrage")
# Complexity: O(N) — linear iteration
async def arbitrage():
    start = time.perf_counter()
    opps = scan_arbitrage()
    elapsed = round((time.perf_counter() - start) * 1000, 2)
    return {
        "opportunities": [asdict(o) for o in opps],
        "count": len(opps),
        "elapsed_ms": elapsed,
    }

@app.get("/api/risk")
# Complexity: O(1)
async def risk_assessment(
    symbol: str = Query("BTC"),
    window: int = Query(100, ge=10, le=10000),
):
    """Generate synthetic returns and compute risk metrics."""
    sym = symbol.upper()
    vol = VOLATILITIES.get(sym, 1.0)
    rng = Xorshift64(int(time.time()) ^ 0xBEEF)

    returns = []
    for _ in range(window):
        r = rng.next_normal() * vol / math.sqrt(365 * 24 * 60)
        returns.append(r)

    mean_r = sum(returns) / len(returns)
    var_r = sum((r - mean_r) ** 2 for r in returns) / len(returns)
    std_r = math.sqrt(var_r)
    downside_var = sum(r ** 2 for r in returns if r < 0) / len(returns)
    downside_std = math.sqrt(downside_var)

    sharpe = mean_r / std_r if std_r > 0 else 0
    sortino = mean_r / downside_std if downside_std > 0 else 0
    var_95 = -(mean_r - 1.645 * std_r)

    # Max drawdown
    peak = 1.0
    cumulative = 1.0
    max_dd = 0.0
    for r in returns:
        cumulative *= (1 + r)
        if cumulative > peak:
            peak = cumulative
        dd = (peak - cumulative) / peak
        if dd > max_dd:
            max_dd = dd

    overall = min(100, (vol / 2) * 40 + max_dd * 3000 + max(0, var_95) * 3000)
    rec = "REDUCE_EXPOSURE" if overall > 70 else ("HEDGE_POSITION" if overall > 40 else "PROCEED")

    return {
        "symbol": sym,
        "overall_risk": round(overall, 2),
        "value_at_risk_95": round(var_95, 6),
        "max_drawdown": round(max_dd, 6),
        "sharpe_ratio": round(sharpe, 4),
        "sortino_ratio": round(sortino, 4),
        "volatility_annual": vol,
        "recommendation": rec,
        "window_size": window,
    }

@app.websocket("/ws/control")
# Complexity: O(N*M) — nested iteration detected
async def ws_control(ws: WebSocket):
    # SAFETY: async operation — wrap in try/except for resilience
    await ws.accept()
    log("Control WebSocket connected — dynamic threshold engine active")
    try:
        while True:
            data = await ws.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "price_update":
                    symbol = msg.get("symbol")
                    price = msg.get("price")
                    if symbol and price and price > 0:
                        # Calculate dynamic bands based on volatility
                        sym_key = symbol.split("/")[0]
                        vol = VOLATILITIES.get(sym_key, 1.0)
                        # Tighter spread for low-vol assets, wider for high-vol
                        # BTC (vol=0.65): ~0.133% | ETH (vol=0.80): ~0.140%
                        # SOL (vol=1.20): ~0.160% | XRP (vol=0.90): ~0.145%
                        spread = 0.001 + (vol * 0.0005)
                        
                        buy_price = price * (1.0 - spread)
                        sell_price = price * (1.0 + spread)
                        
                        response = {
                            "cmd": "UPDATE_THRESHOLDS",
                            "symbol": symbol,
                            "buy": round(buy_price, 4),
                            "sell": round(sell_price, 4)
                        }
                        # SAFETY: async operation — wrap in try/except for resilience
                        await ws.send_text(json.dumps(response))
                        log(f"[THRESH] {symbol}: BUY < ${buy_price:.2f} | SELL > ${sell_price:.2f} (spread={spread*100:.3f}%)")
            except json.JSONDecodeError:
                pass
            except Exception as e:
                log(f"Control WS processing error: {e}")
    except WebSocketDisconnect:
        log("Control WebSocket disconnected")
    except Exception as e:
        log(f"Control WS error: {e}")

@app.websocket("/ws/market-feed")
# Complexity: O(N)
async def ws_market_feed(ws: WebSocket):
    # SAFETY: async operation — wrap in try/except for resilience
    await ws_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)
    except Exception as e:
        log(f"WS error: {e}")
        ws_manager.disconnect(ws)

# ═══════════════════════════════════════════════════════════════════════════════
# STANDALONE RUN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8891))
    log(f"Starting QAntum Python Backend on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

import asyncio
import json
import websockets
import hashlib
import random
import requests
import secrets
import os
from abc import ABC, abstractmethod
from datetime import datetime
from Ledger import ImmutableLedger
from NexusLogic import calculate_global_entropy_rust
import subprocess

# ==========================================
# 0. PROJECT AUDITOR (MANIFESTING TRUTH)
# ==========================================

class ProjectAuditor:
    """
    O(N) Complexity initially, O(1) from cache.
    Calculates reality-drifting project metrics.
    """
    def __init__(self, root_path: str):
        self.root = root_path
        self.total_files = 0
        self.total_loc = 0
        self.last_run = 0
        self.cache_duration = 300 # 5 minutes

    def audit(self):
        now = datetime.now().timestamp()
        if now - self.last_run < self.cache_duration and self.total_files > 0:
            return self.total_files, self.total_loc

        f_count = 0
        loc_count = 0
        
        # Fast walk - avoiding node_modules and .git
        ignore_dirs = {'.git', 'node_modules', 'dist', 'target', '.next'}
        
        for root, dirs, files in os.walk(self.root):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            f_count += len(files)
            for f in files:
                if f.endswith(('.ts', '.tsx', '.rs', '.py', '.html', '.css', '.js', '.json')):
                    try:
                        # Heavy operation: Read lines (sample first 100 for perf if needed, but we want TRUTH)
                        with open(os.path.join(root, f), 'rb') as fp:
                            loc_count += sum(1 for line in fp)
                    except:
                        pass
        
        self.total_files = f_count
        self.total_loc = loc_count
        self.last_run = now
        return f_count, loc_count

class ProjectMatrix:
    """
    O(1) health checks for the master dashboard.
    """
    def __init__(self):
        self.services = {
            "Helios Command": "https://framework-frontend-1000690699464.us-central1.run.app",
            "Logos Mind": "https://aeterna-logos-1000690699464.europe-west1.run.app",
            "Wealth Bridge": "https://framework-backend-1000690699464.us-central1.run.app/docs",
            "SEO Auditor": "https://framework-frontend-1000690699464.us-central1.run.app/seo-audit"
        }
        self.status_cache = {}
        self.last_check = 0

    def check_health(self):
        now = datetime.now().timestamp()
        if now - self.last_check < 60 and self.status_cache: # Check every minute
            return self.status_cache

        results = {}
        for name, url in self.services.items():
            try:
                # Fast HEAD request to verify presence with 1s timeout
                resp = requests.head(url, timeout=1.0)
                results[name] = "online" if resp.status_code < 400 else "degraded"
            except:
                results[name] = "offline"
        
        self.status_cache = results
        self.last_check = now
        return results

# ==========================================
# 1. CORE LOGIC (Същата като преди)
# ==========================================

class OmniGovernor(ABC):
    def __init__(self, system_name: str, safety_threshold: float = 0.8):
        self.system_name = system_name
        self.threshold = safety_threshold
        self.current_stress = 0.0
        self.last_action = "IDLE"  # За да пращаме статуса към UI

    def normalize_stress(self, current_val: float, max_val: float) -> float:
        return min(max(current_val / max_val, 0.0), 1.0)

    @abstractmethod
    def read_sensor(self) -> float: pass
    @abstractmethod
    def execute_countermeasure(self, stress_level: float, override: bool = False): pass
    @abstractmethod
    def get_max_limit(self) -> float: pass

    def run_cycle(self):
        try:
            raw_value = self.read_sensor()
            self.current_stress = self.normalize_stress(raw_value, self.get_max_limit())
            # Reset action state unless triggered below
            self.last_action = "OPTIMAL"
        except Exception as e:
            print(f"[{self.system_name}] SENSOR ERROR: {e}")
            self.current_stress = 0.0
            self.last_action = "ERROR"

class EnergyGridGovernor(OmniGovernor):
    def get_max_limit(self) -> float: return 1000.0
    def read_sensor(self) -> float:
        try:
            # Fast call – real API structure
            return float(requests.get("https://api.open-meteo.com/v1/forecast?latitude=42.69&longitude=23.32&current=shortwave_radiation", timeout=0.5).json()['current']['shortwave_radiation'])
        except:
            return 0.0
    def execute_countermeasure(self, stress_level: float, override: bool = False):
        self.last_action = "AGGRESSIVE SELL" if override else "DIVERT TO BATTERY"

class MarketRiskGovernor(OmniGovernor):
    def get_max_limit(self) -> float: return 150000.0
    def read_sensor(self) -> float:
        try:
            return float(requests.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", timeout=0.5).json()['price'])
        except:
            return 95000.0
    def execute_countermeasure(self, stress_level: float, override: bool = False):
        self.last_action = "EMERGENCY LIQUIDATION" if override else "HEDGING"

class BioHealthGovernor(OmniGovernor):
    def get_max_limit(self) -> float: return 180.0
    def read_sensor(self) -> float:
        # Simulation with occasional spike
        base = 75
        spike = 90 if random.random() > 0.85 else 0
        return base + (random.random() * 15) + spike
    def execute_countermeasure(self, stress_level: float, override: bool = False):
        self.last_action = "OPTIMIZING COMFORT" if override else "ADRENALINE BLOCK"

# ==========================================
# 2. ORCHESTRATOR + WEBSOCKET SERVER
# ==========================================

bio = BioHealthGovernor("BIO")
mkt = MarketRiskGovernor("MKT")
nrg = EnergyGridGovernor("NRG")
auditor = ProjectAuditor(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
matrix = ProjectMatrix()
ledger = ImmutableLedger()  # Initialize immutable ledger

async def handler(websocket):
    print(f"Client Connected: {websocket.remote_address}")
    cycle_count = 0
    try:
        while True:
            # 1. Update Sensors
            bio.run_cycle()
            mkt.run_cycle()
            nrg.run_cycle()
            
            cycle_count += 1
            is_hallucination = False

            # --- CHAOS INJECTION (THE GLITCH) ---
            # 10% chance to generate a lie
            if random.random() < 0.10: 
                is_hallucination = True
                print(f"😈 INJECTING CHAOS/HALLUCINATION...")
                
                # Fake data (Violating Physics & Schema)
                payload = {
                    "timestamp": "INVALID_TIME", # Bad Format
                    "orchestrator": "SYSTEM COMPROMISED",
                    "bio": {"stress": 500.0, "action": "PANIC"}, # Impossible Stress (>1.0)
                    "market": {"stress": -10.0, "action": "None"}, # Impossible Negative
                    "energy": {"stress": 0.0} # MISSING FIELD "action" (Schema Violation)
                }
            else:
                # NORMAL TRUTH
                orchestrator_msg = "SYSTEM SYNCED"
                if bio.current_stress > 0.6:
                    mkt.execute_countermeasure(mkt.current_stress, override=True)
                    orchestrator_msg = "⚠️ HOST STRESS! REDUCING FINANCIAL RISK"
                elif mkt.current_stress > 0.9:
                    nrg.execute_countermeasure(nrg.current_stress, override=True)
                    orchestrator_msg = "📉 MARKET CRASH! ACTIVATING ENERGY ARBITRAGE"
                elif nrg.current_stress < 0.1 and bio.current_stress > 0.3:
                    bio.execute_countermeasure(bio.current_stress, override=True)
                    orchestrator_msg = "🔋 FREE ENERGY. BOOSTING COMFORT"

                # Record immutable ledger entry
                ledger.add_entry(bio.current_stress, mkt.current_stress, nrg.current_stress)

                # 2. THE GOD CALCULATION (Rust)
                sovereign_index = calculate_global_entropy_rust(
                    [{'hr': 75.0, 'oxy': 0.98}],  # Mock accumulators
                    [{'price': mkt.current_stress * 100000, 'volume': 1000.0}], 
                    {'battery_level': nrg.current_stress * 100}
                )
                
                # 3. PROJECT TELEMETRY (RUST CLOCKSPEED)
                try:
                    # Calling the standalone high-performance Rust reporter
                    rust_output = subprocess.check_output(
                        ["cargo", "run", "--quiet"],
                        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "telemetry")),
                        stderr=subprocess.DEVNULL
                    )
                    rust_stats = json.loads(rust_output.decode().strip())
                except Exception as e:
                    print(f"⚠️ RUST_TELEMETRY_FAILURE: {e}")
                    rust_stats = {"cpu_usage": 0.0, "ram_used_gb": 0.0, "entropy": 0.0}

                # 4. PHYSICAL REALITY (FILES)
                f_count, loc_count = auditor.audit()
                
                # 5. PROJECT MATRIX (HEALTH)
                project_status = matrix.check_health()

                payload = {
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "entropy": rust_stats.get("entropy", sovereign_index),
                    "orchestrator": orchestrator_msg,
                    "bio": {"stress": bio.current_stress, "action": bio.last_action},
                    "market": {"stress": mkt.current_stress, "action": mkt.last_action},
                    "energy": {"stress": nrg.current_stress, "action": nrg.last_action},
                    "project": {"files": f_count, "loc": loc_count},
                    "projects": project_status,
                    "hardware": {
                        "cpu": rust_stats.get("cpu_usage", 0.0),
                        "ram": rust_stats.get("ram_used_gb", 0.0),
                        "resonance": 0.8890 # Manifested
                    }
                }

            # 4. Send to Browser
            await websocket.send(json.dumps(payload))
            
            if is_hallucination:
                print("   >>> CHAOS SENT. WAITING FOR VERITAS TO BLOCK IT.")

            await asyncio.sleep(1)  # 1 update per second
    except websockets.exceptions.ConnectionClosed:
        print("Client Disconnected")

async def main():
    # Cloud Run injects PORT environment variable
    port = int(os.environ.get("PORT", 8765))
    print(f">>> OMNI-CORE WEBSOCKET SERVER STARTED ON 0.0.0.0:{port} <<<")
    # Must bind to 0.0.0.0 for Cloud Run
    async with websockets.serve(handler, "0.0.0.0", port):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())

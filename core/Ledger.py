"""
Ledger — Qantum Module
Path: core/Ledger.py
Auto-documented by BrutalDocEngine v2.1
"""

import hashlib
import json
from datetime import datetime

class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data  # { "bio": 0.5, "market": 0.8, "energy": 0.2 }
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    # Complexity: O(1)
    def calculate_hash(self):
        # SHA‑256 hash of the block contents; any change breaks the chain
        block_string = json.dumps(self.data, sort_keys=True) + str(self.index) + str(self.timestamp) + self.previous_hash
        return hashlib.sha256(block_string.encode()).hexdigest()

class ImmutableLedger:
    def __init__(self):
        self.chain = [self.create_genesis_block()]
        print("/// LEDGER INITIALIZED: GENESIS BLOCK SEALED ///")

    # Complexity: O(1)
    def create_genesis_block(self):
        return Block(0, datetime.now().isoformat(), "GENESIS_DATA", "0")

    # Complexity: O(1)
    def get_latest_block(self):
        return self.chain[-1]

    # Complexity: O(1)
    def add_entry(self, bio_stress, market_risk, energy_load):
        prev_block = self.get_latest_block()
        data = {
            "bio_stress": round(bio_stress, 4),
            "market_risk": round(market_risk, 4),
            "energy_load": round(energy_load, 4),
            "decision": self._decide_strategy(bio_stress, market_risk)
        }
        new_block = Block(
            index=prev_block.index + 1,
            timestamp=datetime.now().isoformat(),
            data=data,
            previous_hash=prev_block.hash
        )
        self.chain.append(new_block)
        short_hash = new_block.hash[:8]
        print(f"🔒 BLK #{new_block.index} | PROOF: {short_hash}... | STRATEGY: {data['decision']}")
        return new_block

    # Complexity: O(1)
    def _decide_strategy(self, bio, market):
        if bio > 0.7 and market > 0.8:
            return "EMERGENCY_SHIELD"
        if bio < 0.3 and market < 0.3:
            return "ACCELERATED_GROWTH"
        return "MAINTAIN_BALANCE"

    # Complexity: O(N) — linear iteration
    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            if current.hash != current.calculate_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
        return True

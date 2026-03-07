# ═══════════════════════════════════════════════════════════════════════════════
# 💹 CYBERFORTRESS TRADING - Mojo AI Engine
# ═══════════════════════════════════════════════════════════════════════════════
#
# Triumvirate Consensus: REAPER + GUARDIAN + ORACLE
#
# @author Dimitar Prodromov / QAntum Empire

from triumvirate.reaper import Reaper
from triumvirate.guardian import Guardian
from triumvirate.oracle import Oracle
from patterns.detector import PatternDetector

struct Triumvirate:
    var reaper: Reaper
    var guardian: Guardian
    var oracle: Oracle
    var consensus_threshold: Float64
    
    fn __init__(inout self):
        self.reaper = Reaper()
        self.guardian = Guardian()
        self.oracle = Oracle()
        self.consensus_threshold = 0.7
    
    fn vote(self, market_data: MarketData) -> ConsensusResult:
        """All three agents vote on trading action."""
        let reaper_vote = self.reaper.analyze(market_data)
        let guardian_vote = self.guardian.analyze(market_data)
        let oracle_vote = self.oracle.analyze(market_data)
        
        # Calculate consensus
        let total_confidence = (
            reaper_vote.confidence + 
            guardian_vote.confidence + 
            oracle_vote.confidence
        ) / 3.0
        
        # Determine action based on majority
        var buy_votes = 0
        var sell_votes = 0
        
        if reaper_vote.action == "BUY": buy_votes += 1
        elif reaper_vote.action == "SELL": sell_votes += 1
        
        if guardian_vote.action == "BUY": buy_votes += 1
        elif guardian_vote.action == "SELL": sell_votes += 1
        
        if oracle_vote.action == "BUY": buy_votes += 1
        elif oracle_vote.action == "SELL": sell_votes += 1
        
        var consensus_action: String
        if buy_votes >= 2 and total_confidence >= self.consensus_threshold:
            consensus_action = "BUY"
        elif sell_votes >= 2 and total_confidence >= self.consensus_threshold:
            consensus_action = "SELL"
        else:
            consensus_action = "HOLD"
        
        return ConsensusResult(
            action=consensus_action,
            confidence=total_confidence,
            reaper_vote=reaper_vote,
            guardian_vote=guardian_vote,
            oracle_vote=oracle_vote
        )

struct MarketData:
    var symbol: String
    var price: Float64
    var volume: Float64
    var obi: Float64
    var momentum: Float64
    var volatility: Float64
    
    fn __init__(inout self, symbol: String, price: Float64, volume: Float64,
                obi: Float64, momentum: Float64, volatility: Float64):
        self.symbol = symbol
        self.price = price
        self.volume = volume
        self.obi = obi
        self.momentum = momentum
        self.volatility = volatility

struct AgentVote:
    var action: String
    var confidence: Float64
    var reasoning: String
    
    fn __init__(inout self, action: String, confidence: Float64, reasoning: String):
        self.action = action
        self.confidence = confidence
        self.reasoning = reasoning

struct ConsensusResult:
    var action: String
    var confidence: Float64
    var reaper_vote: AgentVote
    var guardian_vote: AgentVote
    var oracle_vote: AgentVote
    
    fn __init__(inout self, action: String, confidence: Float64,
                reaper_vote: AgentVote, guardian_vote: AgentVote, oracle_vote: AgentVote):
        self.action = action
        self.confidence = confidence
        self.reaper_vote = reaper_vote
        self.guardian_vote = guardian_vote
        self.oracle_vote = oracle_vote

fn main():
    print("╔════════════════════════════════════════════════════════════╗")
    print("║   💹 CYBERFORTRESS TRADING - Mojo AI Engine                ║")
    print("║   Triumvirate Consensus System                             ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    var triumvirate = Triumvirate()
    var detector = PatternDetector()
    
    # Simulate market data
    let market = MarketData(
        symbol="BTCUSDT",
        price=45000.0,
        volume=1000000.0,
        obi=0.35,
        momentum=0.2,
        volatility=0.15
    )
    
    # Get consensus
    let result = triumvirate.vote(market)
    
    print("\n🎯 TRIUMVIRATE CONSENSUS")
    print("═══════════════════════════════════════")
    print("Action:", result.action)
    print("Confidence:", result.confidence)
    print("")
    print("🔴 REAPER:", result.reaper_vote.action, "-", result.reaper_vote.reasoning)
    print("🟢 GUARDIAN:", result.guardian_vote.action, "-", result.guardian_vote.reasoning)
    print("🔵 ORACLE:", result.oracle_vote.action, "-", result.oracle_vote.reasoning)
    print("═══════════════════════════════════════")

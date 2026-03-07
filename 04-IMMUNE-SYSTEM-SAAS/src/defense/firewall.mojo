# ═══════════════════════════════════════════════════════════════════════════════
# 🔥 Dynamic Firewall - Autonomous Defense Protocol
# ═══════════════════════════════════════════════════════════════════════════════

from collections import List, Dict
from time import now

struct FirewallRule:
    var id: String
    var action: String  # ALLOW, DENY, QUARANTINE
    var source: String
    var destination: String
    var port: Int
    var protocol: String
    var created_at: Int64
    var expires_at: Int64
    var reason: String
    
    fn __init__(inout self, action: String, source: String, port: Int, reason: String):
        self.id = String(now())  # Simple ID
        self.action = action
        self.source = source
        self.destination = "*"
        self.port = port
        self.protocol = "TCP"
        self.created_at = now()
        self.expires_at = 0  # 0 = never expires
        self.reason = reason

struct ThreatEvent:
    var source_ip: String
    var threat_type: String
    var severity: Float64
    var timestamp: Int64
    var blocked: Bool
    
    fn __init__(inout self, source_ip: String, threat_type: String, severity: Float64):
        self.source_ip = source_ip
        self.threat_type = threat_type
        self.severity = severity
        self.timestamp = now()
        self.blocked = False

struct DynamicFirewall:
    var rules: List[FirewallRule]
    var threats: List[ThreatEvent]
    var auto_block: Bool
    var block_threshold: Float64
    var quarantine_list: List[String]
    
    fn __init__(inout self):
        self.rules = List[FirewallRule]()
        self.threats = List[ThreatEvent]()
        self.auto_block = True
        self.block_threshold = 70.0
        self.quarantine_list = List[String]()
        self._init_default_rules()
    
    fn _init_default_rules(inout self):
        """Initialize default security rules."""
        # Block common attack ports
        self.add_rule("DENY", "*", 23, "Telnet - insecure protocol")
        self.add_rule("DENY", "*", 135, "RPC - common attack vector")
        self.add_rule("DENY", "*", 445, "SMB - ransomware vector")
        
        # Allow standard services
        self.add_rule("ALLOW", "*", 443, "HTTPS")
        self.add_rule("ALLOW", "*", 80, "HTTP")
    
    fn add_rule(inout self, action: String, source: String, port: Int, reason: String):
        """Add a firewall rule."""
        let rule = FirewallRule(action, source, port, reason)
        self.rules.append(rule)
        print("🔥 [FIREWALL] Rule added:", action, "port", port, "-", reason)
    
    fn remove_rule(inout self, rule_id: String):
        """Remove a firewall rule by ID."""
        var new_rules = List[FirewallRule]()
        for i in range(len(self.rules)):
            if self.rules[i].id != rule_id:
                new_rules.append(self.rules[i])
        self.rules = new_rules
    
    fn check_packet(self, source_ip: String, port: Int) -> Bool:
        """Check if packet should be allowed."""
        # Check quarantine list first
        for i in range(len(self.quarantine_list)):
            if self.quarantine_list[i] == source_ip:
                return False
        
        # Check rules
        for i in range(len(self.rules)):
            let rule = self.rules[i]
            if rule.port == port:
                if rule.source == "*" or rule.source == source_ip:
                    return rule.action == "ALLOW"
        
        # Default: allow
        return True
    
    fn detect_threat(inout self, source_ip: String, threat_type: String, severity: Float64) -> Bool:
        """Detect and respond to threat."""
        var threat = ThreatEvent(source_ip, threat_type, severity)
        
        print("🚨 [FIREWALL] Threat detected from", source_ip, "-", threat_type)
        
        if self.auto_block and severity >= self.block_threshold:
            # Auto-block high severity threats
            self.quarantine(source_ip)
            threat.blocked = True
            print("🔒 [FIREWALL] Auto-blocked:", source_ip)
        
        self.threats.append(threat)
        return threat.blocked
    
    fn quarantine(inout self, ip: String):
        """Add IP to quarantine list."""
        # Check if already quarantined
        for i in range(len(self.quarantine_list)):
            if self.quarantine_list[i] == ip:
                return
        
        self.quarantine_list.append(ip)
        self.add_rule("DENY", ip, 0, "Quarantined - threat detected")
        print("🔐 [FIREWALL] IP quarantined:", ip)
    
    fn release_from_quarantine(inout self, ip: String):
        """Remove IP from quarantine."""
        var new_list = List[String]()
        for i in range(len(self.quarantine_list)):
            if self.quarantine_list[i] != ip:
                new_list.append(self.quarantine_list[i])
        self.quarantine_list = new_list
        print("🔓 [FIREWALL] IP released:", ip)
    
    fn get_threat_count(self) -> Int:
        """Get total threat count."""
        return len(self.threats)
    
    fn get_blocked_count(self) -> Int:
        """Get count of blocked threats."""
        var count = 0
        for i in range(len(self.threats)):
            if self.threats[i].blocked:
                count += 1
        return count
    
    fn get_status(self) -> String:
        """Get firewall status."""
        var status = "🔥 DYNAMIC FIREWALL STATUS\n"
        status += "═══════════════════════════════════════\n"
        status += "Active Rules: " + String(len(self.rules)) + "\n"
        status += "Threats Detected: " + String(len(self.threats)) + "\n"
        status += "IPs Quarantined: " + String(len(self.quarantine_list)) + "\n"
        status += "Auto-Block: " + String(self.auto_block) + "\n"
        status += "═══════════════════════════════════════\n"
        return status

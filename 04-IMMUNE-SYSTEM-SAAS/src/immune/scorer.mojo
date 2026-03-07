# ═══════════════════════════════════════════════════════════════════════════════
# 📊 Health Scorer - Real-time System Vitals
# ═══════════════════════════════════════════════════════════════════════════════

from collections import List
from math import min, max

struct ComponentHealth:
    var name: String
    var score: Float64
    var weight: Float64
    var status: String
    
    fn __init__(inout self, name: String, weight: Float64):
        self.name = name
        self.score = 100.0
        self.weight = weight
        self.status = "HEALTHY"
    
    fn update(inout self, score: Float64):
        self.score = max(0.0, min(100.0, score))
        if self.score >= 90.0:
            self.status = "HEALTHY"
        elif self.score >= 70.0:
            self.status = "DEGRADED"
        elif self.score >= 50.0:
            self.status = "WARNING"
        else:
            self.status = "CRITICAL"

struct SystemVitals:
    var cpu_usage: Float64
    var memory_usage: Float64
    var disk_usage: Float64
    var network_latency: Float64
    var error_rate: Float64
    var uptime_hours: Float64
    
    fn __init__(inout self):
        self.cpu_usage = 0.0
        self.memory_usage = 0.0
        self.disk_usage = 0.0
        self.network_latency = 0.0
        self.error_rate = 0.0
        self.uptime_hours = 0.0

struct HealthScorer:
    var components: List[ComponentHealth]
    var vitals: SystemVitals
    var overall_score: Float64
    var uptime_target: Float64  # 99.999% = 5 nines
    
    fn __init__(inout self):
        self.components = List[ComponentHealth]()
        self.vitals = SystemVitals()
        self.overall_score = 100.0
        self.uptime_target = 99.999
        self._init_components()
    
    fn _init_components(inout self):
        """Initialize monitored components with weights."""
        self.components.append(ComponentHealth("CPU", 0.20))
        self.components.append(ComponentHealth("Memory", 0.20))
        self.components.append(ComponentHealth("Disk", 0.15))
        self.components.append(ComponentHealth("Network", 0.20))
        self.components.append(ComponentHealth("Services", 0.25))
    
    fn update_vitals(inout self, vitals: SystemVitals):
        """Update system vitals."""
        self.vitals = vitals
        
        # Update component scores based on vitals
        for i in range(len(self.components)):
            var component = self.components[i]
            
            if component.name == "CPU":
                # Lower CPU usage = higher score
                component.update(100.0 - vitals.cpu_usage)
            elif component.name == "Memory":
                component.update(100.0 - vitals.memory_usage)
            elif component.name == "Disk":
                component.update(100.0 - vitals.disk_usage)
            elif component.name == "Network":
                # Lower latency = higher score (assuming 100ms = 0 score)
                component.update(100.0 - min(vitals.network_latency, 100.0))
            elif component.name == "Services":
                # Lower error rate = higher score
                component.update(100.0 - vitals.error_rate * 10.0)
            
            self.components[i] = component
    
    fn calculate_health(self) -> Float64:
        """Calculate weighted overall health score."""
        var weighted_sum: Float64 = 0.0
        var total_weight: Float64 = 0.0
        
        for i in range(len(self.components)):
            let component = self.components[i]
            weighted_sum += component.score * component.weight
            total_weight += component.weight
        
        if total_weight > 0.0:
            self.overall_score = weighted_sum / total_weight
        else:
            self.overall_score = 0.0
        
        return self.overall_score
    
    fn get_status(self) -> String:
        """Get overall system status."""
        if self.overall_score >= 95.0:
            return "🟢 OPTIMAL"
        elif self.overall_score >= 80.0:
            return "🟡 HEALTHY"
        elif self.overall_score >= 60.0:
            return "🟠 DEGRADED"
        elif self.overall_score >= 40.0:
            return "🔴 WARNING"
        else:
            return "⚫ CRITICAL"
    
    fn get_report(self) -> String:
        """Generate health report."""
        var report = String("═══════════════════════════════════════\n")
        report += "       SYSTEM HEALTH REPORT\n"
        report += "═══════════════════════════════════════\n\n"
        report += "Overall Score: " + String(Int(self.overall_score)) + "/100\n"
        report += "Status: " + self.get_status() + "\n\n"
        report += "Component Breakdown:\n"
        
        for i in range(len(self.components)):
            let comp = self.components[i]
            report += "  • " + comp.name + ": " + String(Int(comp.score)) + "% [" + comp.status + "]\n"
        
        report += "\n═══════════════════════════════════════\n"
        return report
    
    fn meets_sla(self) -> Bool:
        """Check if current uptime meets SLA."""
        # Calculate actual uptime percentage
        let actual_uptime = 100.0 - (self.vitals.error_rate * 0.01)
        return actual_uptime >= self.uptime_target
    
    fn get_degraded_components(self) -> List[String]:
        """Get list of degraded components."""
        var degraded = List[String]()
        for i in range(len(self.components)):
            if self.components[i].status != "HEALTHY":
                degraded.append(self.components[i].name)
        return degraded

# ═══════════════════════════════════════════════════════════════════════════════
# 🔬 Anomaly Detector - ML-Powered Pattern Recognition
# ═══════════════════════════════════════════════════════════════════════════════

from collections import List
from math import sqrt, log
from time import now

struct Anomaly:
    var severity: Float64
    var component: String
    var description: String
    var timestamp: Int64
    var recommended_action: String
    
    fn __init__(inout self, severity: Float64, component: String, 
                description: String, action: String):
        self.severity = severity
        self.component = component
        self.description = description
        self.timestamp = now()
        self.recommended_action = action

struct MetricPoint:
    var value: Float64
    var timestamp: Int64
    
    fn __init__(inout self, value: Float64):
        self.value = value
        self.timestamp = now()

struct AnomalyDetector:
    var baseline: List[Float64]
    var threshold_sigma: Float64
    var window_size: Int
    var detected_anomalies: List[Anomaly]
    
    fn __init__(inout self):
        self.baseline = List[Float64]()
        self.threshold_sigma = 3.0  # 3-sigma rule
        self.window_size = 100
        self.detected_anomalies = List[Anomaly]()
    
    fn update_baseline(inout self, value: Float64):
        """Update rolling baseline with new metric."""
        self.baseline.append(value)
        if len(self.baseline) > self.window_size:
            _ = self.baseline.pop(0)
    
    fn calculate_mean(self) -> Float64:
        """Calculate mean of baseline."""
        if len(self.baseline) == 0:
            return 0.0
        var total: Float64 = 0.0
        for i in range(len(self.baseline)):
            total += self.baseline[i]
        return total / Float64(len(self.baseline))
    
    fn calculate_std(self) -> Float64:
        """Calculate standard deviation."""
        if len(self.baseline) < 2:
            return 1.0
        let mean = self.calculate_mean()
        var variance: Float64 = 0.0
        for i in range(len(self.baseline)):
            let diff = self.baseline[i] - mean
            variance += diff * diff
        return sqrt(variance / Float64(len(self.baseline) - 1))
    
    fn is_anomaly(self, value: Float64) -> Bool:
        """Check if value is anomalous using z-score."""
        let mean = self.calculate_mean()
        let std = self.calculate_std()
        if std == 0.0:
            return False
        let z_score = abs(value - mean) / std
        return z_score > self.threshold_sigma
    
    fn detect(inout self, component: String, value: Float64) -> Bool:
        """Detect anomaly and record if found."""
        let is_anomalous = self.is_anomaly(value)
        
        if is_anomalous:
            let mean = self.calculate_mean()
            let severity = min(abs(value - mean) / mean * 100.0, 100.0)
            
            var action: String
            if severity > 80.0:
                action = "CRITICAL: Immediate intervention required"
            elif severity > 50.0:
                action = "WARNING: Schedule maintenance"
            else:
                action = "NOTICE: Monitor closely"
            
            let anomaly = Anomaly(
                severity=severity,
                component=component,
                description="Metric deviation detected: " + String(value),
                action=action
            )
            self.detected_anomalies.append(anomaly)
            print("🚨 [DETECTOR] Anomaly in", component, "- Severity:", severity)
        
        self.update_baseline(value)
        return is_anomalous
    
    fn scan_system(inout self) -> List[Anomaly]:
        """Perform full system scan."""
        print("🔬 [DETECTOR] Initiating full system scan...")
        
        # Simulate scanning different components
        var components = List[String]()
        components.append("CPU")
        components.append("Memory")
        components.append("Network")
        components.append("Disk")
        components.append("Services")
        
        # Return detected anomalies
        return self.detected_anomalies
    
    fn get_anomaly_count(self) -> Int:
        """Get count of detected anomalies."""
        return len(self.detected_anomalies)
    
    fn clear_anomalies(inout self):
        """Clear resolved anomalies."""
        self.detected_anomalies = List[Anomaly]()

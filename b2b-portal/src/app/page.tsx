"use client";

import { useState } from "react";
import { ArrowRight, Shield, Zap, Search, ChevronRight, Download } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsScanning(true);
    setScanResult(null);
    // Simulate scan delay (Oracle Mock)
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(`Analysis complete. 3 critical vulnerabilities detected on ${url}. Upgrade to The Sovereign to secure your infrastructure.`);
    }, 2500);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-qantum-cyan)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-qantum-purple)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow delay-1000"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-12 mb-20 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-[var(--color-qantum-cyan)] font-medium mb-8">
          <Zap size={16} /> AETERNA v2.0 is Live
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Eliminate <span className="text-gradient">Digital Entropy.</span><br />
          Secure Your Assets.
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
          The ultimate B2B wealth bridge and security substrate. Leverage the power of QAntum Singularity to protect your infrastructure and scale your revenue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-4 bg-[var(--color-qantum-cyan)] hover:bg-[#00d0e0] text-black font-bold rounded-lg transition-transform transform hover:scale-105 flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            Get Q-Enterprise <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 glass-panel text-white hover:bg-white/5 font-semibold rounded-lg transition-colors flex items-center gap-2 group">
            <Download size={20} className="group-hover:text-[var(--color-qantum-cyan)] transition-colors" /> Download AETERNA
          </button>
        </div>
      </div>

      {/* The Value Bomb (Lead Magnet) */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mb-32">
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-qantum-cyan)] to-[var(--color-qantum-purple)] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Search className="text-[var(--color-qantum-cyan)]" /> The Oracle Vulnerability Scanner (Beta)
          </h2>
          <p className="text-gray-400 mb-6">Enter a domain below to instantly detect entropy leaks and unpatched vulnerabilities.</p>

          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="e.g. yourcompany.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-qantum-cyan)] focus:ring-1 focus:ring-[var(--color-qantum-cyan)] transition-colors"
              required
            />
            <button
              type="submit"
              disabled={isScanning}
              className={`px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-semibold transition-all relative overflow-hidden ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isScanning ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Scanning...</span>
              ) : (
                "Initiate Scan"
              )}
            </button>
          </form>

          {scanResult && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 animate-fade-in flex items-start gap-3">
              <Shield className="text-red-400 shrink-0 mt-1" size={20} />
              <p>{scanResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Sovereignty</h2>
          <p className="text-gray-400 text-lg">Scalable intelligence and uncompromising security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Tier 1 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-[var(--color-qantum-cyan)]/30 transition-colors">
            <h3 className="text-xl font-bold text-gray-300 mb-2">The Sentinel</h3>
            <div className="text-4xl font-extrabold mb-6">€49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-gray-400">
              <li className="flex items-center gap-3"><CheckIcon /> Core Node Telemetry</li>
              <li className="flex items-center gap-3"><CheckIcon /> 1 AETERNA License</li>
              <li className="flex items-center gap-3"><CheckIcon /> Community Access</li>
            </ul>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-semibold transition-colors">Subscribe</button>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div className="glass-panel p-8 rounded-2xl border-[var(--color-qantum-cyan)]/50 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[var(--color-qantum-cyan)] to-[var(--color-qantum-purple)] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Recommended
            </div>
            <h3 className="text-xl font-bold text-[var(--color-qantum-cyan)] mb-2">The Sovereign</h3>
            <div className="text-5xl font-extrabold mb-6 text-white">€149<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-white/90 font-medium">
              <li className="flex items-center gap-3"><CheckIcon /> Advanced Oracle Scanning</li>
              <li className="flex items-center gap-3"><CheckIcon /> 5 AETERNA Licenses</li>
              <li className="flex items-center gap-3"><CheckIcon /> Zero-Entropy Encrypted Storage</li>
              <li className="flex items-center gap-3"><CheckIcon /> Priority Support</li>
            </ul>
            <button className="w-full py-4 bg-gradient-to-r from-[var(--color-qantum-cyan)] to-[#00a0b0] hover:to-[#00c0d0] text-black rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">Subscribe Now</button>
          </div>

          {/* Tier 3 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-[var(--color-qantum-purple)]/30 transition-colors">
            <h3 className="text-xl font-bold text-[#b47af5] mb-2">The Singularity</h3>
            <div className="text-4xl font-extrabold mb-6">€999<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-gray-400">
              <li className="flex items-center gap-3"><CheckIcon /> Enterprise Grid Access</li>
              <li className="flex items-center gap-3"><CheckIcon /> Unlimited Licenses</li>
              <li className="flex items-center gap-3"><CheckIcon /> Dedicated Integrator</li>
              <li className="flex items-center gap-3"><CheckIcon /> Custom Cryptography</li>
            </ul>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">Contact Sales <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 border-t border-white/5 w-full pt-8 text-center text-sm text-gray-500">
        <p>&copy; 2026 QAntum Singularity. Zero Entropy Guaranteed.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">The Architect</a>
        </div>
      </footer>
    </main>
  );
}

function CheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-[var(--color-qantum-cyan)]/20 flex items-center justify-center text-[var(--color-qantum-cyan)] shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  );
}

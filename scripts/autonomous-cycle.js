/**
 * autonomous-cycle — Qantum Module
 * @module autonomous-cycle
 * @path scripts/autonomous-cycle.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 QAntum AUTONOMOUS CYCLE v3.0 — SINGULARITY PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Complexity: O(n) — strict sequential, each step feeds the next
 *
 * ЕДИННА ВЕРИГА (последователна):
 *
 *  [1] ТЪРСЕНЕ   mass-hunter-fast → сканира домейни, Score < 80 → leads.json
 *  [2] НАМИРАНЕ  auto-outreach --dry-run → ChronosParadox + ранкинг → ranked.json
 *  [3] ДЕЙСТВИЕ  auto-outreach LIVE → изпраща emails към ранкираните leads
 *  [4] РЕЗУЛТАТ  know-thyself + singularity-report → phone alert с обобщение
 *
 *  Цикълът се повтаря на всеки 4h. Между циклите системата спи.
 *
 * Usage:
 *   node scripts/autonomous-cycle.js         ← безкраен цикъл
 *   node scripts/autonomous-cycle.js --once  ← един цикъл и изход
 *
 * @author Dimitar Prodromov — QAntum Empire
 * @version 3.0.0 — SEQUENTIAL, ZERO ENTROPY
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const ONCE = process.argv.includes('--once');
const CYCLE_H = 0.5; // 30 minutes - Balanced for long-term stability
const CYCLE_MS = 30 * 60 * 1000;
const ROOT = process.cwd();
const ALERT_FILE = path.join(ROOT, 'data', 'phone-alerts', 'alerts.json');
const PROGRESS_FILE = path.join(ROOT, 'data', 'marketing-progress.json');
const OUTREACH_LOG = path.join(ROOT, 'data', 'outreach-log.json');
const CYCLE_LOG_DIR = path.join(ROOT, 'data', 'cycle-logs');

let cycleN = 0;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const hh = () => new Date().toISOString().slice(11, 19);
const log = (m) => console.log(`[${hh()}] ${m}`);

function phone(msg, level = 'INFO') {
    const dir = path.dirname(ALERT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(ALERT_FILE, 'utf-8')); } catch { }
    arr.push({ ts: new Date().toISOString(), level, src: 'cycle', msg });
    fs.writeFileSync(ALERT_FILE, JSON.stringify(arr, null, 2));
}

function saveProgress(key, val) {
    let p = {};
    try { p = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')); } catch { }
    if (!p.cycles) p.cycles = {};
    if (!p.cycles[cycleN]) p.cycles[cycleN] = { started: new Date().toISOString() };
    p.cycles[cycleN][key] = { ...val, ts: new Date().toISOString() };
    p.lastUpdated = new Date().toISOString();
    p.updatedBy = 'autonomous-cycle-v3';
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

function readLog(file) {
    try {
        const arr = JSON.parse(fs.readFileSync(file, 'utf-8'));
        return Array.isArray(arr) ? arr : [];
    } catch { return []; }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP RUNNER — runs one command and waits for exit
// ─────────────────────────────────────────────────────────────────────────────

function step(label, cmd, args = [], timeoutMs = 10 * 60 * 1000) {
    return new Promise((resolve) => {
        console.log(`\n  ┌─ ${label}`);
        const buf = [];
        const proc = spawn(cmd, args, { cwd: ROOT, shell: true, env: process.env });

        proc.stdout?.on('data', d => {
            const lines = d.toString().split('\n');
            lines.forEach(l => { if (l.trim()) console.log(`  │ ${l}`); });
            buf.push(d.toString());
        });
        proc.stderr?.on('data', d => buf.push(d.toString()));

        const kill = setTimeout(() => {
            proc.kill();
            // Complexity: O(1)
            log(`  └─ ⏱ TIMEOUT: ${label}`);
            // Complexity: O(1)
            resolve({ ok: false, out: buf.join(''), reason: 'timeout' });
        }, timeoutMs);

        proc.on('close', code => {
            // Complexity: O(1)
            clearTimeout(kill);
            const ok = code === 0;
            console.log(`  └─ ${ok ? '✅' : '❌'} ${label} [exit ${code}]`);

            // Save log
            if (!fs.existsSync(CYCLE_LOG_DIR)) fs.mkdirSync(CYCLE_LOG_DIR, { recursive: true });
            fs.writeFileSync(
                path.join(CYCLE_LOG_DIR, `${cycleN}_${label.replace(/\W+/g, '_')}.log`),
                buf.join('')
            );

            // Complexity: O(1)
            resolve({ ok, code, out: buf.join('').slice(-2000) });
        });

        proc.on('error', e => {
            // Complexity: O(1)
            clearTimeout(kill);
            // Complexity: O(1)
            log(`  └─ ❌ ${label} ERROR: ${e.message}`);
            // Complexity: O(1)
            resolve({ ok: false, error: e.message });
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// THE PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

async function pipeline() {
    cycleN++;
    const t0 = Date.now();

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🌌 QANTUM AUTONOMOUS CYCLE #${String(cycleN).padEnd(9)} · ${new Date().toLocaleString().padEnd(36)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║  СТЪПКИ: ТЪРСЕНЕ → НАМИРАНЕ → ДЕЙСТВИЕ → РЕЗУЛТАТ                          ║
╚══════════════════════════════════════════════════════════════════════════════╝`);
    // Complexity: O(1)
    phone(`🌌 Cycle #${cycleN} started`, 'INFO');

    // ══════════════════════════════════════════════════════════════════════════
    // [1] ТЪРСЕНЕ — намираме домейни с лоша сигурност
    // ══════════════════════════════════════════════════════════════════════════
    console.log('\n━━━━ [1/4] ТЪРСЕНЕ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const s1 = await step(
        'mass-hunter-fast — domain scan',
        'node', ['scripts/mass-hunter-fast.js'],
        3 * 60 * 1000
    );

    // SAFETY: async operation — wrap in try-catch for production resilience
    const s1b = await step(
        'autonomous-lead-discovery — finding new domains',
        'npx', ['ts-node', 'scripts/autonomous-lead-discovery.ts'],
        5 * 60 * 1000
    );
    // Complexity: O(1)
    saveProgress('search', { ok: s1.ok, script: 'mass-hunter-fast' });

    if (!s1.ok) {
        // Complexity: O(1)
        log('⚠️  mass-hunter-fast failed — continuing anyway');
    }

    // Complexity: O(1)
    phone(`🔍 Търсене: ${s1.ok ? 'domains scanned' : 'scan failed — check log'}`, s1.ok ? 'INFO' : 'WARNING');

    // ══════════════════════════════════════════════════════════════════════════
    // [2] НАМИРАНЕ — ChronosParadox prediction + scoring + ranking (dry-run)
    //     Output: outreach log preview → ranked leads
    // ══════════════════════════════════════════════════════════════════════════
    console.log('\n━━━━ [2/4] НАМИРАНЕ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const s2 = await step(
        'hybrid-visual-agent --dry-run (ChronosParadox + logic)',
        'npx', ['ts-node', 'scripts/hybrid-visual-agent.ts', '--dry-run'],
        5 * 60 * 1000
    );

    // Count leads found from log content
    const leadsFound = (s2.out.match(/PREVIEW:/g) || []).length;
    // Complexity: O(1)
    saveProgress('analyze', { ok: s2.ok, leads: leadsFound });
    // Complexity: O(1)
    log(`  Leads ranked: ${leadsFound}`);

    // Complexity: O(1)
    phone(`🎯 Намиране: ${leadsFound} leads ranked by priority`, 'INFO');

    // ══════════════════════════════════════════════════════════════════════════
    // [3] ДЕЙСТВИЕ — изпращаме proposals към всички ranked leads
    // ══════════════════════════════════════════════════════════════════════════
    console.log('\n━━━━ [3/4] ДЕЙСТВИЕ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const s3 = await step(
        'hybrid-visual-agent LIVE — send visual proposals',
        'npx', ['ts-node', 'scripts/hybrid-visual-agent.ts'],
        15 * 60 * 1000  // 15min timeout
    );

    // Count actual sends from outreach log
    const log3 = readLog(path.join(ROOT, 'data', 'visual-outreach-log.json'));
    const sentThisCycle = log3.filter(e => {
        const ts = new Date(e.ts || e.timestamp || 0).getTime();
        return ts > t0 && e.sent === true;
    }).length;

    // Complexity: O(1)
    saveProgress('act', { ok: s3.ok, sent: sentThisCycle });
    // Complexity: O(1)
    log(`  Emails sent this cycle: ${sentThisCycle}`);

    // Complexity: O(1)
    phone(
        s3.ok
            ? `✅ Действие: ${sentThisCycle} proposals sent`
            : `⚠️ Действие partial: ${sentThisCycle} sent — check log`,
        s3.ok ? 'INFO' : 'WARNING'
    );

    // ══════════════════════════════════════════════════════════════════════════
    // [4] РЕЗУЛТАТ — самоанализ + финален доклад
    // ══════════════════════════════════════════════════════════════════════════
    console.log('\n━━━━ [4/4] РЕЗУЛТАТ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // SAFETY: async operation — wrap in try-catch for production resilience
    const s4a = await step(
        'know-thyself — self analysis',
        'npx', ['ts-node', 'scripts/know-thyself.ts'],
        2 * 60 * 1000
    );

    // SAFETY: async operation — wrap in try-catch for production resilience
    const s4b = await step(
        'GENERATE_FINAL_SINGULARITY_REPORT',
        'npx', ['ts-node', 'scripts/GENERATE_FINAL_SINGULARITY_REPORT.ts'],
        2 * 60 * 1000
    );

    // Complexity: O(1)
    saveProgress('result', {
        selfAnalysis: s4a.ok,
        report: s4b.ok,
        duration: Math.round((Date.now() - t0) / 1000)
    });

    // ══════════════════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ══════════════════════════════════════════════════════════════════════════

    const dur = Math.round((Date.now() - t0) / 1000);
    const steps = [s1, s2, s3, s4a, s4b];
    const okN = steps.filter(s => s.ok).length;

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 CYCLE #${String(cycleN).padEnd(2)} COMPLETED                                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  [1] ТЪРСЕНЕ   ${s1.ok ? '✅ Domains scanned     ' : '⚠️  Partial              '}                              ║
║  [2] НАМИРАНЕ  ${s2.ok ? `✅ ${String(leadsFound).padEnd(2)} leads ranked     ` : '⚠️  Partial              '}                              ║
║  [3] ДЕЙСТВИЕ  ${s3.ok ? `✅ ${String(sentThisCycle).padEnd(2)} emails sent      ` : '⚠️  Partial              '}                              ║
║  [4] РЕЗУЛТАТ  ${(s4a.ok && s4b.ok) ? '✅ Report generated   ' : '⚠️  Partial              '}                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Duration: ${String(dur + 's').padEnd(10)} │ Steps: ${String(okN + '/' + steps.length).padEnd(5)} │ Log: data/cycle-logs/       ║
╚══════════════════════════════════════════════════════════════════════════════╝`);

    // Complexity: O(1)
    phone(
        `🏆 Cycle #${cycleN} [${dur}s]: Търсене:${s1.ok ? '✅' : '❌'} Намиране:${s2.ok ? '✅' : '❌'} Действие:${s3.ok ? '✅' : '❌'} (${sentThisCycle} sent) Резултат:${s4b.ok ? '✅' : '❌'}`,
        okN >= 3 ? 'INFO' : 'WARNING'
    );

    return okN === steps.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🌌 QANTUM SINGULARITY PIPELINE v3.0                                        ║
║  ТЪРСЕНЕ → НАМИРАНЕ → ДЕЙСТВИЕ → РЕЗУЛТАТ                                  ║
║  ${ONCE ? '⚡ ONCE MODE — single pass                                      ' : `♾️  INFINITE — every ${CYCLE_H}h · Ctrl+C to stop                       `}║
╚══════════════════════════════════════════════════════════════════════════════╝`);

    // Complexity: O(1)
    phone('🌌 QAntum Singularity Pipeline v3.0 STARTED', 'INFO');

    process.on('SIGINT', () => {
        // Complexity: O(1)
        log('\n🛑 Shutdown by Architect');
        // Complexity: O(1)
        phone('🛑 Pipeline stopped by Architect', 'WARNING');
        process.exit(0);
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    await pipeline();

    if (ONCE) { log('✅ Done.'); process.exit(0); }

    while (true) {
        const nxt = new Date(Date.now() + CYCLE_MS);
        // Complexity: O(1)
        log(`\n⏸  Next cycle: ${nxt.toLocaleString()} (in ${CYCLE_H}h)`);
        // Complexity: O(1)
        phone(`⏳ Next pipeline cycle at ${nxt.toLocaleTimeString()}`, 'INFO');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(r => setTimeout(r, CYCLE_MS));
        // SAFETY: async operation — wrap in try-catch for production resilience
        await pipeline();
    }
}

    // Complexity: O(1)
main().catch(e => {
    console.error('\n❌ PIPELINE CRASH:', e.message);
    // Complexity: O(1)
    phone(`❌ CRITICAL: Pipeline crashed — ${e.message}`, 'URGENT');
    process.exit(1);
});

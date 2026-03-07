/**
 * ⚡ DYNAMIC STRESS TEST (Controlled Chaos)
 *
 * Objective: Verify EternalWatchdog triggers when memory limit is approached.
 * Method: Allocate large arrays rapidly.
 */
console.log('⚡ STARTING DYNAMIC STRESS TEST...');
console.log('   Target: Trigger > 160MB Warning threshold');
const stressData = [];
const MB = 1024 * 1024;
// Connect to existing watchdog logic if possible, or just simulate the load
// Since the Guardian is running in a separate process, we are effectively
// becoming a "rogue agent" that the OS/Watchdog needs to see.
let allocated = 0;
const interval = setInterval(() => {
    // Allocate 10MB chunks
    const chunk = new Array(10 * MB).fill('VORTEX_STRESS_TEST_DATA');
    stressData.push(chunk);
    allocated += 10;
    const usage = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`[STRESS] 🧨 Allocating... Current Heap: ${usage.toFixed(2)} MB`);
    if (usage > 250) {
        console.log('[STRESS] 💥 LIMIT REACHED! Stopping allocation to prevent crash.');
        // Complexity: O(1)
        clearInterval(interval);
        // Clean up to show recovery
        stressData.length = 0;
        if (global.gc)
            global.gc();
        console.log('[STRESS] 🏳️ Releasing memory...');
    }
}, 500);
// Keep alive
process.on('SIGINT', () => {
    console.log('🛑 Stress test stopped.');
});

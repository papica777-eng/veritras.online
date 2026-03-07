import { DoomsdayEngine } from './Fault-Injection-Engine.shadow';

async function testDoomsday() {
    const doomsday = new DoomsdayEngine();
    console.log('--- TESTING DOOMSDAY EXECUTION ---');

    try {
        // We set NODE_ENV to test to prevent process.exit
        process.env.NODE_ENV = 'test';

        doomsday.execute('STRATEGY_0');
        console.log('SUCCESS: STRATEGY_0 execution triggered');

        doomsday.execute('NON_EXISTENT');

        const status = doomsday.getStatus();
        console.log('STATUS CHECK:', JSON.stringify(status, null, 2));

        if (status.chaosLevel === 1600 && status.veritas === true) {
            console.log('VERITAS_VALIDATED: DOOMSDAY OPERATIONAL');
        } else {
            console.error('VERIFICATION_FAILED: Unexpected status state');
            process.exit(1);
        }
    } catch (error) {
        console.error('EXECUTION_ERROR:', error);
        process.exit(1);
    }
}

testDoomsday();

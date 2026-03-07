/**
 * start-dashboard — Qantum Module
 * @module start-dashboard
 * @path scripts/start-dashboard.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { SingularityDashboard } from './scripts/dashboard/SingularityDashboard';

const dashboard = new SingularityDashboard();
dashboard.start()
    .then(() => {
        console.log('⚡ AETERNA SINGULARITY Dashboard Backend Started ⚡');
        console.log('Listening on port 8888 for UI connections...');
    })
    .catch((err) => {
        console.error('Failed to start dashboard:', err);
    });

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                  BINANCE API CONNECTION TEST                                  ║
 * ║                                                                               ║
 * ║   Quick validation script to verify your API keys work correctly.            ║
 * ║   This will:                                                                  ║
 * ║   • Test connectivity to Binance API                                          ║
 * ║   • Verify API key permissions                                                ║
 * ║   • Display account balances                                                  ║
 * ║                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import axios from 'axios';

dotenv.config({ path: './PRIVATE-CORE/.env' });

const API_KEY = process.env.BINANCE_API_KEY || '';
const API_SECRET = process.env.BINANCE_API_SECRET || '';
const BASE_URL = 'https://api.binance.com';

// ══════════════════════════════════════════════════════════════════════════════
// SIGNATURE HELPER
// ══════════════════════════════════════════════════════════════════════════════

function signRequest(queryString: string): string {
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');
}

// ══════════════════════════════════════════════════════════════════════════════
// API TESTS
// ══════════════════════════════════════════════════════════════════════════════

async function testServerTime() {
  console.log('\n📡 Test 1: Server Connectivity');
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/time`);
    const serverTime = new Date(response.data.serverTime);
    console.log(`   ✅ Server Time: ${serverTime.toISOString()}`);
    return response.data.serverTime;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`);
    return null;
  }
}

async function testApiKey() {
  console.log('\n🔑 Test 2: API Key Validation');
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/account`, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      params: {
        timestamp: Date.now(),
        recvWindow: 5000,
      },
    });
    console.log(`   ❌ Signature required but not sent (expected)`);
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log(`   ✅ API Key recognized (signature validation required)`);
      return true;
    }
    console.log(`   ❌ Unexpected error: ${error.message}`);
    return false;
  }
}

async function testAccountAccess() {
  console.log('\n💰 Test 3: Account Information');
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}&recvWindow=5000`;
    const signature = signRequest(queryString);

    const response = await axios.get(`${BASE_URL}/api/v3/account`, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      params: {
        timestamp,
        recvWindow: 5000,
        signature,
      },
    });

    const data = response.data;
    console.log(`   ✅ Account Access: SUCCESS`);
    console.log(`\n   Account Type: ${data.accountType}`);
    console.log(`   Can Trade: ${data.canTrade}`);
    console.log(`   Can Withdraw: ${data.canWithdraw}`);
    console.log(`   Can Deposit: ${data.canDeposit}`);

    // Display balances > 0
    const balances = data.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
    
    if (balances.length > 0) {
      console.log(`\n   💼 Non-Zero Balances:`);
      balances.forEach((bal: any) => {
        const free = parseFloat(bal.free);
        const locked = parseFloat(bal.locked);
        const total = free + locked;
        if (total > 0) {
          console.log(`      ${bal.asset.padEnd(8)} | Free: ${free.toFixed(8).padStart(12)} | Locked: ${locked.toFixed(8).padStart(12)}`);
        }
      });
    } else {
      console.log(`\n   💼 No assets found in account (test/new account)`);
    }

    return true;
  } catch (error: any) {
    if (error.response?.data) {
      console.log(`   ❌ API Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    return false;
  }
}

async function testSpotPermissions() {
  console.log('\n📊 Test 4: Spot Trading Permissions');
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}&recvWindow=5000`;
    const signature = signRequest(queryString);

    const response = await axios.get(`${BASE_URL}/api/v3/account`, {
      headers: { 'X-MBX-APIKEY': API_KEY },
      params: { timestamp, recvWindow: 5000, signature },
    });

    const permissions = response.data.permissions || [];
    console.log(`   Permissions: ${permissions.join(', ')}`);
    
    const hasSpot = permissions.includes('SPOT');
    if (hasSpot) {
      console.log(`   ✅ SPOT Trading: ENABLED`);
    } else {
      console.log(`   ⚠️ SPOT Trading: DISABLED (enable in API settings)`);
    }

    return hasSpot;
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN RUNNER
// ══════════════════════════════════════════════════════════════════════════════

(async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🔬 BINANCE API CONNECTION TEST                                              ║
║                                                                               ║
║   Testing credentials from: .env                                              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);

  // Validate env vars
  if (!API_KEY || !API_SECRET) {
    console.error(`
❌ MISSING API CREDENTIALS!

Please add these to PRIVATE-CORE/.env:
BINANCE_API_KEY=your_api_key
BINANCE_API_SECRET=your_api_secret
    `);
    process.exit(1);
  }

  console.log(`   🔑 API Key: ${API_KEY.slice(0, 8)}...${API_KEY.slice(-8)}`);
  console.log(`   🔐 Secret: ${API_SECRET.slice(0, 8)}...${API_SECRET.slice(-8)}`);

  // Run tests
  // SAFETY: async operation — wrap in try-catch for production resilience
  const serverOK = await testServerTime();
  if (!serverOK) {
    console.error('\n❌ Cannot connect to Binance. Check your internet connection.');
    process.exit(1);
  }

  // SAFETY: async operation — wrap in try-catch for production resilience
  const keyOK = await testApiKey();
  // SAFETY: async operation — wrap in try-catch for production resilience
  const accountOK = await testAccountAccess();
  // SAFETY: async operation — wrap in try-catch for production resilience
  const spotOK = await testSpotPermissions();

  console.log(`
${'═'.repeat(80)}
  `);

  if (accountOK && spotOK) {
    console.log(`✅ ALL TESTS PASSED!`);
    console.log(`\n🚀 Your Binance API connection is ready for trading.`);
    console.log(`   Next step: Run the Market Reaper or Binance Login scenario.`);
  } else if (accountOK && !spotOK) {
    console.log(`⚠️ API KEY WORKS, but SPOT trading is not enabled.`);
    console.log(`\n📋 To fix this:`);
    console.log(`   1. Go to: https://www.binance.com/en/my/settings/api-management`);
    console.log(`   2. Edit your API key`);
    console.log(`   3. Enable "Enable Spot & Margin Trading"`);
    console.log(`   4. Save and re-run this test`);
  } else {
    console.log(`❌ API CONNECTION FAILED!`);
    console.log(`\n🔧 Troubleshooting:`);
    console.log(`   • Verify API key/secret are correct`);
    console.log(`   • Check if IP whitelist is enabled (should be "Unrestricted" for testing)`);
    console.log(`   • Ensure API key has "Enable Reading" permission`);
  }

  console.log(`\n${'═'.repeat(80)}\n`);
})();

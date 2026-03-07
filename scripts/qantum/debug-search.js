/**
 * debug-search — Qantum Module
 * @module debug-search
 * @path scripts/qantum/debug-search.js
 * @auto-documented BrutalDocEngine v2.1
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    try {
        const r = await axios.get('https://html.duckduckgo.com/html/?q=QA+company+Bulgaria', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
            timeout: 10000,
        });
        console.log('Status:', r.status);
        console.log('Length:', r.data.length);
        
        const $ = cheerio.load(r.data);
        console.log('.result count:', $('div.result').length);
        console.log('.web-result count:', $('div.web-result').length);
        console.log('a[href] count:', $('a[href]').length);
        
        // Show all class names in the page
        const classes = new Set();
        $('[class]').each((i, el) => {
            $(el).attr('class').split(' ').forEach(c => classes.add(c));
        });
        console.log('Classes found:', [...classes].join(', '));
        
        // Show first 1500 chars
        console.log('\n--- HTML SAMPLE ---');
        console.log(r.data.substring(0, 1500));
    } catch (e) {
        console.log('ERR:', e.message);
    }
}
    // Complexity: O(1)
test();

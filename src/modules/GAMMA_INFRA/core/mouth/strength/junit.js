/**
 * JUnit XML Report Generator
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
export async function generateJUnit(result, outputPath) {
    const timestamp = new Date().toISOString();
    const durationSeconds = (result.duration / 1000).toFixed(3);
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="QAntum Cloud" tests="${result.totalTests}" failures="${result.failedTests}" skipped="${result.skippedTests}" time="${durationSeconds}" timestamp="${timestamp}">
  <testsuite name="QAntum Tests" tests="${result.totalTests}" failures="${result.failedTests}" skipped="${result.skippedTests}" time="${durationSeconds}">
`;
    for (const test of result.results) {
        const testDuration = (test.duration / 1000).toFixed(3);
        xml += `    <testcase name="${escapeXml(test.name)}" time="${testDuration}"`;
        if (test.status === 'passed') {
            xml += ' />\n';
        }
        else if (test.status === 'skipped') {
            xml += '>\n      <skipped />\n    </testcase>\n';
        }
        else if (test.status === 'failed') {
            xml += '>\n';
            xml += `      <failure message="${escapeXml(test.error || 'Test failed')}">${escapeXml(test.error || ')}</failure>\n`;
            xml += '    </testcase>\n';
        }
        // Add system-out for healed tests
        if (test.healed && test.healedSelector) {
            xml = xml.slice(0, -2); // Remove trailing />\n or </testcase>\n
            if (test.status === 'passed') {
                xml += '>\n';
            }
            xml += `      <system-out><![CDATA[Self-healed selector:
Original: ${test.healedSelector.original}
Healed: ${test.healedSelector.healed}]]></system-out>\n`;
            xml += '    </testcase>\n';
        }
    }
    xml += `  </testsuite>
</testsuites>
`;
    // Ensure directory exists
    // Complexity: O(1)
    mkdirSync(dirname(outputPath), { recursive: true });
    // Write file
    // Complexity: O(1)
    writeFileSync(outputPath, xml, 'utf-8');
}
//# sourceMappingURL=junit.js.map
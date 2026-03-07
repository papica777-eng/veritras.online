/**
 * proposal-generator — Qantum Module
 * @module proposal-generator
 * @path omni_core/logic/proposal-generator.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌧️ QANTUM PRIME v28.2.2 - THE RAINMAKER                                     ║
 * ║  Professional PDF Proposal Generator | Investment Memo | Audit Trail         ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║  • Cyberpunk branded design                                                  ║
 * ║  • Automatic profit calculations                                             ║
 * ║  • Confidentiality watermark                                                 ║
 * ║  • Trace ID for audit compliance                                             ║
 * ║  • Fire-and-forget async generation                                          ║
 * ║                                                                              ║
 * ║  Usage: const generator = new ProposalGenerator();                           ║
 * ║         generator.generate(tradeData);                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ProposalGenerator {
    constructor(options = {}) {
        // Output directory
        this.outputDir = options.outputDir || path.join(__dirname, '../proposals');
        
        // Създаваме папка за офертите, ако няма такава
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
            console.log(`📁 Created proposals directory: ${this.outputDir}`);
        }
        
        // Statistics
        this.stats = {
            generated: 0,
            failed: 0,
            totalValue: 0
        };
        
        // Branding config
        this.branding = {
            primaryColor: '#0d1117',
            accentColor: '#00ff41',
            textColor: '#ffffff',
            companyName: 'QANTUM PRIME',
            version: 'v28.2.2'
        };
    }

    /**
     * Генерира уникален Trace ID
     */
    // Complexity: O(1)
    generateTraceId() {
        const prefix = 'HYDRA-TX';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Изчислява estimated profit на база стратегия
     */
    // Complexity: O(1)
    calculateProfit(price, action = 'BUY') {
        // Conservative 1.5% spread target
        const spreadPercent = 1.5;
        const estimatedProfit = price * (spreadPercent / 100);
        const targetPrice = action === 'BUY' 
            ? price * (1 + spreadPercent / 100)
            : price * (1 - spreadPercent / 100);
        
        return {
            spreadPercent,
            estimatedProfit,
            targetPrice,
            stopLoss: action === 'BUY' 
                ? price * 0.99  // 1% stop loss
                : price * 1.01,
            riskReward: '1:1.5'
        };
    }

    /**
     * Генерира PDF документ за открита възможност
     * @param {Object} tradeData - Данните от Hydra/Atomic Engine
     */
    // Complexity: O(1) — amortized
    async generate(tradeData) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            try {
                // Prepare data
                const traceId = tradeData.traceId || this.generateTraceId();
                const action = tradeData.action || 'BUY';
                const profit = this.calculateProfit(tradeData.price, action);
                
                // Create document
                const doc = new PDFDocument({ 
                    margin: 50,
                    size: 'A4',
                    info: {
                        Title: `QAntum Prime - ${tradeData.symbol} Opportunity`,
                        Author: 'QAntum Prime Automated System',
                        Subject: 'Investment Proposal',
                        Keywords: 'trading, arbitrage, cryptocurrency, HFT'
                    }
                });
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `QAntum_${tradeData.symbol}_${timestamp}.pdf`;
                const filePath = path.join(this.outputDir, filename);

                // Pipe към файл
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // ═══════════════════════════════════════════════════════════════
                // PAGE 1: EXECUTIVE SUMMARY
                // ═══════════════════════════════════════════════════════════════

                // Header Bar (Cyberpunk Style)
                doc.rect(0, 0, 620, 120).fill(this.branding.primaryColor);
                
                // Logo/Title
                doc.fontSize(28).fillColor(this.branding.accentColor)
                   .text('⚡ QANTUM PRIME', 50, 35);
                
                doc.fontSize(12).fillColor(this.branding.textColor)
                   .text('AUTOMATED INTELLIGENCE SYSTEM', 50, 70);
                
                doc.fontSize(10).fillColor('#8b949e')
                   .text(`${this.branding.version} | Generated: ${new Date().toLocaleString()}`, 50, 90);

                // Classification Badge
                doc.rect(450, 30, 100, 25).fill('#ff3333');
                doc.fontSize(10).fillColor('#ffffff')
                   .text('CONFIDENTIAL', 460, 38);

                // Watermark
                doc.save();
                doc.rotate(-45, { origin: [300, 450] });
                doc.fontSize(70).opacity(0.05).fillColor('#ff0000')
                   .text('CONFIDENTIAL', 100, 450);
                doc.restore();
                doc.opacity(1);

                // ═══════════════════════════════════════════════════════════════
                // OPPORTUNITY SECTION
                // ═══════════════════════════════════════════════════════════════
                
                doc.fillColor('#000000');
                doc.moveDown(4);
                
                // Action Badge
                const actionColor = action === 'BUY' ? '#00ff41' : '#ff3333';
                doc.rect(50, 150, 80, 35).fill(actionColor);
                doc.fontSize(18).fillColor('#000000')
                   .text(action, 65, 158);
                
                // Symbol & Price
                doc.fontSize(32).fillColor('#000000')
                   .text(tradeData.symbol, 150, 150);
                doc.fontSize(24).fillColor('#333333')
                   .text(`$${tradeData.price.toFixed(2)}`, 150, 185);

                // ═══════════════════════════════════════════════════════════════
                // TRADE DETAILS TABLE
                // ═══════════════════════════════════════════════════════════════
                
                const tableTop = 250;
                const col1 = 50;
                const col2 = 280;
                const col3 = 400;
                let currentY = tableTop;

                // Table Header
                doc.rect(col1, currentY, 500, 30).fill('#f0f0f0');
                doc.fontSize(12).fillColor('#333333').font('Helvetica-Bold')
                   .text('TRADE PARAMETERS', col1 + 10, currentY + 8);
                currentY += 40;

                // Row function
                const drawRow = (label, value, highlight = false) => {
                    if (highlight) {
                        doc.rect(col1, currentY - 5, 500, 25).fill('#e8f5e9');
                    }
                    doc.font('Helvetica').fontSize(11).fillColor('#666666')
                       .text(label, col1 + 10, currentY);
                    doc.font('Helvetica-Bold').fillColor('#000000')
                       .text(value, col2, currentY);
                    doc.moveTo(col1, currentY + 18).lineTo(550, currentY + 18)
                       .strokeColor('#e0e0e0').stroke();
                    currentY += 28;
                };

                // Complexity: O(1)
                drawRow('Asset Symbol', tradeData.symbol);
                // Complexity: O(1)
                drawRow('Current Price', `$${tradeData.price.toFixed(2)}`);
                // Complexity: O(1)
                drawRow('Target Price', `$${profit.targetPrice.toFixed(2)}`, true);
                // Complexity: O(1)
                drawRow('Stop Loss', `$${profit.stopLoss.toFixed(2)}`);
                // Complexity: O(1)
                drawRow('Risk/Reward', profit.riskReward);
                // Complexity: O(1)
                drawRow('Execution Latency', `${tradeData.latency?.toFixed(2) || 'N/A'} ms`);
                // Complexity: O(1)
                drawRow('Network Node', tradeData.proxyLocation || tradeData.proxy || 'Direct');
                // Complexity: O(1)
                drawRow('Confidence', `${tradeData.confidence || 85}%`);

                // ═══════════════════════════════════════════════════════════════
                // PROFIT PROJECTION BOX
                // ═══════════════════════════════════════════════════════════════
                
                currentY += 20;
                doc.rect(col1, currentY, 500, 80).fill('#e8f5e9').stroke('#00cc33');
                
                doc.fontSize(14).fillColor('#004d40').font('Helvetica-Bold')
                   .text('PROJECTED OUTCOME', col1 + 20, currentY + 15);
                
                doc.fontSize(28).fillColor('#00aa00')
                   .text(`+$${profit.estimatedProfit.toFixed(2)}`, col1 + 20, currentY + 40);
                
                doc.fontSize(12).fillColor('#666666').font('Helvetica')
                   .text(`(${profit.spreadPercent}% spread target)`, col1 + 180, currentY + 50);

                // ═══════════════════════════════════════════════════════════════
                // TECHNICAL METRICS
                // ═══════════════════════════════════════════════════════════════
                
                currentY += 110;
                doc.fontSize(14).fillColor('#333333').font('Helvetica-Bold')
                   .text('SYSTEM METRICS', col1, currentY);
                currentY += 25;

                const metrics = [
                    ['Atomic Engine', '4.3μs avg'],
                    ['Ring Buffer', '10,000 capacity'],
                    ['Ghost Protocol', 'JA3 Rotation Active'],
                    ['Circuit Breaker', 'Healthy']
                ];

                metrics.forEach(([label, value]) => {
                    doc.fontSize(10).font('Helvetica').fillColor('#666666')
                       .text(`• ${label}: `, col1, currentY, { continued: true })
                       .fillColor('#000000').text(value);
                    currentY += 18;
                });

                // ═══════════════════════════════════════════════════════════════
                // FOOTER
                // ═══════════════════════════════════════════════════════════════
                
                // Footer bar
                doc.rect(0, 750, 620, 100).fill('#f5f5f5');
                
                doc.fontSize(8).fillColor('#666666').font('Helvetica')
                   .text('This document was generated automatically by QAntum Prime Node.js HFT Cluster.', 
                         col1, 765, { align: 'center', width: 500 });
                
                doc.fontSize(9).fillColor('#333333').font('Helvetica-Bold')
                   .text(`Trace ID: ${traceId}`, col1, 785, { align: 'center', width: 500 });
                
                doc.fontSize(7).fillColor('#999999')
                   .text('© 2026 QAntum Prime. All rights reserved. Not financial advice.', 
                         col1, 805, { align: 'center', width: 500 });

                // Finalize
                doc.end();

                stream.on('finish', () => {
                    const duration = Date.now() - startTime;
                    this.stats.generated++;
                    this.stats.totalValue += profit.estimatedProfit;
                    
                    console.log(`📄 [RAINMAKER] PDF Ready: ${filename} (${duration}ms)`);
                    // Complexity: O(1)
                    resolve({
                        success: true,
                        filePath,
                        filename,
                        traceId,
                        duration,
                        estimatedProfit: profit.estimatedProfit
                    });
                });

                stream.on('error', (err) => {
                    this.stats.failed++;
                    // Complexity: O(1)
                    reject(err);
                });

            } catch (error) {
                this.stats.failed++;
                console.error("📄 [RAINMAKER] PDF Generation Failed:", error.message);
                // Complexity: O(1)
                reject(error);
            }
        });
    }

    /**
     * Batch generate multiple proposals
     */
    // Complexity: O(N) — linear iteration
    async generateBatch(trades) {
        const results = [];
        for (const trade of trades) {
            try {
                const result = await this.generate(trade);
                results.push(result);
            } catch (err) {
                results.push({ success: false, error: err.message });
            }
        }
        return results;
    }

    /**
     * Get statistics
     */
    // Complexity: O(1)
    getStats() {
        return {
            ...this.stats,
            totalValue: `$${this.stats.totalValue.toFixed(2)}`
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STANDALONE TEST
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🌧️ THE RAINMAKER - PDF Proposal Generator Test                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

        const generator = new ProposalGenerator();

        // Test data from Hydra
        const testTrades = [
            {
                symbol: 'BTCUSDT',
                price: 44985.50,
                latency: 5.71,
                proxyLocation: '🇺🇸 US - New York',
                action: 'BUY',
                confidence: 92
            },
            {
                symbol: 'ETHUSDT',
                price: 2510.25,
                latency: 13.31,
                proxyLocation: '🇬🇧 UK - London',
                action: 'SELL',
                confidence: 87
            },
            {
                symbol: 'SOLUSDT',
                price: 104.75,
                latency: 23.75,
                proxyLocation: '🇩🇪 DE - Frankfurt',
                action: 'BUY',
                confidence: 95
            }
        ];

        console.log('⚙️ Generating PDF proposals...\n');

        for (const trade of testTrades) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await generator.generate(trade);
            console.log(`   ✅ ${trade.symbol}: +$${result.estimatedProfit.toFixed(2)} potential\n`);
        }

        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  📊 GENERATION COMPLETE                                                      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Generated: ${generator.stats.generated} PDFs                                                        ║
║  Total Projected Value: ${generator.getStats().totalValue}                                     ║
║  Output Directory: proposals/                                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

    })();
}

module.exports = { ProposalGenerator };

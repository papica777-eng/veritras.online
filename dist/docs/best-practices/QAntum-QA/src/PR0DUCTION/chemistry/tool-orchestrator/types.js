"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   ████████╗ ██████╗  ██████╗ ██╗         ████████╗██╗   ██╗██████╗ ███████╗   ║
 * ║   ╚══██╔══╝██╔═══██╗██╔═══██╗██║         ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝   ║
 * ║      ██║   ██║   ██║██║   ██║██║            ██║    ╚████╔╝ ██████╔╝█████╗     ║
 * ║      ██║   ██║   ██║██║   ██║██║            ██║     ╚██╔╝  ██╔═══╝ ██╔══╝     ║
 * ║      ██║   ╚██████╔╝╚██████╔╝███████╗       ██║      ██║   ██║     ███████╗   ║
 * ║      ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝       ╚═╝      ╚═╝   ╚═╝     ╚══════╝   ║
 * ║                                                                               ║
 * ║   QAntum v29.0 "THE OMNIPOTENT NEXUS" - Tool Orchestrator Types               ║
 * ║   Adaptive Tooling Layer - Universal MCP Integration                          ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_TOOL_IDS = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS - THE 25+ MCP TOOLS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Pre-defined MCP Tool IDs
 */
exports.MCP_TOOL_IDS = {
    // Browser Automation
    CONTROL_CHROME: 'mcp-control-chrome',
    KAPTURE: 'mcp-kapture',
    WINDOWS_MCP: 'mcp-windows',
    // OS/Desktop
    DESKTOP_COMMANDER: 'mcp-desktop-commander',
    PDF_TOOLS: 'mcp-pdf-tools',
    EXCEL: 'mcp-excel',
    WORD: 'mcp-word',
    POWERPOINT: 'mcp-powerpoint',
    MAC_CONTROL: 'mcp-mac-control',
    // Data Scraping
    APIFY: 'mcp-apify',
    EXPLORIUM: 'mcp-explorium',
    TOMBA: 'mcp-tomba',
    // Cloud Infrastructure
    AWS_API: 'mcp-aws',
    KUBERNETES: 'mcp-kubernetes',
    CLOUDINARY: 'mcp-cloudinary',
    // Financial Markets
    POLYGON: 'mcp-polygon',
    // SaaS Analytics
    CLARITY: 'mcp-clarity',
    METABASE: 'mcp-metabase',
    GROWTHBOOK: 'mcp-growthbook',
    BRAZE: 'mcp-braze',
    VENDR: 'mcp-vendr',
    COUPLER: 'mcp-coupler',
    // Communication
    MAILTRAP: 'mcp-mailtrap',
    IMESSAGES: 'mcp-imessages',
    // Scientific AI
    ENRICHR: 'mcp-enrichr',
    GENOMICS_10X: 'mcp-10x-genomics',
    POPHIVE: 'mcp-pophive',
};

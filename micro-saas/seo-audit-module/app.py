"""
SEO Audit API Server - Phase 2 (Enterprise Standard - Pure Python)
===================================================================
High-performance, fully asynchronous Quart API.
Strict validation via Python dataclasses, 0% Rust dependencies.
"""

from quart import Quart, request, jsonify
import asyncio
from typing import List, Any, Dict
from seo_auditor import run_audit_async, SEOAuditResult

# ═══════════════════════════════════════════════════════════════
# QUART APP INSTANCE
# ═══════════════════════════════════════════════════════════════

app = Quart(__name__)

# Complexity: O(1)
@app.route("/health", methods=["GET"])
async def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy", 
        "service": "seo-audit-module", 
        "architecture": "Quart/Async/PurePython"
    }), 200

# Complexity: O(1) non-blocking IO
@app.route("/api/audit", methods=["POST"])
async def audit():
    """
    Run SEO audit on a single URL.
    Expected JSON: { "url": "https://example.com" }
    """
    try:
        data = await request.get_json()
        if not data or 'url' not in data:
            return jsonify({"error": "URL field is missing from payload"}), 400
            
        url = data['url']
        if not isinstance(url, str) or not url.startswith('http'):
             return jsonify({"error": "Invalid URL format"}), 400
             
        # Pure async fetch
        result: SEOAuditResult = await run_audit_async(url)
        return jsonify(result.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Complexity: O(1) non-blocking batch execution via asyncio.gather
@app.route("/api/batch-audit", methods=["POST"])
async def batch_audit():
    """
    Run SEO audit concurrently across multiple URLs using Quart + AsyncIO.
    Expected JSON: { "urls": ["https://example1.com", "https://example2.com"] }
    """
    try:
        data = await request.get_json()
        if not data or 'urls' not in data:
            return jsonify({"error": "URLs array is missing from payload"}), 400
            
        urls = data['urls']
        if not isinstance(urls, list):
             return jsonify({"error": "urls must be an array"}), 400
             
        if len(urls) > 100:
            return jsonify({"error": "Maximum 100 URLs permitted per batch request."}), 400

        # Validate URLs
        valid_urls = []
        for u in urls:
             if isinstance(u, str) and u.startswith('http'):
                 valid_urls.append(u)
             else:
                 return jsonify({"error": f"Invalid URL format discovered: {u}"}), 400

        # Generate tasks
        tasks = [run_audit_async(url) for url in valid_urls]
        
        # Execute heavily parallelized, completely non-blocking IO
        resultsArray = await asyncio.gather(*tasks, return_exceptions=True)

        success_results = []
        error_results = []

        for idx, res in enumerate(resultsArray):
            if isinstance(res, Exception):
                error_results.append({
                    "url": valid_urls[idx],
                    "error": str(res)
                })
            else:
                success_results.append(res.to_dict())

        return jsonify({
            "total": len(valid_urls),
            "succeeded": len(success_results),
            "failed": len(error_results),
            "results": success_results,
            "errors": error_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 SEO Audit Micro-SaaS [PHASE 2 - Pure Python] starting on port 8091")
    app.run(host='0.0.0.0', port=8091)

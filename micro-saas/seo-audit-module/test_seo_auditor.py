import pytest
from fastapi.testclient import TestClient
from app import app
import httpx
from unittest.mock import patch

client = TestClient(app)

# ═══════════════════════════════════════════════════════════════
# VERITAS VALIDATION UNITS (100% Determinism)
# ═══════════════════════════════════════════════════════════════

def test_health_check():
    """Verify O(1) health retrieval and node identification."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "seo-audit-module",
        "architecture": "FastAPI/Async"
    }

class MockResponse:
    def __init__(self, text, status_code=200):
        self.text = text
        self.content = text.encode('utf-8')
        self.status_code = status_code
        self.url = httpx.URL("https://example.com")
        
    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(f"{self.status_code} Error", request=None, response=self)

MOCK_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>QAntum Mock Page</title>
    <meta name="description" content="This is an actively measured meta description matching the length constraints required by SEO standards. Specifically constructed to exceed the minimum character limits.">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="canonical" href="https://example.com/">
    <meta name="robots" content="index, follow">
</head>
<body>
    <h1>Strict Structural Content</h1>
    <img src="logo.png" alt="QAntum Logo">
    <a href="/internal">Internal Node</a>
    <a href="https://external.com">External Sector</a>
</body>
</html>
"""

@pytest.mark.asyncio
async def test_single_audit_success():
    """Verify standard synchronous interception and strict schema out."""
    with patch('httpx.AsyncClient.get') as mock_get:
        mock_get.return_value = MockResponse(MOCK_HTML)
        
        response = client.post("/api/audit", json={"url": "https://example.com"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://example.com/"
        assert data["meta_tags"]["title"] == "QAntum Mock Page"
        assert data["meta_tags"]["viewport"] == "width=device-width, initial-scale=1.0"
        assert data["mobile_friendly"] is True
        assert data["headers"]["h1"] == 1
        assert data["images"]["total"] == 1
        assert data["images"]["missing_alt"] == 0

@pytest.mark.asyncio
async def test_batch_audit_strictness():
    """Verify parallel execution limits and schema rejection."""
    # Test strict limit
    urls = [f"https://example.com/{i}" for i in range(101)]
    response = client.post("/api/batch-audit", json={"urls": urls})
    assert response.status_code == 400
    assert "Maximum 100 URLs" in response.json()["detail"]

    # Test malformed payload
    response_malformed = client.post("/api/batch-audit", json={"urls": ["not-a-url"]})
    assert response_malformed.status_code == 422 # Pydantic Validation Error

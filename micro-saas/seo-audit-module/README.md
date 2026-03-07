# SEO Audit Micro-SaaS Module

Automated SEO auditing service that analyzes websites for optimization opportunities.

## Features

- **Meta Tags Analysis**: Checks title, description, and other meta tags
- **Heading Structure**: Validates H1-H6 tag hierarchy
- **Image Optimization**: Identifies images missing alt attributes
- **Link Analysis**: Counts internal/external links
- **Mobile Friendliness**: Checks for viewport meta tag
- **Performance**: Measures page load time
- **Schema Markup**: Detects structured data
- **SEO Score**: Calculates overall score (0-100)

## API Endpoints

### Single URL Audit
```bash
POST /api/audit
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Batch Audit
```bash
POST /api/batch-audit
Content-Type: application/json

{
  "urls": [
    "https://example1.com",
    "https://example2.com"
  ]
}
```

### Health Check
```bash
GET /health
```

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

## Docker Deployment

```bash
# Build the image
docker build -t seo-audit-module .

# Run the container
docker run -p 8091:8091 seo-audit-module
```

## Cloud Run Deployment

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/seo-audit-module

# Deploy to Cloud Run
gcloud run deploy seo-audit-module \
  --image gcr.io/PROJECT_ID/seo-audit-module \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Example Response

```json
{
  "url": "https://example.com",
  "timestamp": 1234567890,
  "score": 85,
  "issues": [
    "Title too short (25 chars)"
  ],
  "recommendations": [
    "Title should be 50-60 characters",
    "Consider adding Schema.org structured data"
  ],
  "meta_tags": {
    "title": "Example Website",
    "description": "This is an example website description...",
    "viewport": "width=device-width, initial-scale=1"
  },
  "headers": {
    "h1": 1,
    "h2": 3,
    "h3": 5
  },
  "links": {
    "internal": 25,
    "external": 10,
    "broken": []
  },
  "images": {
    "total": 15,
    "missing_alt": 3
  },
  "performance": {
    "load_time": 1.23
  },
  "mobile_friendly": true
}
```

## Integration with QANTUM Framework

This module integrates with the main QANTUM Framework as a monetizable Micro-SaaS offering. Users can unlock this module using credits from the Rust Economy system.

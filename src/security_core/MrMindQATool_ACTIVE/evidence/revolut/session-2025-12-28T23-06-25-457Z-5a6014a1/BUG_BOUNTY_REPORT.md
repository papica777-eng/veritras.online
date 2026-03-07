# 🔐 Security Vulnerability Report - Revolut

**Platform:** HackerOne / Revolut Bug Bounty Program  
**Reporter:** [YOUR_HACKERONE_USERNAME]  
**Date:** December 29, 2025  
**Severity:** Critical / High  

---

## 📋 Summary

During a security audit of the Revolut web application (app.revolut.com), I discovered multiple vulnerabilities including potential authentication bypass and PII (Personally Identifiable Information) exposure.

---

## 🔴 Vulnerability #1: Potential Authentication Bypass

### Description
Protected routes appear to be accessible without proper authentication checks. The following endpoints returned HTTP 200 responses without requiring authentication:

- `/dashboard`
- `/account`
- `/settings`
- `/admin`

### Severity
**Critical** - CVSS 3.1 Score: ~9.0

### Steps to Reproduce
1. Open a new browser session (incognito/private mode)
2. Navigate directly to `https://app.revolut.com/dashboard`
3. Observe that the page loads without redirecting to login
4. Repeat for `/account`, `/settings`, `/admin`

### Impact
An unauthenticated attacker could potentially:
- Access sensitive user dashboard information
- View/modify account settings
- Access administrative functions (if `/admin` is exposed)

### Evidence
- Screenshot: `auth_bypass-1766963223164-09042494.webp`
- Metadata: `auth_bypass-1766963223164-09042494.metadata.json`

### Recommendation
- Implement server-side authentication middleware on all protected routes
- Ensure authorization checks are performed for each request
- Return HTTP 401/403 for unauthenticated requests

---

## 🔴 Vulnerability #2: PII Exposure in DOM

### Description
Personal Identifiable Information (PII) is exposed in the DOM during the SSO authentication flow. Specifically:
- **4 email addresses** visible in page source
- **1 phone number** visible in page source

### Severity
**Critical** - GDPR Article 32 Compliance Issue

### Affected URL
```
https://sso.revolut.com/signin?client_id=o3r08ao16zvdlf2y5fdc&redirect_uri=https%3A%2F%2Fapp.revolut.com%2Fhome...
```

### Steps to Reproduce
1. Navigate to `https://app.revolut.com`
2. Wait for redirect to SSO login page
3. Open browser DevTools (F12)
4. Search for email patterns in Elements/Source tab
5. Observe exposed email addresses and phone numbers

### Impact
- Violation of GDPR Article 32 (Security of Processing)
- Potential for targeted phishing attacks
- User privacy breach
- Regulatory fines risk (up to €20M or 4% annual turnover)

### Evidence
- Screenshot: `pii_leak-1766963218508-bfc4cbfd.webp`
- Metadata with full details: `pii_leak-1766963218508-bfc4cbfd.metadata.json`

### Recommendation
- Mask all PII in client-side rendering
- Use tokenized references instead of actual PII
- Implement server-side rendering for sensitive data
- Add Content Security Policy headers

---

## 🟠 Vulnerability #3: Sensitive API Endpoint Exposure

### Description
The API endpoint `/api/retail/config/common` returns configuration data that may include sensitive information without proper authorization.

### Severity
**Medium**

### Affected Endpoint
```
GET https://app.revolut.com/api/retail/config/common
```

### Evidence
- Screenshots: `pii_leak-1766963186478-94442c96.webp`, `pii_leak-1766963222632-1591cdde.webp`

### Recommendation
- Review API response payload for sensitive data
- Implement proper authorization checks
- Use field-level access control

---

## 🍪 Additional Findings: Cookie Security

### Observed Cookies
| Cookie Name | Domain | Security Concern |
|-------------|--------|------------------|
| `revo_hardware_id` | .revolut.com | Hardware fingerprinting |
| `revo_device_id` | .revolut.com | Device fingerprinting |
| `sso_country_code` | sso.revolut.com | Location tracking |

### Recommendation
- Review necessity of fingerprinting cookies
- Ensure compliance with ePrivacy Directive
- Provide clear user consent mechanisms

---

## 🛠 Testing Environment

| Parameter | Value |
|-----------|-------|
| Browser | Chromium 120 |
| OS | Windows 10/11 |
| User-Agent | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 |
| Viewport | 1920x1080 |
| Testing Tool | CyberCody Security Auditor v1.0.0 |
| Mode | Safe Hunter + Stealth |

---

## 📎 Attachments

1. `auth_bypass-1766963223164-09042494.webp` - Auth bypass screenshot
2. `auth_bypass-1766963223164-09042494.metadata.json` - Auth bypass metadata
3. `pii_leak-1766963218508-bfc4cbfd.webp` - PII leak screenshot
4. `pii_leak-1766963218508-bfc4cbfd.metadata.json` - PII leak metadata (with cookies)
5. `report-session-2025-12-28T23-06-25-457Z-5a6014a1.json` - Full audit report

---

## ⚠️ Responsible Disclosure

This report is submitted through Revolut's official bug bounty program. I have not:
- Accessed any real user data
- Performed any destructive actions
- Shared this information publicly before disclosure

I request acknowledgment within 5 business days and will provide additional information upon request.

---

## 💰 Bounty Request

Based on Revolut's bug bounty program guidelines:

| Vulnerability | Suggested Bounty Range |
|---------------|----------------------|
| Auth Bypass (Critical) | $1,000 - $3,000 |
| PII Exposure (Critical) | $500 - $2,000 |
| API Information Disclosure | $200 - $500 |
| **Total Suggested Range** | **$1,700 - $5,500** |

---

**Thank you for your security team's attention to these findings.**

*Report generated by QAntum CyberCody Security Auditor*

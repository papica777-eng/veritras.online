# Aeterna QA SaaS - CI/CD Setup

This document outlines the CI/CD setup for the Aeterna QA SaaS platform, including GitHub Actions workflows and self-hosted runner requirements.

## GitHub Actions Workflow

### CI Pipeline (`ci.yml`)

The CI pipeline runs on:
- Pull requests to `main` and `develop` branches
- Pushes to `main` and `develop` branches

**Jobs:**
1. **Lint & Build** - Runs on self-hosted runners with label `singularity-agent`

**Steps:**
1. Checkout code
2. Setup Node.js 20 with pnpm caching
3. Install dependencies with frozen lockfile
4. Type check packages
5. Build all applications
6. Run tests (if available)

## Self-Hosted Runner Requirements

### Prerequisites

The self-hosted runner must have the following installed:

#### System Requirements
- **OS**: Windows 10/11, Ubuntu 20.04+, or macOS 11+
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 10GB+ free space

#### Required Software
- **Node.js**: Version 20.x (LTS)
- **pnpm**: Version 9.15.0+
- **Git**: Latest version
- **Redis**: For API job queue (optional for builds)

#### Browser Dependencies (for E2E tests)
- **Google Chrome** or **Chromium** (latest stable)
- **Firefox** (optional)
- **WebKit** (optional, via Playwright)

### Installation Steps

1. **Install Node.js 20**
   ```bash
   # Windows (using winget)
   winget install OpenJS.NodeJS

   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # macOS
   brew install node@20
   ```

2. **Install pnpm**
   ```bash
   npm install -g pnpm@9.15.0
   ```

3. **Install Git**
   ```bash
   # Windows: Download from https://git-scm.com/download/win
   # Ubuntu: sudo apt-get install git
   # macOS: brew install git
   ```

4. **Install Redis (optional)**
   ```bash
   # Windows: Download from https://redis.io/download
   # Ubuntu: sudo apt-get install redis-server
   # macOS: brew install redis
   ```

5. **Install browsers for Playwright**
   ```bash
   # Install Playwright browsers
   npx playwright install chromium firefox webkit
   ```

### Runner Labels

Configure the runner with these labels:
- `self-hosted`
- `singularity-agent`
- `windows` / `linux` / `macos` (based on OS)

### Environment Variables

Set these environment variables on the runner:

```bash
# Node.js configuration
NODE_ENV=production

# Redis configuration (if installed)
REDIS_HOST=localhost
REDIS_PORT=6379

# API configuration
API_URL=http://localhost:3000
```

## Workspace Structure

```
.
├── apps/
│   ├── api/          # Fastify API server
│   ├── dashboard/    # Next.js dashboard
│   └── worker/       # Test execution worker
├── packages/
│   └── cli/          # CLI tool for CI/CD
├── .github/
│   └── workflows/    # GitHub Actions
└── pnpm-workspace.yaml
```

## Build Scripts

### Root Level
```bash
pnpm install          # Install all dependencies
pnpm build           # Build all apps
pnpm dev:api         # Start API in dev mode
pnpm dev:dashboard   # Start dashboard in dev mode
```

### API (apps/api)
```bash
pnpm build           # Build ESM bundle
pnpm dev             # Development with hot reload
pnpm start           # Production server
```

### Dashboard (apps/dashboard)
```bash
pnpm build           # Next.js production build
pnpm dev             # Development server (port 3001)
pnpm start           # Production server
```

### CLI (packages/cli)
```bash
pnpm build           # TypeScript compilation check
pnpm dev             # Watch mode
pnpm start           # Run CLI
```

## Troubleshooting

### Common Issues

1. **pnpm install fails**
   - Clear pnpm cache: `pnpm store prune`
   - Delete node_modules: `rm -rf node_modules && pnpm install`

2. **Build fails with missing dependencies**
   - Ensure all peer dependencies are installed
   - Check that workspace configuration is correct

3. **Runner connectivity issues**
   - Verify runner labels match workflow requirements
   - Check runner logs for connection errors
   - Ensure runner has internet access

4. **TypeScript errors**
   - Run `pnpm build` to see detailed errors
   - Check TypeScript configuration in each package

### Logs and Debugging

- **Runner logs**: Available in GitHub Actions UI
- **Build artifacts**: Check `.next/` and `dist/` folders
- **Workspace cache**: Located in `node_modules/.cache`

## Security Considerations

- Self-hosted runners should be in a secure network
- Use secrets for sensitive environment variables
- Regularly update runner software and dependencies
- Monitor runner usage and resource consumption

## Contributing

When adding new packages or modifying the build:

1. Update `pnpm-workspace.yaml` if adding new packages
2. Add appropriate scripts to `package.json`
3. Update this documentation
4. Test builds locally before pushing

## Support

For issues with CI/CD setup:
1. Check runner logs in GitHub Actions
2. Verify local build works: `pnpm build`
3. Check network connectivity and dependencies
4. Review runner prerequisites above

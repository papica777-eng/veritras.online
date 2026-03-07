"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🚀 QANTUM CI/CD GENERATOR                                                ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Генерира GitHub Actions, Azure DevOps, GitLab CI pipelines               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m'
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
// ═══════════════════════════════════════════════════════════════════════════════
// GITHUB ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const GITHUB_ACTIONS_CI = `name: QAntum CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ═══════════════════════════════════════════════════════════════════════════
  # LINT & TYPE CHECK
  # ═══════════════════════════════════════════════════════════════════════════
  lint:
    name: 🔍 Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint || true
      
      - name: TypeScript Check
        run: npx tsc --noEmit

  # ═══════════════════════════════════════════════════════════════════════════
  # UNIT TESTS
  # ═══════════════════════════════════════════════════════════════════════════
  test:
    name: 🧪 Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  # ═══════════════════════════════════════════════════════════════════════════
  # BUILD
  # ═══════════════════════════════════════════════════════════════════════════
  build:
    name: 🔨 Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # ═══════════════════════════════════════════════════════════════════════════
  # SECURITY AUDIT
  # ═══════════════════════════════════════════════════════════════════════════
  security:
    name: 🔐 Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: NPM Audit
        run: npm audit --audit-level=high || true
      
      - name: Check for secrets
        run: |
          if grep -rE "(password|secret|api_key|apikey)\\s*=\\s*['\"][^'\"]+['\"]" --include="*.ts" --include="*.js" src/; then
            echo "⚠️ Potential secrets found!"
            exit 1
          fi

  # ═══════════════════════════════════════════════════════════════════════════
  # RELEASE (only on main)
  # ═══════════════════════════════════════════════════════════════════════════
  release:
    name: 📦 Release
    runs-on: ubuntu-latest
    needs: [build, security]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Publish to NPM
        run: npm publish --access public || true
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`;
const GITHUB_ACTIONS_RELEASE = `name: QAntum Release

on:
  release:
    types: [published]

jobs:
  publish-npm:
    name: 📦 Publish to NPM
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}

  publish-docker:
    name: 🐳 Publish Docker
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: qantum/qantum:\${{ github.event.release.tag_name }}
`;
// ═══════════════════════════════════════════════════════════════════════════════
// AZURE DEVOPS
// ═══════════════════════════════════════════════════════════════════════════════
const AZURE_PIPELINES = `# QAntum Azure DevOps Pipeline
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '20.x'

stages:
  - stage: Build
    displayName: '🔨 Build & Test'
    jobs:
      - job: BuildJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '\$(nodeVersion)'
            displayName: 'Install Node.js'

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npx tsc --noEmit
            displayName: 'Type check'

          - script: npm test -- --coverage
            displayName: 'Run tests'

          - script: npm run build
            displayName: 'Build'

          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: '\$(System.DefaultWorkingDirectory)/coverage/cobertura-coverage.xml'

          - task: PublishBuildArtifacts@1
            inputs:
              pathtoPublish: 'dist'
              artifactName: 'dist'

  - stage: Security
    displayName: '🔐 Security Scan'
    dependsOn: Build
    jobs:
      - job: SecurityJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '\$(nodeVersion)'

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npm audit --audit-level=high
            displayName: 'NPM Audit'
            continueOnError: true

  - stage: Deploy
    displayName: '🚀 Deploy'
    dependsOn: Security
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployJob
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying to production..."
                  displayName: 'Deploy'
`;
// ═══════════════════════════════════════════════════════════════════════════════
// GITLAB CI
// ═══════════════════════════════════════════════════════════════════════════════
const GITLAB_CI = `# QAntum GitLab CI/CD
image: node:20

stages:
  - lint
  - test
  - build
  - security
  - deploy

cache:
  paths:
    - node_modules/

# ═══════════════════════════════════════════════════════════════════════════════
# LINT
# ═══════════════════════════════════════════════════════════════════════════════
lint:
  stage: lint
  script:
    - npm ci
    - npm run lint || true
    - npx tsc --noEmit

# ═══════════════════════════════════════════════════════════════════════════════
# TEST
# ═══════════════════════════════════════════════════════════════════════════════
test:
  stage: test
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/All files[^|]*\\|[^|]*\\s+([\\d\\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# ═══════════════════════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════════════════════
build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# ═══════════════════════════════════════════════════════════════════════════════
# SECURITY
# ═══════════════════════════════════════════════════════════════════════════════
security:
  stage: security
  script:
    - npm ci
    - npm audit --audit-level=high
  allow_failure: true

# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOY
# ═══════════════════════════════════════════════════════════════════════════════
deploy:
  stage: deploy
  script:
    - echo "Deploying..."
  only:
    - main
  environment:
    name: production
`;
// ═══════════════════════════════════════════════════════════════════════════════
// GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
class CICDGenerator {
    rootPath;
    constructor(rootPath) {
        this.rootPath = rootPath;
    }
    generateAll() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🚀 QANTUM CI/CD GENERATOR                                                ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        console.log();
        this.generateGitHubActions();
        this.generateAzureDevOps();
        this.generateGitLabCI();
        log('\n✅ All CI/CD configurations generated!', 'green');
    }
    generateGitHubActions() {
        const dir = path_1.default.join(this.rootPath, '.github', 'workflows');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        fs_1.default.writeFileSync(path_1.default.join(dir, 'ci.yml'), GITHUB_ACTIONS_CI);
        log('✅ Generated: .github/workflows/ci.yml', 'green');
        fs_1.default.writeFileSync(path_1.default.join(dir, 'release.yml'), GITHUB_ACTIONS_RELEASE);
        log('✅ Generated: .github/workflows/release.yml', 'green');
    }
    generateAzureDevOps() {
        fs_1.default.writeFileSync(path_1.default.join(this.rootPath, 'azure-pipelines.yml'), AZURE_PIPELINES);
        log('✅ Generated: azure-pipelines.yml', 'green');
    }
    generateGitLabCI() {
        fs_1.default.writeFileSync(path_1.default.join(this.rootPath, '.gitlab-ci.yml'), GITLAB_CI);
        log('✅ Generated: .gitlab-ci.yml', 'green');
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const rootPath = args[0] || process.cwd();
const generator = new CICDGenerator(rootPath);
generator.generateAll();

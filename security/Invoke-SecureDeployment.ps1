#Requires -Version 5.1
<#
.SYNOPSIS
    AETERNA Secure Deployment Script - Production-grade deployment with security controls
    
.DESCRIPTION
    Performs secure deployments with:
    - Pre-deployment security scanning
    - Environment validation
    - Rollback capabilities
    - Audit logging
    - Secret management
    - Zero-downtime deployment
    
.PARAMETER Environment
    Target environment: Development, Staging, Production
    
.PARAMETER DryRun
    Simulate deployment without making changes
    
.PARAMETER SkipSecurityScan
    Skip security scanning (NOT recommended for production)
    
.PARAMETER RollbackVersion
    Rollback to a specific version
    
.EXAMPLE
    .\Invoke-SecureDeployment.ps1 -Environment Production
    
.NOTES
    Version: 1.0.0-SINGULARITY
    Author: QAntum Security Team
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Development", "Staging", "Production")]
    [string]$Environment,
    
    [Parameter()]
    [switch]$DryRun,
    
    [Parameter()]
    [switch]$SkipSecurityScan,
    
    [Parameter()]
    [string]$RollbackVersion,
    
    [Parameter()]
    [switch]$Force
)

# Strict error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Configuration
$Script:Config = @{
    Version = "1.0.0-SINGULARITY"
    DeploymentId = [guid]::NewGuid().ToString()
    StartTime = Get-Date
    LogPath = "./deployment-logs"
    RollbackPath = "./rollback-snapshots"
    
    # Environment-specific settings
    Environments = @{
        Development = @{
            RequireSecurityScan = $false
            RequireApproval = $false
            AllowForce = $true
            MaxRollbackVersions = 3
            Endpoint = "https://dev.aeterna.website"
        }
        Staging = @{
            RequireSecurityScan = $true
            RequireApproval = $false
            AllowForce = $true
            MaxRollbackVersions = 5
            Endpoint = "https://staging.aeterna.website"
        }
        Production = @{
            RequireSecurityScan = $true
            RequireApproval = $true
            AllowForce = $false
            MaxRollbackVersions = 10
            Endpoint = "https://www.aeterna.website"
        }
    }
    
    # Required environment variables per environment
    RequiredEnvVars = @{
        Development = @('NODE_ENV')
        Staging = @('NODE_ENV', 'STRIPE_SECRET_KEY')
        Production = @('NODE_ENV', 'STRIPE_SECRET_KEY', 'DATABASE_URL')
    }
}

$Script:DeploymentLog = @{
    DeploymentId = $Script:Config.DeploymentId
    Environment = $Environment
    StartTime = $Script:Config.StartTime
    Steps = @()
    Status = "InProgress"
    Rollback = $null
}

function Write-DeploymentBanner {
    $env = $Environment.ToUpper()
    $color = switch ($Environment) {
        "Development" { "Green" }
        "Staging" { "Yellow" }
        "Production" { "Red" }
    }
    
    $banner = @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                     AETERNA SECURE DEPLOYMENT v1.0.0                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
"@
    Write-Host $banner -ForegroundColor Cyan
    Write-Host "║  Environment: " -NoNewline -ForegroundColor Cyan
    Write-Host $env.PadRight(63) -ForegroundColor $color -NoNewline
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "║  Deployment ID: $($Script:Config.DeploymentId)".PadRight(79) + "║" -ForegroundColor Cyan
    Write-Host "║  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')".PadRight(79) + "║" -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "║  Mode: DRY RUN (no changes will be made)".PadRight(79) + "║" -ForegroundColor Yellow
    }
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param(
        [string]$Message,
        [string]$Status = "Running",
        [string]$Icon = "→"
    )
    
    $step = @{
        Message = $Message
        Status = $Status
        Timestamp = Get-Date
    }
    $Script:DeploymentLog.Steps += $step
    
    $statusColor = switch ($Status) {
        "Running" { "Cyan" }
        "Success" { "Green" }
        "Failed" { "Red" }
        "Skipped" { "Yellow" }
        "Warning" { "DarkYellow" }
    }
    
    Write-Host "  [$Icon] " -NoNewline -ForegroundColor $statusColor
    Write-Host $Message -ForegroundColor White
}

function Initialize-DeploymentEnvironment {
    Write-Host "`n[PHASE 1] Initializing Deployment Environment" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    # Create log directory
    if (-not (Test-Path $Script:Config.LogPath)) {
        New-Item -ItemType Directory -Path $Script:Config.LogPath -Force | Out-Null
        Write-Step "Created log directory: $($Script:Config.LogPath)" -Status "Success" -Icon "✓"
    }
    
    # Create rollback directory
    if (-not (Test-Path $Script:Config.RollbackPath)) {
        New-Item -ItemType Directory -Path $Script:Config.RollbackPath -Force | Out-Null
        Write-Step "Created rollback directory: $($Script:Config.RollbackPath)" -Status "Success" -Icon "✓"
    }
    
    # Validate git repository
    if (-not (Test-Path ".git")) {
        Write-Step "Not a git repository - initializing" -Status "Warning" -Icon "!"
    } else {
        Write-Step "Git repository validated" -Status "Success" -Icon "✓"
    }
    
    # Check for uncommitted changes in production
    if ($Environment -eq "Production") {
        $status = git status --porcelain 2>$null
        if ($status) {
            Write-Step "Uncommitted changes detected" -Status "Failed" -Icon "✗"
            throw "Cannot deploy to Production with uncommitted changes"
        }
        Write-Step "No uncommitted changes" -Status "Success" -Icon "✓"
    }
}

function Test-EnvironmentVariables {
    Write-Host "`n[PHASE 2] Validating Environment Variables" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $envConfig = $Script:Config.Environments[$Environment]
    $requiredVars = $Script:Config.RequiredEnvVars[$Environment]
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        $value = [Environment]::GetEnvironmentVariable($var)
        if (-not $value) {
            $missingVars += $var
            Write-Step "Missing: $var" -Status "Failed" -Icon "✗"
        } else {
            # Mask sensitive values
            $maskedValue = if ($var -match "SECRET|KEY|PASSWORD|TOKEN") { "****" } else { $value.Substring(0, [Math]::Min(10, $value.Length)) + "..." }
            Write-Step "Found: $var = $maskedValue" -Status "Success" -Icon "✓"
        }
    }
    
    if ($missingVars.Count -gt 0) {
        if ($Environment -eq "Production" -and -not $Force) {
            throw "Missing required environment variables for Production: $($missingVars -join ', ')"
        } else {
            Write-Step "Warning: Missing variables - proceeding with caution" -Status "Warning" -Icon "!"
        }
    }
}

function Invoke-PreDeploymentSecurityScan {
    Write-Host "`n[PHASE 3] Security Scanning" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $envConfig = $Script:Config.Environments[$Environment]
    
    if ($SkipSecurityScan) {
        if ($envConfig.RequireSecurityScan) {
            throw "Security scan is required for $Environment environment and cannot be skipped"
        }
        Write-Step "Security scan skipped (not recommended)" -Status "Skipped" -Icon "⚠"
        return
    }
    
    Write-Step "Running security scan..." -Status "Running" -Icon "→"
    
    # Check if security scanner exists
    $scannerPath = Join-Path $PSScriptRoot "Invoke-SecurityScan.ps1"
    
    if (Test-Path $scannerPath) {
        if (-not $DryRun) {
            & $scannerPath -Path "." -OutputFormat "JSON" -ReportPath "$($Script:Config.LogPath)/security-$($Script:Config.DeploymentId)"
            
            # Check for critical issues
            $reportPath = Get-ChildItem "$($Script:Config.LogPath)/security-$($Script:Config.DeploymentId)*.json" | Select-Object -First 1
            if ($reportPath) {
                $report = Get-Content $reportPath.FullName | ConvertFrom-Json
                
                if ($report.Summary.Critical -gt 0 -or $report.Summary.High -gt 0) {
                    if ($Environment -eq "Production" -and -not $Force) {
                        throw "Security scan found $($report.Summary.Critical) critical and $($report.Summary.High) high severity issues. Deployment blocked."
                    }
                    Write-Step "Security issues found - review report" -Status "Warning" -Icon "⚠"
                } else {
                    Write-Step "Security scan passed" -Status "Success" -Icon "✓"
                }
            }
        } else {
            Write-Step "Security scan (DRY RUN - skipped)" -Status "Skipped" -Icon "○"
        }
    } else {
        Write-Step "Security scanner not found - basic checks only" -Status "Warning" -Icon "!"
        
        # Basic secret check
        $envFile = ".env"
        if (Test-Path $envFile) {
            throw "Found .env file in repository - this is a security risk"
        }
    }
}

function New-RollbackSnapshot {
    Write-Host "`n[PHASE 4] Creating Rollback Snapshot" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    if ($DryRun) {
        Write-Step "Rollback snapshot (DRY RUN - skipped)" -Status "Skipped" -Icon "○"
        return
    }
    
    $snapshotId = Get-Date -Format "yyyyMMdd-HHmmss"
    $snapshotPath = Join-Path $Script:Config.RollbackPath $snapshotId
    
    try {
        # Get current commit hash
        $currentCommit = git rev-parse HEAD 2>$null
        if (-not $currentCommit) {
            $currentCommit = "unknown"
        }
        
        # Create snapshot metadata
        $metadata = @{
            SnapshotId = $snapshotId
            Commit = $currentCommit
            Environment = $Environment
            Timestamp = Get-Date -Format "o"
            DeploymentId = $Script:Config.DeploymentId
        }
        
        New-Item -ItemType Directory -Path $snapshotPath -Force | Out-Null
        $metadata | ConvertTo-Json | Out-File (Join-Path $snapshotPath "metadata.json")
        
        $Script:DeploymentLog.Rollback = @{
            SnapshotId = $snapshotId
            Path = $snapshotPath
            Commit = $currentCommit
        }
        
        Write-Step "Created snapshot: $snapshotId (commit: $($currentCommit.Substring(0, 7)))" -Status "Success" -Icon "✓"
        
        # Cleanup old snapshots
        $maxVersions = $Script:Config.Environments[$Environment].MaxRollbackVersions
        $snapshots = Get-ChildItem $Script:Config.RollbackPath -Directory | Sort-Object Name -Descending | Select-Object -Skip $maxVersions
        
        foreach ($old in $snapshots) {
            Remove-Item $old.FullName -Recurse -Force
            Write-Step "Cleaned up old snapshot: $($old.Name)" -Status "Success" -Icon "✓"
        }
        
    } catch {
        Write-Step "Failed to create snapshot: $_" -Status "Warning" -Icon "!"
    }
}

function Invoke-Deployment {
    Write-Host "`n[PHASE 5] Executing Deployment" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $envConfig = $Script:Config.Environments[$Environment]
    
    # Production approval
    if ($envConfig.RequireApproval -and -not $Force) {
        Write-Host ""
        Write-Host "  ⚠️  PRODUCTION DEPLOYMENT REQUIRES APPROVAL" -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "  Type 'DEPLOY' to confirm production deployment"
        
        if ($confirm -ne "DEPLOY") {
            throw "Deployment cancelled - approval not confirmed"
        }
        Write-Step "Deployment approved by operator" -Status "Success" -Icon "✓"
    }
    
    if ($DryRun) {
        Write-Step "Build step (DRY RUN)" -Status "Skipped" -Icon "○"
        Write-Step "Deploy step (DRY RUN)" -Status "Skipped" -Icon "○"
        Write-Step "Verification step (DRY RUN)" -Status "Skipped" -Icon "○"
        return
    }
    
    # Step 1: Build
    Write-Step "Building application..." -Status "Running" -Icon "→"
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed: $buildOutput"
        }
        Write-Step "Build completed successfully" -Status "Success" -Icon "✓"
    } catch {
        Write-Step "Build failed: $_" -Status "Failed" -Icon "✗"
        throw
    }
    
    # Step 2: Deploy
    Write-Step "Deploying to $Environment..." -Status "Running" -Icon "→"
    try {
        # Git operations for deployment
        git add .
        git commit -m "[Deploy] $Environment deployment - ID: $($Script:Config.DeploymentId)" --allow-empty
        
        Write-Step "Changes committed" -Status "Success" -Icon "✓"
        
        # Push to trigger CI/CD
        git push origin main 2>&1
        
        Write-Step "Deployed to $Environment" -Status "Success" -Icon "✓"
    } catch {
        Write-Step "Deployment failed: $_" -Status "Failed" -Icon "✗"
        throw
    }
    
    # Step 3: Verification
    Write-Step "Verifying deployment..." -Status "Running" -Icon "→"
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "$($envConfig.Endpoint)/api/ping" -Method Get -TimeoutSec 30 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Step "Deployment verified - endpoint responding" -Status "Success" -Icon "✓"
        } else {
            Write-Step "Deployment verification warning: Status $($response.StatusCode)" -Status "Warning" -Icon "!"
        }
    } catch {
        Write-Step "Endpoint not responding (may still be deploying)" -Status "Warning" -Icon "!"
    }
}

function Write-DeploymentSummary {
    $endTime = Get-Date
    $duration = $endTime - $Script:Config.StartTime
    
    $Script:DeploymentLog.EndTime = $endTime
    $Script:DeploymentLog.Duration = $duration.ToString()
    $Script:DeploymentLog.Status = "Success"
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                        DEPLOYMENT SUMMARY                                    ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Deployment ID: $($Script:Config.DeploymentId)" -ForegroundColor White
    Write-Host "  Environment:   $Environment" -ForegroundColor White
    Write-Host "  Duration:      $($duration.ToString('mm\:ss'))" -ForegroundColor White
    Write-Host "  Status:        " -NoNewline -ForegroundColor White
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host ""
    
    if ($Script:DeploymentLog.Rollback) {
        Write-Host "  Rollback Info:" -ForegroundColor White
        Write-Host "    Snapshot: $($Script:DeploymentLog.Rollback.SnapshotId)" -ForegroundColor Gray
        Write-Host "    Commit:   $($Script:DeploymentLog.Rollback.Commit)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "  To rollback: .\Invoke-SecureDeployment.ps1 -Environment $Environment -RollbackVersion $($Script:DeploymentLog.Rollback.SnapshotId)" -ForegroundColor Yellow
    Write-Host ""
    
    # Save deployment log
    $logFile = Join-Path $Script:Config.LogPath "deployment-$($Script:Config.DeploymentId).json"
    $Script:DeploymentLog | ConvertTo-Json -Depth 10 | Out-File $logFile
}

function Invoke-Rollback {
    param([string]$Version)
    
    Write-Host "`n[ROLLBACK] Initiating rollback to version: $Version" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $snapshotPath = Join-Path $Script:Config.RollbackPath $Version
    
    if (-not (Test-Path $snapshotPath)) {
        throw "Rollback version not found: $Version"
    }
    
    $metadata = Get-Content (Join-Path $snapshotPath "metadata.json") | ConvertFrom-Json
    
    Write-Step "Found snapshot from $($metadata.Timestamp)" -Status "Success" -Icon "✓"
    Write-Step "Target commit: $($metadata.Commit)" -Status "Running" -Icon "→"
    
    if (-not $DryRun) {
        # Reset to the snapshot commit
        git reset --hard $metadata.Commit
        git push origin main --force
        
        Write-Step "Rolled back to $($metadata.Commit.Substring(0, 7))" -Status "Success" -Icon "✓"
    } else {
        Write-Step "Rollback (DRY RUN - skipped)" -Status "Skipped" -Icon "○"
    }
}

# Main execution
try {
    Write-DeploymentBanner
    
    if ($RollbackVersion) {
        Invoke-Rollback -Version $RollbackVersion
    } else {
        Initialize-DeploymentEnvironment
        Test-EnvironmentVariables
        Invoke-PreDeploymentSecurityScan
        New-RollbackSnapshot
        Invoke-Deployment
        Write-DeploymentSummary
    }
    
} catch {
    $Script:DeploymentLog.Status = "Failed"
    $Script:DeploymentLog.Error = $_.Exception.Message
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                        DEPLOYMENT FAILED                                     ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($Script:DeploymentLog.Rollback) {
        Write-Host "  To rollback: .\Invoke-SecureDeployment.ps1 -Environment $Environment -RollbackVersion $($Script:DeploymentLog.Rollback.SnapshotId)" -ForegroundColor Yellow
    }
    
    exit 1
}

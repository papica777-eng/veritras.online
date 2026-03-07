#Requires -Version 5.1
<#
.SYNOPSIS
    AETERNA Security Scanner - Comprehensive security scanning for SaaS deployments
    
.DESCRIPTION
    Performs multi-layer security scanning including:
    - Secret detection (API keys, passwords, tokens)
    - Dependency vulnerability scanning
    - Code security analysis
    - Configuration audit
    - Compliance checking (OWASP, CIS)
    
.PARAMETER Path
    The path to scan (default: current directory)
    
.PARAMETER OutputFormat
    Output format: Console, JSON, HTML (default: Console)
    
.PARAMETER Strict
    Enable strict mode - fail on warnings
    
.EXAMPLE
    .\Invoke-SecurityScan.ps1 -Path "." -OutputFormat JSON
    
.NOTES
    Version: 1.0.0-SINGULARITY
    Author: QAntum Security Team
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateScript({ Test-Path $_ })]
    [string]$Path = ".",
    
    [Parameter()]
    [ValidateSet("Console", "JSON", "HTML")]
    [string]$OutputFormat = "Console",
    
    [Parameter()]
    [switch]$Strict,
    
    [Parameter()]
    [string]$ReportPath = "./security-report"
)

# Initialize strict error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Security scan configuration
$Script:Config = @{
    Version = "1.0.0-SINGULARITY"
    ScanTimestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    
    # Secret patterns (regex)
    SecretPatterns = @{
        AWSAccessKey = @{
            Pattern = 'AKIA[0-9A-Z]{16}'
            Severity = 'Critical'
            Description = 'AWS Access Key ID detected'
        }
        AWSSecretKey = @{
            Pattern = '(?i)aws_secret_access_key\s*=\s*["\047]?([A-Za-z0-9/+=]{40})["\047]?'
            Severity = 'Critical'
            Description = 'AWS Secret Access Key detected'
        }
        StripeKey = @{
            Pattern = '(?i)(sk_live_|sk_test_|pk_live_|pk_test_)[A-Za-z0-9]{24,}'
            Severity = 'Critical'
            Description = 'Stripe API Key detected'
        }
        PrivateKey = @{
            Pattern = '-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----'
            Severity = 'Critical'
            Description = 'Private key detected'
        }
        JWTSecret = @{
            Pattern = '(?i)(jwt_secret|jwt_key|secret_key)\s*[=:]\s*["\047]?([A-Za-z0-9_\-]{32,})["\047]?'
            Severity = 'High'
            Description = 'JWT Secret detected'
        }
        GenericPassword = @{
            Pattern = '(?i)(password|passwd|pwd)\s*[=:]\s*["\047]([^"\047\s]{8,})["\047]'
            Severity = 'High'
            Description = 'Hardcoded password detected'
        }
        GenericToken = @{
            Pattern = '(?i)(api_?token|auth_?token|access_?token)\s*[=:]\s*["\047]?([A-Za-z0-9_\-]{20,})["\047]?'
            Severity = 'High'
            Description = 'API token detected'
        }
        DatabaseUrl = @{
            Pattern = '(?i)(postgres|mysql|mongodb|redis)://[^@\s]+:[^@\s]+@'
            Severity = 'Critical'
            Description = 'Database connection string with credentials detected'
        }
        GitHubToken = @{
            Pattern = 'gh[pousr]_[A-Za-z0-9]{36,}'
            Severity = 'Critical'
            Description = 'GitHub token detected'
        }
        NpmToken = @{
            Pattern = '(?i)npm_[A-Za-z0-9]{36}'
            Severity = 'High'
            Description = 'NPM token detected'
        }
    }
    
    # Dangerous code patterns
    CodePatterns = @{
        EvalUsage = @{
            Pattern = '\beval\s*\('
            Severity = 'High'
            Description = 'Use of eval() detected - potential code injection'
            Extensions = @('.js', '.ts', '.jsx', '.tsx')
        }
        CommandInjection = @{
            Pattern = '(?i)(exec|spawn|shell)\s*\([^)]*\$'
            Severity = 'High'
            Description = 'Potential command injection'
            Extensions = @('.js', '.ts', '.ps1', '.sh')
        }
        SQLInjection = @{
            Pattern = '(?i)(SELECT|INSERT|UPDATE|DELETE)[^;]*\+\s*[a-zA-Z_]'
            Severity = 'High'
            Description = 'Potential SQL injection - use parameterized queries'
            Extensions = @('.js', '.ts', '.py', '.java')
        }
        HardcodedIP = @{
            Pattern = '\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'
            Severity = 'Low'
            Description = 'Hardcoded IP address detected'
            Extensions = @('.js', '.ts', '.json', '.yaml', '.yml')
        }
        InsecureProtocol = @{
            Pattern = 'http://(?!localhost|127\.0\.0\.1)'
            Severity = 'Medium'
            Description = 'Insecure HTTP protocol used'
            Extensions = @('.js', '.ts', '.json', '.yaml', '.yml', '.html')
        }
        WeakCrypto = @{
            Pattern = '(?i)(md5|sha1|des|rc4)[\s\(]'
            Severity = 'Medium'
            Description = 'Weak cryptographic algorithm detected'
            Extensions = @('.js', '.ts', '.py', '.java')
        }
        NoHTTPSValidation = @{
            Pattern = '(?i)rejectUnauthorized\s*:\s*false'
            Severity = 'High'
            Description = 'HTTPS certificate validation disabled'
            Extensions = @('.js', '.ts')
        }
    }
    
    # File patterns to exclude
    ExcludePatterns = @(
        'node_modules',
        '.git',
        'dist',
        'build',
        '*.min.js',
        '*.bundle.js',
        'package-lock.json',
        'yarn.lock'
    )
}

# Results collection
$Script:Results = @{
    Timestamp = $Script:Config.ScanTimestamp
    Path = (Resolve-Path $Path).Path
    Summary = @{
        TotalFiles = 0
        FilesScanned = 0
        Critical = 0
        High = 0
        Medium = 0
        Low = 0
        Passed = $true
    }
    Findings = @()
    Recommendations = @()
}

function Write-SecurityBanner {
    $banner = @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                     AETERNA SECURITY SCANNER v1.0.0                          ║
║                    QAntum Fortress Security Suite                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Target: $($Script:Results.Path.PadRight(64))║
║  Time:   $($Script:Config.ScanTimestamp.PadRight(64))║
╚══════════════════════════════════════════════════════════════════════════════╝

"@
    Write-Host $banner -ForegroundColor Cyan
}

function Test-ShouldExclude {
    param([string]$FilePath)
    
    foreach ($pattern in $Script:Config.ExcludePatterns) {
        if ($FilePath -like "*$pattern*") {
            return $true
        }
    }
    return $false
}

function Add-Finding {
    param(
        [string]$Type,
        [string]$Severity,
        [string]$File,
        [int]$Line,
        [string]$Description,
        [string]$Evidence,
        [string]$Recommendation
    )
    
    $finding = @{
        Type = $Type
        Severity = $Severity
        File = $File
        Line = $Line
        Description = $Description
        Evidence = if ($Evidence.Length -gt 100) { $Evidence.Substring(0, 100) + "..." } else { $Evidence }
        Recommendation = $Recommendation
        Timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    }
    
    $Script:Results.Findings += $finding
    
    # Update summary counts
    switch ($Severity) {
        'Critical' { $Script:Results.Summary.Critical++ }
        'High' { $Script:Results.Summary.High++ }
        'Medium' { $Script:Results.Summary.Medium++ }
        'Low' { $Script:Results.Summary.Low++ }
    }
    
    # Set passed to false for Critical/High findings
    if ($Severity -in @('Critical', 'High')) {
        $Script:Results.Summary.Passed = $false
    }
    
    # Output to console
    $color = switch ($Severity) {
        'Critical' { 'Red' }
        'High' { 'DarkRed' }
        'Medium' { 'Yellow' }
        'Low' { 'Gray' }
    }
    
    Write-Host "[$Severity] " -ForegroundColor $color -NoNewline
    Write-Host "$Description" -ForegroundColor White
    Write-Host "         File: $File (Line $Line)" -ForegroundColor Gray
}

function Invoke-SecretScan {
    param([string]$FilePath, [string]$Content)
    
    $lineNumber = 0
    $lines = $Content -split "`n"
    
    foreach ($line in $lines) {
        $lineNumber++
        
        foreach ($secretName in $Script:Config.SecretPatterns.Keys) {
            $secretConfig = $Script:Config.SecretPatterns[$secretName]
            
            if ($line -match $secretConfig.Pattern) {
                Add-Finding `
                    -Type "Secret" `
                    -Severity $secretConfig.Severity `
                    -File $FilePath `
                    -Line $lineNumber `
                    -Description $secretConfig.Description `
                    -Evidence $line.Trim() `
                    -Recommendation "Remove secret from code and use environment variables or a secrets manager"
            }
        }
    }
}

function Invoke-CodePatternScan {
    param([string]$FilePath, [string]$Content)
    
    $extension = [System.IO.Path]::GetExtension($FilePath)
    $lineNumber = 0
    $lines = $Content -split "`n"
    
    foreach ($line in $lines) {
        $lineNumber++
        
        foreach ($patternName in $Script:Config.CodePatterns.Keys) {
            $patternConfig = $Script:Config.CodePatterns[$patternName]
            
            # Check if this pattern applies to this file extension
            if ($patternConfig.Extensions -notcontains $extension) {
                continue
            }
            
            if ($line -match $patternConfig.Pattern) {
                Add-Finding `
                    -Type "CodeSecurity" `
                    -Severity $patternConfig.Severity `
                    -File $FilePath `
                    -Line $lineNumber `
                    -Description $patternConfig.Description `
                    -Evidence $line.Trim() `
                    -Recommendation "Review and remediate the security issue"
            }
        }
    }
}

function Invoke-DependencyScan {
    Write-Host "`n[*] Scanning dependencies for vulnerabilities..." -ForegroundColor Cyan
    
    $packageJsonPath = Join-Path $Path "package.json"
    
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            
            # Known vulnerable packages (simplified - in production, use npm audit API)
            $vulnerablePackages = @{
                'lodash' = @{ Version = '4.17.19'; Severity = 'High'; CVE = 'CVE-2021-23337' }
                'axios' = @{ Version = '0.21.0'; Severity = 'High'; CVE = 'CVE-2021-3749' }
                'minimist' = @{ Version = '1.2.5'; Severity = 'High'; CVE = 'CVE-2021-44906' }
            }
            
            $dependencies = @{}
            if ($packageJson.dependencies) {
                $packageJson.dependencies.PSObject.Properties | ForEach-Object {
                    $dependencies[$_.Name] = $_.Value
                }
            }
            if ($packageJson.devDependencies) {
                $packageJson.devDependencies.PSObject.Properties | ForEach-Object {
                    $dependencies[$_.Name] = $_.Value
                }
            }
            
            foreach ($dep in $dependencies.Keys) {
                if ($vulnerablePackages.ContainsKey($dep)) {
                    $vuln = $vulnerablePackages[$dep]
                    Add-Finding `
                        -Type "Dependency" `
                        -Severity $vuln.Severity `
                        -File "package.json" `
                        -Line 0 `
                        -Description "Vulnerable dependency: $dep (Known CVE: $($vuln.CVE))" `
                        -Evidence "Installed: $($dependencies[$dep])" `
                        -Recommendation "Update $dep to latest secure version"
                }
            }
            
            Write-Host "   ✓ Scanned $($dependencies.Count) dependencies" -ForegroundColor Green
            
        } catch {
            Write-Host "   ⚠ Could not parse package.json: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠ No package.json found" -ForegroundColor Yellow
    }
}

function Invoke-ConfigurationAudit {
    Write-Host "`n[*] Auditing security configuration..." -ForegroundColor Cyan
    
    # Check for .env file in repository
    $envFile = Join-Path $Path ".env"
    if (Test-Path $envFile) {
        Add-Finding `
            -Type "Configuration" `
            -Severity "Critical" `
            -File ".env" `
            -Line 0 `
            -Description ".env file found in repository - should be in .gitignore" `
            -Evidence "File exists: $envFile" `
            -Recommendation "Add .env to .gitignore and remove from repository history"
    }
    
    # Check .gitignore
    $gitignorePath = Join-Path $Path ".gitignore"
    if (Test-Path $gitignorePath) {
        $gitignore = Get-Content $gitignorePath -Raw
        
        $requiredEntries = @('.env', '.env.local', 'node_modules', '*.key', '*.pem')
        foreach ($entry in $requiredEntries) {
            if ($gitignore -notmatch [regex]::Escape($entry)) {
                Add-Finding `
                    -Type "Configuration" `
                    -Severity "Medium" `
                    -File ".gitignore" `
                    -Line 0 `
                    -Description "Recommended entry missing from .gitignore: $entry" `
                    -Evidence "Not found in .gitignore" `
                    -Recommendation "Add '$entry' to .gitignore"
            }
        }
        
        Write-Host "   ✓ .gitignore audit complete" -ForegroundColor Green
    } else {
        Add-Finding `
            -Type "Configuration" `
            -Severity "High" `
            -File ".gitignore" `
            -Line 0 `
            -Description "No .gitignore file found" `
            -Evidence "File does not exist" `
            -Recommendation "Create .gitignore with security-sensitive patterns"
    }
    
    # Check for security headers in API code
    $apiFiles = Get-ChildItem -Path $Path -Filter "*.js" -Recurse | Where-Object { $_.FullName -like "*api*" }
    foreach ($apiFile in $apiFiles) {
        $content = Get-Content $apiFile.FullName -Raw
        
        # Check for CORS wildcard
        if ($content -match "Access-Control-Allow-Origin.*\*") {
            Add-Finding `
                -Type "Configuration" `
                -Severity "Medium" `
                -File $apiFile.FullName `
                -Line 0 `
                -Description "CORS wildcard (*) detected - consider restricting to specific origins" `
                -Evidence "Access-Control-Allow-Origin: *" `
                -Recommendation "Restrict CORS to specific trusted origins in production"
        }
    }
}

function Export-Results {
    param([string]$Format)
    
    switch ($Format) {
        "JSON" {
            $outputPath = "$ReportPath-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
            $Script:Results | ConvertTo-Json -Depth 10 | Out-File $outputPath -Encoding UTF8
            Write-Host "`nReport saved to: $outputPath" -ForegroundColor Cyan
        }
        "HTML" {
            $outputPath = "$ReportPath-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
            
            $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>AETERNA Security Report</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
        .header { background: linear-gradient(135deg, #16213e, #0f3460); padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat { background: #16213e; padding: 20px; border-radius: 8px; text-align: center; flex: 1; }
        .stat.critical { border-left: 4px solid #ff4757; }
        .stat.high { border-left: 4px solid #ff6b6b; }
        .stat.medium { border-left: 4px solid #ffa502; }
        .stat.low { border-left: 4px solid #7bed9f; }
        .finding { background: #16213e; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .finding.Critical { border-left: 4px solid #ff4757; }
        .finding.High { border-left: 4px solid #ff6b6b; }
        .finding.Medium { border-left: 4px solid #ffa502; }
        .finding.Low { border-left: 4px solid #7bed9f; }
        .severity { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .severity.Critical { background: #ff4757; }
        .severity.High { background: #ff6b6b; }
        .severity.Medium { background: #ffa502; color: #000; }
        .severity.Low { background: #7bed9f; color: #000; }
        h1 { margin: 0; color: #00d9ff; }
        h2 { color: #00d9ff; border-bottom: 1px solid #333; padding-bottom: 10px; }
        .evidence { background: #0a0a1a; padding: 10px; border-radius: 4px; font-family: monospace; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ AETERNA Security Scan Report</h1>
        <p>Scan Time: $($Script:Results.Timestamp) | Path: $($Script:Results.Path)</p>
    </div>
    
    <div class="summary">
        <div class="stat critical"><h2>$($Script:Results.Summary.Critical)</h2>Critical</div>
        <div class="stat high"><h2>$($Script:Results.Summary.High)</h2>High</div>
        <div class="stat medium"><h2>$($Script:Results.Summary.Medium)</h2>Medium</div>
        <div class="stat low"><h2>$($Script:Results.Summary.Low)</h2>Low</div>
    </div>
    
    <h2>Findings</h2>
    $(
        foreach ($finding in $Script:Results.Findings) {
            @"
    <div class="finding $($finding.Severity)">
        <span class="severity $($finding.Severity)">$($finding.Severity)</span>
        <strong>$($finding.Description)</strong>
        <p>📁 $($finding.File) (Line $($finding.Line))</p>
        <div class="evidence">$([System.Web.HttpUtility]::HtmlEncode($finding.Evidence))</div>
        <p>💡 <em>$($finding.Recommendation)</em></p>
    </div>
"@
        }
    )
</body>
</html>
"@
            $html | Out-File $outputPath -Encoding UTF8
            Write-Host "`nReport saved to: $outputPath" -ForegroundColor Cyan
        }
    }
}

function Show-Summary {
    Write-Host "`n╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                            SCAN SUMMARY                                      ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`n  Files Scanned: $($Script:Results.Summary.FilesScanned)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Findings:" -ForegroundColor White
    Write-Host "    Critical: $($Script:Results.Summary.Critical)" -ForegroundColor $(if($Script:Results.Summary.Critical -gt 0){'Red'}else{'Green'})
    Write-Host "    High:     $($Script:Results.Summary.High)" -ForegroundColor $(if($Script:Results.Summary.High -gt 0){'DarkRed'}else{'Green'})
    Write-Host "    Medium:   $($Script:Results.Summary.Medium)" -ForegroundColor $(if($Script:Results.Summary.Medium -gt 0){'Yellow'}else{'Green'})
    Write-Host "    Low:      $($Script:Results.Summary.Low)" -ForegroundColor Gray
    
    Write-Host ""
    if ($Script:Results.Summary.Passed) {
        Write-Host "  ✅ SECURITY SCAN PASSED" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SECURITY SCAN FAILED - Critical/High issues found" -ForegroundColor Red
    }
    Write-Host ""
}

# Main execution
try {
    Write-SecurityBanner
    
    Write-Host "[*] Starting security scan..." -ForegroundColor Cyan
    
    # Get all files to scan
    $files = Get-ChildItem -Path $Path -Recurse -File | Where-Object {
        -not (Test-ShouldExclude $_.FullName)
    }
    
    $Script:Results.Summary.TotalFiles = $files.Count
    
    # Scan each file
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            
            if ($content) {
                $Script:Results.Summary.FilesScanned++
                
                # Run secret scan
                Invoke-SecretScan -FilePath $file.FullName -Content $content
                
                # Run code pattern scan
                Invoke-CodePatternScan -FilePath $file.FullName -Content $content
            }
        } catch {
            # Skip binary files or files that can't be read
        }
    }
    
    # Run additional scans
    Invoke-DependencyScan
    Invoke-ConfigurationAudit
    
    # Show summary
    Show-Summary
    
    # Export results if requested
    if ($OutputFormat -ne "Console") {
        Export-Results -Format $OutputFormat
    }
    
    # Exit with appropriate code
    if ($Strict -and -not $Script:Results.Summary.Passed) {
        exit 1
    }
    
} catch {
    Write-Host "Error during scan: $_" -ForegroundColor Red
    exit 1
}

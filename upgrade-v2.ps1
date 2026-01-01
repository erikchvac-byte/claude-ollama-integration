# Upgrade to Claude + Ollama Integration v2.0
# Adds routing decision logging and pattern analysis

Write-Host "🚀 Upgrading Claude + Ollama Integration to v2.0" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Paths
$mcpServerPath = "$env:USERPROFILE\.claude\mcp-servers\ollama-mcp-server"
$scriptDir = $PSScriptRoot

# Check if MCP server exists
if (!(Test-Path $mcpServerPath)) {
    Write-Host "❌ MCP server not found at: $mcpServerPath" -ForegroundColor Red
    Write-Host "Please install the base integration first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found MCP server at: $mcpServerPath" -ForegroundColor Green
Write-Host ""

# Backup existing files
Write-Host "[1/5] Backing up existing files..." -ForegroundColor Cyan
$backupDir = "$mcpServerPath\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item "$mcpServerPath\index.js" -Destination "$backupDir\index.js"
Copy-Item "$mcpServerPath\task-complexity-analyzer.js" -Destination "$backupDir\task-complexity-analyzer.js"
Write-Host "  ✓ Backed up to: $backupDir" -ForegroundColor Gray

# Install new files
Write-Host ""
Write-Host "[2/5] Installing v2.0 files..." -ForegroundColor Cyan

# Task complexity analyzer with domain keywords
Copy-Item "$scriptDir\task-complexity-analyzer-v2.js" -Destination "$mcpServerPath\task-complexity-analyzer.js"
Write-Host "  ✓ Updated task-complexity-analyzer.js (added domain keywords)" -ForegroundColor Gray

# Routing logger
Copy-Item "$scriptDir\routing-logger.js" -Destination "$mcpServerPath\routing-logger.js"
Write-Host "  ✓ Installed routing-logger.js (new)" -ForegroundColor Gray

# Index with logging tools
Copy-Item "$scriptDir\index-v2.js" -Destination "$mcpServerPath\index.js"
Write-Host "  ✓ Updated index.js (added logging tools)" -ForegroundColor Gray

# Update agents
Write-Host ""
Write-Host "[3/5] Updating agents..." -ForegroundColor Cyan

if (Test-Path ".\.claude\agents") {
    Copy-Item "$scriptDir\agents\task-router-v2.md" -Destination ".\.claude\agents\task-router.md"
    Write-Host "  ✓ Updated task-router.md (added logging)" -ForegroundColor Gray

    Copy-Item "$scriptDir\agents\routing-optimizer.md" -Destination ".\.claude\agents\routing-optimizer.md"
    Write-Host "  ✓ Installed routing-optimizer.md (new agent)" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  No .claude\agents directory found in current project" -ForegroundColor Yellow
    Write-Host "     Run this from a project directory to update agents" -ForegroundColor Yellow
}

# Test MCP server
Write-Host ""
Write-Host "[4/5] Testing MCP server..." -ForegroundColor Cyan
$testResult = & node "$mcpServerPath\index.js" --test 2>&1 | Select-Object -First 1
if ($testResult -match "started successfully") {
    Write-Host "  ✓ MCP server starts correctly" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  MCP server test uncertain, check manually" -ForegroundColor Yellow
}

# Initialize logging
Write-Host ""
Write-Host "[5/5] Initializing routing log..." -ForegroundColor Cyan
$logDir = "$env:USERPROFILE\.claude"
$logFile = "$logDir\routing-log.json"
if (!(Test-Path $logFile)) {
    $initialLog = @{
        decisions = @()
        metadata = @{
            version = "1.0"
            created = (Get-Date -Format "o")
        }
    } | ConvertTo-Json -Depth 10
    Set-Content -Path $logFile -Value $initialLog
    Write-Host "  ✓ Created routing-log.json" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Routing log already exists (preserving)" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Upgrade Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "What's New in v2.0:" -ForegroundColor Yellow
Write-Host "  • Domain-specific keywords (Blender, Roblox, mechs, etc.)" -ForegroundColor White
Write-Host "  • Automatic routing decision logging" -ForegroundColor White
Write-Host "  • Pattern analysis for continuous improvement" -ForegroundColor White
Write-Host "  • New @routing-optimizer agent" -ForegroundColor White
Write-Host ""
Write-Host "New MCP Tools Available:" -ForegroundColor Yellow
Write-Host "  • log_routing_decision - Records routing choices" -ForegroundColor White
Write-Host "  • get_routing_stats - View routing statistics" -ForegroundColor White
Write-Host "  • analyze_routing_patterns - Get improvement suggestions" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Restart Claude Code / VSCode" -ForegroundColor White
Write-Host "  2. Use the integration normally (logging is automatic)" -ForegroundColor White
Write-Host "  3. After 20+ tasks, run: @routing-optimizer" -ForegroundColor White
Write-Host "     to see patterns and get improvement suggestions" -ForegroundColor White
Write-Host ""
Write-Host "Rollback:" -ForegroundColor Yellow
Write-Host "  If needed, restore from: $backupDir" -ForegroundColor Gray
Write-Host ""

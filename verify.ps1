# Verify Ollama Integration Setup
# Usage: .\verify.ps1 [project_path]

param(
    [string]$ProjectPath = "."
)

$ProjectPath = Resolve-Path $ProjectPath
$AllGood = $true

Write-Host "🔍 Verifying Ollama Integration Setup" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath" -ForegroundColor Yellow
Write-Host ""

# Check 1: .mcp.json exists
Write-Host "[1/6] Checking .mcp.json..." -ForegroundColor Cyan
if (Test-Path "$ProjectPath\.mcp.json") {
    Write-Host "  ✅ .mcp.json found" -ForegroundColor Green
} else {
    Write-Host "  ❌ .mcp.json not found" -ForegroundColor Red
    Write-Host "     Run: .\install.ps1 $ProjectPath" -ForegroundColor Yellow
    $AllGood = $false
}

# Check 2: Agents directory exists
Write-Host "[2/6] Checking agents directory..." -ForegroundColor Cyan
if (Test-Path "$ProjectPath\.claude\agents") {
    Write-Host "  ✅ .claude\agents found" -ForegroundColor Green
} else {
    Write-Host "  ❌ .claude\agents not found" -ForegroundColor Red
    $AllGood = $false
}

# Check 3: Agents exist
Write-Host "[3/6] Checking agents..." -ForegroundColor Cyan
$agents = @("task-router.md", "ollama-specialist.md", "claude-specialist.md")
$agentsMissing = @()

foreach ($agent in $agents) {
    if (Test-Path "$ProjectPath\.claude\agents\$agent") {
        Write-Host "  ✅ $agent" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $agent missing" -ForegroundColor Red
        $agentsMissing += $agent
        $AllGood = $false
    }
}

# Check 4: MCP server exists
Write-Host "[4/6] Checking MCP server..." -ForegroundColor Cyan
$mcpServerPath = "$env:USERPROFILE\.claude\mcp-servers\ollama-mcp-server\index.js"
if (Test-Path $mcpServerPath) {
    Write-Host "  ✅ MCP server found" -ForegroundColor Green
} else {
    Write-Host "  ❌ MCP server not found at:" -ForegroundColor Red
    Write-Host "     $mcpServerPath" -ForegroundColor Yellow
    $AllGood = $false
}

# Check 5: Ollama is running
Write-Host "[5/6] Checking Ollama service..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    $models = ($response.Content | ConvertFrom-Json).models
    Write-Host "  ✅ Ollama is running ($($models.Count) models)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Ollama is not running" -ForegroundColor Red
    Write-Host "     Start with: ollama serve" -ForegroundColor Yellow
    $AllGood = $false
}

# Check 6: Node.js available
Write-Host "[6/6] Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    Write-Host "  ✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found" -ForegroundColor Red
    Write-Host "     Install from: https://nodejs.org" -ForegroundColor Yellow
    $AllGood = $false
}

Write-Host ""
if ($AllGood) {
    Write-Host "🎉 All checks passed! Integration is ready to use." -ForegroundColor Green
    Write-Host ""
    Write-Host "Try it:" -ForegroundColor Cyan
    Write-Host "  'Write a function to add two numbers'" -ForegroundColor Gray
    Write-Host "  → Should route to Ollama automatically" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some checks failed. See above for details." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick fixes:" -ForegroundColor Cyan
    Write-Host "  - Missing integration: .\install.ps1" -ForegroundColor Gray
    Write-Host "  - Ollama not running: ollama serve" -ForegroundColor Gray
}

# Ollama Integration Installer for Windows
# Usage: .\install.ps1 [project_path]

param(
    [string]$ProjectPath = "."
)

$ErrorActionPreference = "Stop"

Write-Host "🤖 Ollama + Claude Integration Installer" -ForegroundColor Cyan
Write-Host ""

# Get absolute path
$ProjectPath = Resolve-Path $ProjectPath

# Get template directory (same location as this script)
$TemplateDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Installing to: $ProjectPath" -ForegroundColor Yellow
Write-Host "Template from: $TemplateDir" -ForegroundColor Yellow
Write-Host ""

# Check if .mcp.json already exists
if (Test-Path "$ProjectPath\.mcp.json") {
    Write-Host "⚠️  .mcp.json already exists in this project" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "❌ Installation cancelled" -ForegroundColor Red
        exit 1
    }
}

# Copy .mcp.json
Write-Host "📦 Copying .mcp.json..." -ForegroundColor Cyan
Copy-Item "$TemplateDir\mcp.json.template" "$ProjectPath\.mcp.json" -Force
Write-Host "✅ .mcp.json installed" -ForegroundColor Green

# Create .claude/agents directory
$AgentsDir = "$ProjectPath\.claude\agents"
if (-not (Test-Path $AgentsDir)) {
    New-Item -ItemType Directory -Path $AgentsDir -Force | Out-Null
}

# Copy agents
Write-Host "📦 Copying routing agents..." -ForegroundColor Cyan
Copy-Item "$TemplateDir\agents\task-router.md" "$AgentsDir\" -Force
Copy-Item "$TemplateDir\agents\ollama-specialist.md" "$AgentsDir\" -Force
Copy-Item "$TemplateDir\agents\claude-specialist.md" "$AgentsDir\" -Force
Write-Host "✅ Agents installed" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure Ollama is running:" -ForegroundColor White
Write-Host "     ollama serve" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Restart Claude Code (VSCode)" -ForegroundColor White
Write-Host ""
Write-Host "  3. Test the integration:" -ForegroundColor White
Write-Host "     'Write a function to add two numbers'" -ForegroundColor Gray
Write-Host "     → Should route to Ollama automatically" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: $TemplateDir\README.md" -ForegroundColor Yellow

---
event: SessionStart
---

# Auto-Install & Auto-Start Ollama Integration Hook (Windows PowerShell)

This hook checks if the current project has the Ollama integration installed,
and automatically starts Ollama if it's not running.

## Auto-start Ollama (Runs First - Most Critical)

```powershell
# Check if .mcp.json exists (integration is configured)
if (Test-Path ".mcp.json") {
    try {
        # Check if Ollama is already running
        $ollamaRunning = $false
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            $ollamaRunning = $true
        } catch {
            $ollamaRunning = $false
        }

        if (-not $ollamaRunning) {
            Write-Host "🚀 Starting Ollama service..." -ForegroundColor Yellow

            # Start Ollama in background (hidden window)
            Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction Stop

            # Wait for Ollama to start (max 5 seconds)
            $maxAttempts = 10
            $attempt = 0
            $started = $false

            while ($attempt -lt $maxAttempts -and -not $started) {
                Start-Sleep -Milliseconds 500
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 1 -UseBasicParsing -ErrorAction SilentlyContinue
                    $started = $true
                    Write-Host "✅ Ollama started successfully" -ForegroundColor Green
                } catch {
                    $attempt++
                }
            }

            if (-not $started) {
                Write-Host "⚠️  Ollama is taking longer than expected to start" -ForegroundColor Yellow
                Write-Host "   It may still be initializing in the background..." -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "⚠️  Could not auto-start Ollama: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Please start manually: ollama serve" -ForegroundColor Gray
    }
}
```

## Check 1: Is .mcp.json present?

```powershell
if (-not (Test-Path ".mcp.json")) {
    Write-Host ""
    Write-Host "🤖 Ollama Integration Not Found" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This project doesn't have the Ollama + Claude integration configured."
    Write-Host "This enables intelligent task routing between local Ollama models (free, fast)"
    Write-Host "and Claude API (deep reasoning), potentially saving `$15-50/month."
    Write-Host ""
    Write-Host "Install now? This will:"
    Write-Host "  - Copy .mcp.json to enable MCP tools"
    Write-Host "  - Copy routing agents to .claude/agents/"
    Write-Host "  - Enable automatic task complexity analysis"
    Write-Host ""

    $response = Read-Host "Install Ollama integration? (y/n)"

    if ($response -eq "y" -or $response -eq "Y") {
        $templateDir = "$env:USERPROFILE\Dev\claude-ollama-integration"

        if (Test-Path $templateDir) {
            Write-Host ""
            Write-Host "📦 Installing Ollama integration..." -ForegroundColor Yellow

            # Copy .mcp.json
            Copy-Item "$templateDir\mcp.json.template" ".mcp.json" -Force
            Write-Host "✅ Copied .mcp.json" -ForegroundColor Green

            # Create agents directory if needed
            if (-not (Test-Path ".claude\agents")) {
                New-Item -ItemType Directory -Path ".claude\agents" -Force | Out-Null
            }

            # Copy agents
            Copy-Item "$templateDir\agents\task-router.md" ".claude\agents\" -Force
            Copy-Item "$templateDir\agents\ollama-specialist.md" ".claude\agents\" -Force
            Copy-Item "$templateDir\agents\claude-specialist.md" ".claude\agents\" -Force
            Copy-Item "$templateDir\agents\routing-optimizer.md" ".claude\agents\" -Force
            Write-Host "✅ Copied routing agents" -ForegroundColor Green

            Write-Host ""
            Write-Host "🎉 Installation complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Usage:"
            Write-Host "  - Just ask questions normally - auto-routing works!"
            Write-Host "  - Run /agents to see available agents"
            Write-Host "  - Example: 'Write a function to add two numbers' → routes to Ollama"
            Write-Host ""
            Write-Host "⚠️  Restart Claude Code to activate the integration." -ForegroundColor Yellow
        } else {
            Write-Host ""
            Write-Host "❌ Error: Template not found at $templateDir" -ForegroundColor Red
            Write-Host "   Expected location: C:\Users\erikc\Dev\claude-ollama-integration" -ForegroundColor Gray
        }
    } else {
        Write-Host ""
        Write-Host "ℹ️  Skipped. Install later by copying from:" -ForegroundColor Gray
        Write-Host "   C:\Users\erikc\Dev\claude-ollama-integration" -ForegroundColor Gray
    }
}
```

## Check 2: .mcp.json exists but agents missing?

```powershell
if ((Test-Path ".mcp.json") -and -not (Test-Path ".claude\agents")) {
    Write-Host ""
    Write-Host "⚠️  Found .mcp.json but agents are missing" -ForegroundColor Yellow
    Write-Host ""

    $response = Read-Host "Install routing agents? (y/n)"

    if ($response -eq "y" -or $response -eq "Y") {
        $templateDir = "$env:USERPROFILE\Dev\claude-ollama-integration"

        if (Test-Path $templateDir) {
            # Create agents directory
            New-Item -ItemType Directory -Path ".claude\agents" -Force | Out-Null

            # Copy agents
            Copy-Item "$templateDir\agents\task-router.md" ".claude\agents\" -Force
            Copy-Item "$templateDir\agents\ollama-specialist.md" ".claude\agents\" -Force
            Copy-Item "$templateDir\agents\claude-specialist.md" ".claude\agents\" -Force
            Copy-Item "$templateDir\agents\routing-optimizer.md" ".claude\agents\" -Force

            Write-Host ""
            Write-Host "✅ Agents installed!" -ForegroundColor Green
            Write-Host "   Run /agents to see them" -ForegroundColor Gray
        }
    }
}
```

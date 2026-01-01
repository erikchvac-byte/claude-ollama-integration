---
event: SessionStart
---

# Auto-Install Ollama Integration Hook

This hook checks if the current project has the Ollama integration installed.
If not, it offers to install it automatically.

## Check 1: Is .mcp.json present?

```bash
if [ ! -f ".mcp.json" ]; then
    echo "🤖 Ollama Integration Not Found"
    echo ""
    echo "This project doesn't have the Ollama + Claude integration configured."
    echo "This enables intelligent task routing between local Ollama models (free, fast)"
    echo "and Claude API (deep reasoning), potentially saving $15-50/month."
    echo ""
    echo "Install now? This will:"
    echo "  - Copy .mcp.json to enable MCP tools"
    echo "  - Copy routing agents to .claude/agents/"
    echo "  - Enable automatic task complexity analysis"
    echo ""
    read -p "Install Ollama integration? (y/n): " INSTALL_INTEGRATION

    if [ "$INSTALL_INTEGRATION" = "y" ]; then
        TEMPLATE_DIR="$HOME/Dev/claude-ollama-integration"

        if [ -d "$TEMPLATE_DIR" ]; then
            echo "📦 Installing Ollama integration..."

            # Copy .mcp.json
            cp "$TEMPLATE_DIR/mcp.json.template" ".mcp.json"
            echo "✅ Copied .mcp.json"

            # Copy agents
            mkdir -p .claude/agents
            cp "$TEMPLATE_DIR/agents/task-router.md" ".claude/agents/"
            cp "$TEMPLATE_DIR/agents/ollama-specialist.md" ".claude/agents/"
            cp "$TEMPLATE_DIR/agents/claude-specialist.md" ".claude/agents/"
            echo "✅ Copied routing agents"

            echo ""
            echo "🎉 Installation complete!"
            echo ""
            echo "Usage:"
            echo "  - Just ask questions normally - auto-routing works!"
            echo "  - Run /agents to see available agents"
            echo "  - Example: 'Write a function to add two numbers' → routes to Ollama"
            echo ""
            echo "⚠️  Restart Claude Code to activate the integration."
        else
            echo "❌ Error: Template not found at $TEMPLATE_DIR"
            echo "   Clone from: C:\\Users\\erikc\\Dev\\claude-ollama-integration"
        fi
    else
        echo "ℹ️  Skipped. Install later by copying from:"
        echo "   C:\\Users\\erikc\\Dev\\claude-ollama-integration"
    fi
fi
```

## Check 2: .mcp.json exists but agents missing?

```bash
if [ -f ".mcp.json" ] && [ ! -d ".claude/agents" ]; then
    echo "⚠️  Found .mcp.json but agents are missing"
    echo ""
    read -p "Install routing agents? (y/n): " INSTALL_AGENTS

    if [ "$INSTALL_AGENTS" = "y" ]; then
        TEMPLATE_DIR="$HOME/Dev/claude-ollama-integration"

        mkdir -p .claude/agents
        cp "$TEMPLATE_DIR/agents/task-router.md" ".claude/agents/"
        cp "$TEMPLATE_DIR/agents/ollama-specialist.md" ".claude/agents/"
        cp "$TEMPLATE_DIR/agents/claude-specialist.md" ".claude/agents/"

        echo "✅ Agents installed!"
        echo "   Run /agents to see them"
    fi
fi
```

## Check 3: Auto-start Ollama if not running

```bash
if [ -f ".mcp.json" ]; then
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "🚀 Starting Ollama service..."
        powershell -Command "Start-Process 'ollama' -ArgumentList 'serve' -WindowStyle Hidden" > /dev/null 2>&1
        sleep 2

        # Verify it started
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "✅ Ollama started successfully"
        else
            echo "⚠️  Failed to start Ollama automatically"
            echo "   Please start manually: ollama serve"
        fi
    fi
fi
```

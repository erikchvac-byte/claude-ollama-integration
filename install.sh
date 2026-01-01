#!/bin/bash
# Ollama Integration Installer for Linux/Mac
# Usage: ./install.sh [project_path]

set -e

PROJECT_PATH="${1:-.}"
TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🤖 Ollama + Claude Integration Installer"
echo ""
echo "Installing to: $PROJECT_PATH"
echo "Template from: $TEMPLATE_DIR"
echo ""

# Check if .mcp.json already exists
if [ -f "$PROJECT_PATH/.mcp.json" ]; then
    echo "⚠️  .mcp.json already exists in this project"
    read -p "Overwrite? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "❌ Installation cancelled"
        exit 1
    fi
fi

# Copy .mcp.json
echo "📦 Copying .mcp.json..."
cp "$TEMPLATE_DIR/mcp.json.template" "$PROJECT_PATH/.mcp.json"
echo "✅ .mcp.json installed"

# Create .claude/agents directory
mkdir -p "$PROJECT_PATH/.claude/agents"

# Copy agents
echo "📦 Copying routing agents..."
cp "$TEMPLATE_DIR/agents/task-router.md" "$PROJECT_PATH/.claude/agents/"
cp "$TEMPLATE_DIR/agents/ollama-specialist.md" "$PROJECT_PATH/.claude/agents/"
cp "$TEMPLATE_DIR/agents/claude-specialist.md" "$PROJECT_PATH/.claude/agents/"
echo "✅ Agents installed"

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "Next Steps:"
echo "  1. Make sure Ollama is running:"
echo "     ollama serve"
echo ""
echo "  2. Restart Claude Code"
echo ""
echo "  3. Test the integration:"
echo "     'Write a function to add two numbers'"
echo "     → Should route to Ollama automatically"
echo ""
echo "Documentation: $TEMPLATE_DIR/README.md"

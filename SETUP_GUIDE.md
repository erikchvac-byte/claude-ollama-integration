# Ollama MCP Integration - Complete Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the Ollama MCP integration with Claude Code.

## Prerequisites

- ✅ Claude Code installed (VSCode extension or CLI)
- ✅ Ollama installed on your system
- ✅ Node.js installed (v18 or higher)

## Setup Steps

### Step 1: Verify Ollama is Running

```powershell
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve

# Or set up auto-start (recommended)
cd C:\Users\erikc\Dev\claude-ollama-integration
.\create-ollama-startup-task.ps1
```

### Step 2: Verify MCP Server Files Exist

The MCP server should be installed at:
```
C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\
```

Check that these files exist:
- `index.js` - Main server file
- `package.json` - Dependencies
- `ollama-client.js` - Ollama API client
- `task-complexity-analyzer.js` - Task routing logic
- `routing-logger.js` - Decision tracking
- `node_modules/` - Installed dependencies

If the directory doesn't exist, you'll need to copy the MCP server files from this repository.

### Step 3: Register MCP Server with Claude CLI

**⚠️ CRITICAL:** Do NOT manually edit configuration files. Use the CLI!

```powershell
# Register the MCP server (user scope - works globally)
claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"

# Verify it was registered
claude mcp list

# Expected output:
# Checking MCP server health...
# ollama-local: node C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js - ✓ Connected
```

### Step 4: Verify Configuration Files

**Check that MCP server is in the CORRECT file:**

✅ **Should be in:** `C:\Users\erikc\.claude.json`
```json
{
  "mcpServers": {
    "ollama-local": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:\\Users\\erikc\\.claude\\mcp-servers\\ollama-mcp-server\\index.js"
      ],
      "env": {
        "OLLAMA_BASE_URL": "http://localhost:11434"
      }
    }
  }
}
```

❌ **Should NOT be in:** `C:\Users\erikc\.claude\settings.json`
```json
{
  // settings.json should NOT have mcpServers section
}
```

### Step 5: Restart Claude Code

**Important:** A full restart is required for MCP servers to load.

**In VSCode:**
1. Press `Ctrl+Shift+P`
2. Type "Developer: Reload Window"
3. Or close VSCode completely and reopen

**In CLI:**
- Just restart your terminal session

### Step 6: Verify MCP Tools are Available

Test that the tools are working:

```javascript
// In Claude Code, try these commands:

// List available models
mcp__ollama-local__list_ollama_models

// Test a simple query
mcp__ollama-local__ollama_query with model "qwen2.5-coder:7b" and prompt "Hello, are you working?"

// Analyze task complexity
mcp__ollama-local__analyze_task_complexity for "Write a hello world function"

// Get routing stats
mcp__ollama-local__get_routing_stats
```

### Step 7: (Optional) Add Routing Agents

For intelligent automatic routing, add the custom agents to your project:

```powershell
# Navigate to your project
cd YOUR_PROJECT

# Create agents directory
mkdir -p .claude/agents

# Copy agents from this repo
cp C:\Users\erikc\Dev\claude-ollama-integration\agents\*.md .claude/agents/

# Verify
ls .claude/agents/
# Should show: task-router.md, ollama-specialist.md, claude-specialist.md, routing-optimizer.md
```

## Verification Checklist

- [ ] Ollama is running (`curl http://localhost:11434/api/tags` succeeds)
- [ ] MCP server files exist in `~/.claude/mcp-servers/ollama-mcp-server/`
- [ ] `claude mcp list` shows `ollama-local` as ✓ Connected
- [ ] MCP server config is in `.claude.json` (NOT in `settings.json`)
- [ ] VSCode has been fully restarted
- [ ] MCP tools are accessible (test with `list_ollama_models`)
- [ ] (Optional) Routing agents are in `.claude/agents/`

## Common Issues

### Issue 1: "MCP tools not available"

**Cause:** MCP server not properly registered or VSCode not restarted.

**Fix:**
```powershell
# Verify registration
claude mcp list

# If not listed, register it
claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"

# Restart VSCode completely
```

### Issue 2: "Connection refused to localhost:11434"

**Cause:** Ollama not running.

**Fix:**
```powershell
# Start Ollama
ollama serve

# Or set up auto-start
.\create-ollama-startup-task.ps1
```

### Issue 3: "MCP server in settings.json not working"

**Cause:** Wrong configuration file location.

**Fix:**
1. Remove `mcpServers` section from `settings.json`
2. Register via CLI: `claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"`
3. Verify it's in `.claude.json`
4. Restart VSCode

### Issue 4: "Tools show but return errors"

**Cause:** Environment variable not set or Ollama not accessible.

**Fix:**
```powershell
# Verify .claude.json has env section:
# "env": {
#   "OLLAMA_BASE_URL": "http://localhost:11434"
# }

# Test Ollama directly
curl http://localhost:11434/api/tags

# Re-register if needed
claude mcp remove ollama-local
claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"
```

## File Locations Reference

| File | Purpose | Should Contain MCP? |
|------|---------|---------------------|
| `C:\Users\erikc\.claude.json` | User state, MCP servers, sessions | ✅ YES |
| `C:\Users\erikc\.claude\settings.json` | Claude Code preferences | ❌ NO |
| `PROJECT\.mcp.json` | Project-scoped MCP servers | Optional (not needed for user-scoped) |

## Testing the Integration

Once setup is complete, test the full workflow:

```powershell
# Start a new Claude Code session

# Test 1: List models
"Use list_ollama_models to show available models"

# Test 2: Simple query
"Use ollama_query with qwen2.5-coder:7b to write a hello world function"

# Test 3: Task analysis
"Use analyze_task_complexity to evaluate: refactor authentication system"

# Test 4: Routing stats (after a few uses)
"Use get_routing_stats to show my routing patterns"
```

## Next Steps

1. **Use the integration** - Just ask questions normally, routing happens automatically
2. **Monitor decisions** - Check `~/.claude/routing-log.json` to see routing choices
3. **Analyze patterns** - After 20+ tasks, use `@routing-optimizer` for improvement suggestions
4. **Customize thresholds** - Edit `task-complexity-analyzer.js` to tune routing behavior

## Support

If you encounter issues not covered here:

1. Run `claude mcp list` and verify server status
2. Check `~/.claude/routing-log.json` for decision history
3. Test MCP server manually: `node ~/.claude/mcp-servers/ollama-mcp-server/index.js`
4. Verify Ollama: `curl http://localhost:11434/api/tags`
5. Check this repository's issues or documentation

---

**Last Updated:** 2026-01-01
**Version:** 2.0.1

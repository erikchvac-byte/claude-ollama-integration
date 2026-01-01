# Claude Code + Ollama Integration v2.0

**Self-improving task routing between local Ollama models (fast, free) and Claude API (deep reasoning)**

## What This Is

A complete integration system that lets Claude Code automatically route tasks to the most appropriate model:
- **Simple tasks** → Local Ollama models (free, 1-3s response)
- **Complex tasks** → Claude API (accurate, deep reasoning)
- **🆕 Self-Learning** → Tracks decisions, analyzes patterns, suggests improvements

Saves $15-50/month in API costs while maintaining quality.

## ✨ What's New in v2.0

- 🧠 **Self-Improving Routing** - System learns from your usage patterns
- 📊 **Automatic Logging** - Tracks every routing decision transparently
- 🔍 **Pattern Analysis** - New `routing-optimizer` agent analyzes your workflow
- 🎯 **Domain Keywords** - Better recognition of Roblox, Blender, game dev tasks
- 💡 **Smart Suggestions** - After 20+ tasks, get personalized improvement recommendations
- 🔄 **Auto-Start Ollama** - SessionStart hook automatically starts Ollama after PC restart (PowerShell-based for Windows reliability)

### v1.0 Features

- 🚀 **Auto-Install Hook** - Detects missing integration and offers to install automatically
- ✅ **Verification Script** - Validates your setup with `verify.ps1`
- 📦 **One-Command Install** - `.\install.ps1` sets up any project instantly
- 📖 **Conversation Log** - Full design decisions in [CONVERSATION.md](CONVERSATION.md)

---

## Quick Start (5 Minutes)

### Prerequisites
- Claude Code (VSCode extension or CLI)
- Ollama installed and running (`ollama serve`)
- Node.js installed

### 1. Verify MCP Server Exists

The MCP server should already be installed at:
```
C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\
```

If not, see [MCP Server Setup](#mcp-server-setup) below.

### 2. Add to Your Project

Copy these files to your project:

```powershell
# Minimal setup (MCP tools only)
cp mcp.json.template YOUR_PROJECT/.mcp.json

# Full setup (with intelligent routing agents)
cp mcp.json.template YOUR_PROJECT/.mcp.json
cp -r agents/ YOUR_PROJECT/.claude/agents/
```

### 3. Start Using

Restart Claude Code, then just ask questions normally:

```
"Write a function to calculate distance"
→ Auto-routes to Ollama (qwen2.5-coder:7b)
→ Returns in ~2s
→ Cost savings: $0.08
```

---

## System Architecture

```
Your Question
     ↓
task-router (analyzes complexity)
     ↓
   ┌─────────────┐
   │  Decision   │
   └─────────────┘
     ↙         ↘
Ollama          Claude
(Free)          (Paid)
```

### Components

1. **MCP Server** (`~/.claude/mcp-servers/ollama-mcp-server/`)
   - Exposes Ollama as MCP tools
   - Global, works for all projects

2. **Custom Agents** (`agents/`)
   - `task-router.md` - Analyzes & routes tasks
   - `ollama-specialist.md` - Runs on Ollama
   - `claude-specialist.md` - Handles complex tasks

3. **MCP Config** (`mcp.json.template`)
   - Copy to project as `.mcp.json`
   - Enables MCP server for that project

---

## Available Agents

### task-router (v2.0)
Analyzes complexity (0-100 score) and routes automatically. **Now logs all decisions!**
- 0-30: Ollama Only
- 31-55: Ollama Preferred
- 56-70: Either works (asks user)
- 71-100: Claude Preferred

### ollama-specialist
Executes on your local models:
- `qwen2.5-coder:7b` - Fast coding (default)
- `qwen3-coder:30b` - Complex algorithms
- `llama3` - Explanations, docs

### claude-specialist
Deep reasoning with full Claude capabilities:
- Architecture analysis
- Security assessment
- Complex debugging
- Multi-file refactoring

### 🆕 routing-optimizer
Analyzes your routing patterns and suggests improvements:
- Tracks override patterns
- Detects keyword gaps
- Recommends threshold adjustments
- Uses Ollama for analysis (fast, free)

---

## Usage Examples

### Automatic Routing (Recommended)

Just ask your question:
```
"Generate unit tests for this function"
→ Analyzes complexity
→ Routes appropriately
→ Logs decision automatically
→ Shows cost savings
```

### Manual Agent Selection

```
@ollama-specialist write hello world in Python
@claude-specialist debug this complex architecture issue
@task-router should I refactor this entire module?
@routing-optimizer analyze my routing patterns  # NEW in v2.0!
```

### Direct MCP Tools

```
# Task routing
"Use analyze_task_complexity to evaluate: [your task]"
"Use list_ollama_models"
"Use estimate_cost_and_latency for code_review task"

# NEW in v2.0: Analytics
"Use get_routing_stats"  # See your routing statistics
"Use analyze_routing_patterns"  # Get improvement suggestions
```

---

## Cost Savings

Typical savings per task:

| Task Type | Ollama Time | Claude Cost | Savings |
|-----------|-------------|-------------|---------|
| Code snippet | 2s | $0.08 | $0.08 |
| Documentation | 3s | $0.10 | $0.10 |
| Unit tests | 4s | $0.12 | $0.12 |
| Simple debug | 5s | $0.15 | $0.15 |

**Estimated monthly**: $15-50 💰

---

## Installation

### 🆕 Upgrading from v1.0 to v2.0

Already have the integration installed? Upgrade to v2.0 with one command:

```powershell
cd path\to\claude-ollama-integration
.\upgrade-v2.ps1
```

This will:
- ✅ Backup your existing setup
- ✅ Install v2.0 files (domain keywords, logging, analytics)
- ✅ Update agents (add routing-optimizer)
- ✅ Preserve your configuration
- ✅ Initialize routing log

**Non-breaking:** All v1.0 configs continue to work!

### Fresh Installation

#### MCP Server Setup

If the MCP server isn't installed:

```powershell
# Create directory
mkdir -p ~/.claude/mcp-servers/ollama-mcp-server
cd ~/.claude/mcp-servers/ollama-mcp-server

# Copy from this repo (if you have the source)
# Or see docs/OLLAMA_INTEGRATION.md for full source code

# Install dependencies
npm install
```

#### Per-Project Setup

```powershell
# Copy MCP config
cp mcp.json.template YOUR_PROJECT/.mcp.json

# Copy agents (optional but recommended)
mkdir -p YOUR_PROJECT/.claude/agents
cp agents/*.md YOUR_PROJECT/.claude/agents/

# Restart Claude Code
```

---

## File Structure

```
claude-ollama-integration/
├── README.md (this file)
├── mcp.json.template (copy to projects as .mcp.json)
├── agents/
│   ├── task-router.md
│   ├── ollama-specialist.md
│   └── claude-specialist.md
└── docs/
    ├── OLLAMA_INTEGRATION.md (full documentation)
    └── QUICKSTART_OLLAMA.md (5-minute guide)
```

---

## Documentation

- **[Full Guide](docs/OLLAMA_INTEGRATION.md)** - Complete documentation
- **[Quick Start](docs/QUICKSTART_OLLAMA.md)** - 5-minute setup guide
- **[MCP Server Code](../../../.claude/mcp-servers/ollama-mcp-server/)** - Source code

---

## Troubleshooting

### Ollama Not Auto-Starting After Restart

**Expected Behavior**: SessionStart hook should auto-start Ollama when you open a project.

**If it doesn't work:**

1. **Check hook exists**:
   ```powershell
   Test-Path .claude\hooks\SessionStart.md
   # Should return: True
   ```

2. **Manually trigger the hook** (for testing):
   - Close and reopen VSCode/Claude Code
   - The hook runs automatically on session start
   - You should see: "✅ Ollama started successfully"

3. **Manual start** (if hook fails):
   ```powershell
   ollama serve
   # Or use Start-Process for background:
   Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
   ```

4. **Check hook is PowerShell-based**:
   - Hook should use `powershell` code blocks, not `bash`
   - See [SESSIONSTART_HOOK_UPDATE.md](SESSIONSTART_HOOK_UPDATE.md) for details

### Ollama Not Running (Manual Check)
```powershell
# Check
curl http://localhost:11434/api/tags

# Start manually
ollama serve
```

### MCP Server Not Loading
```powershell
# Test manually
node C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js
# Should output: "Ollama MCP Server v2.0 started successfully (with routing logger)"
```

### Agents Not Showing
```powershell
# Verify files exist
ls .claude/agents/
# Should show: task-router.md, ollama-specialist.md, claude-specialist.md, routing-optimizer.md

# Restart Claude Code
```

---

## Customization

### Adjust Routing Thresholds

Edit `~/.claude/mcp-servers/ollama-mcp-server/task-complexity-analyzer.js`:

```javascript
recommendModel(score, taskDescription) {
  if (score <= 30) return "OLLAMA_ONLY";      // Adjust these
  if (score <= 55) return "OLLAMA_PREFERRED"; // thresholds
  if (score <= 70) return "BOTH_CAPABLE";     // to your
  return "CLAUDE_PREFERRED";                   // preference
}
```

### Add Project-Specific Agents

Create custom agents in your project's `.claude/agents/` directory tailored to your domain.

---

## Support

If something isn't working:

1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Test MCP server: `node ~/.claude/mcp-servers/ollama-mcp-server/index.js`
3. Verify `.mcp.json` exists in your project
4. Check agents exist in `.claude/agents/`
5. Restart Claude Code/VSCode

---

## License

MIT - Use freely in any project

---

## Credits

Built for intelligent, cost-effective AI-assisted development.

**Save money. Maintain quality. Build faster.** 🚀

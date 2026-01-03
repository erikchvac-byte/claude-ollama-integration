# Claude Code + Ollama Integration v2.0

**Self-improving task routing between local Ollama models (fast, free) and Claude API (deep reasoning)**

## What This Is

A complete integration system that lets Claude Code automatically route tasks to the most appropriate model:
- **Simple tasks** → Local Ollama models (free, 1-3s response)
- **Complex tasks** → Claude API (accurate, deep reasoning)
- **🆕 Self-Learning** → Tracks decisions, analyzes patterns, suggests improvements

Saves $15-50/month in API costs while maintaining quality.

## ✨ What's New in v2.1

- 🌍 **Global Agent Setup** - Install agents once, use everywhere (recommended)
- 🤖 **Proactive Routing** - Claude automatically uses task-router for simple tasks
- 🚀 **Zero Per-Project Config** - No more copying files to every project
- ✨ **Session Persistence** - Routing works across all conversations automatically

### v2.0 Features

- 🧠 **Self-Improving Routing** - System learns from your usage patterns
- 📊 **Automatic Logging** - Tracks every routing decision transparently
- 🔍 **Pattern Analysis** - New `routing-optimizer` agent analyzes your workflow
- 🎯 **Domain Keywords** - Better recognition of Roblox, Blender, game dev tasks
- 💡 **Smart Suggestions** - After 20+ tasks, get personalized improvement recommendations
- 🔄 **Auto-Start Ollama** - Windows Scheduled Task ensures Ollama starts on login (most reliable for Windows)

### v1.0 Features

- 🚀 **Auto-Install Hook** - Detects missing integration and offers to install automatically
- ✅ **Verification Script** - Validates your setup with `verify.ps1`
- 📦 **One-Command Install** - `.\install.ps1` sets up any project instantly
- 📖 **Conversation Log** - Full design decisions in [CONVERSATION.md](CONVERSATION.md)

---

## Quick Start (3 Minutes - Global Setup)

### Prerequisites
- Claude Code (VSCode extension or CLI)
- Ollama installed and running (`ollama serve`)
- Node.js installed

### 1. Install MCP Server Globally

**Important:** MCP servers must be registered via the Claude CLI, not manually configured in settings files.

```powershell
# Add the MCP server to your global Claude configuration
claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"

# Verify it was added
claude mcp list
# Should show: ollama-local: ... - ✓ Connected
```

This adds the server to `~/.claude.json` (user scope), making it available across all projects.

If the MCP server files don't exist yet, see [MCP Server Setup](#mcp-server-setup) below.

### 2. Install Routing Agents Globally (Recommended)

**NEW:** Install agents globally so they're available in every project automatically:

```powershell
# Copy routing agents to your global Claude directory
cp agents/*.md ~/.claude/agents/
# Or on Windows:
cp agents/*.md C:\Users\YOUR_USERNAME\.claude\agents\
```

**Why global?**
- ✅ Works in every project, every conversation
- ✅ No per-project setup needed
- ✅ Always available via @mention

**Note:** You don't need `.mcp.json` files anymore! User-scoped MCP servers work across all projects automatically.

### 3. Start Using

Restart Claude Code (or VS Code), then choose your preferred workflow:

**Option A: Proactive Routing (Recommended)**
```
You: "Write a function to calculate distance"
Claude: [Automatically uses @task-router for simple tasks]
→ Routes to Ollama (qwen2.5-coder:7b)
→ Returns in ~2s
→ Cost savings: $0.08
```

**Option B: Manual Agent Invocation**
```
@task-router Write a function to calculate distance
→ Analyzes complexity
→ Routes to appropriate model
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
   - Registered globally via CLI (`claude mcp add`)
   - Works for all projects automatically

2. **Custom Agents** (`~/.claude/agents/` - **GLOBAL INSTALL RECOMMENDED**)
   - `task-router.md` - Analyzes & routes tasks
   - `ollama-specialist.md` - Runs on Ollama
   - `claude-specialist.md` - Handles complex tasks
   - `routing-optimizer.md` - Analyzes routing patterns
   - Available everywhere when installed globally

3. **Per-Project Config** (OPTIONAL - not needed for global setup)
   - `.mcp.json` - Only needed if you want project-specific MCP servers
   - Project-level agents in `.claude/agents/` - Only if you want project-specific routing

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

### Proactive Routing (Recommended - v2.1+)

**Global agents installed:** Claude automatically uses task-router for simple tasks!

```
You: "Generate unit tests for this function"
Claude: [Uses @task-router automatically]
→ Analyzes complexity (score: 35/100)
→ Routes to Ollama (qwen2.5-coder:7b)
→ Returns in ~2.5s
→ Cost savings: $0.12
```

**Tip:** Remind Claude at session start: "Use task-router for simple tasks"

### Manual Agent Selection

```
@task-router should I refactor this entire module?
@ollama-specialist write hello world in Python
@claude-specialist debug this complex architecture issue
@routing-optimizer analyze my routing patterns  # NEW in v2.0!
```

### Global vs Per-Project

**Global Setup (Recommended):**
- Agents installed in `~/.claude/agents/`
- Works everywhere, no per-project setup
- Consistent routing across all projects

**Per-Project Setup (Advanced):**
- Agents in `PROJECT/.claude/agents/`
- Project-specific routing rules
- Can override global behavior

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

### ⚠️ CRITICAL: MCP Servers in Wrong File

**Most common mistake:** Putting MCP servers in `settings.json` instead of `.claude.json`

❌ **Wrong:** `C:\Users\erikc\.claude\settings.json` - MCP servers here won't work!
✅ **Correct:** `C:\Users\erikc\.claude.json` - MCP servers must be here

**How to fix:**
1. Remove any `mcpServers` section from `settings.json`
2. Use CLI to properly register: `claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"`
3. Verify with `claude mcp list`
4. Restart VSCode completely

**Why this matters:**
- `settings.json` = Claude Code preferences (themes, editor settings)
- `.claude.json` = User state, MCP servers, session data
- The VSCode extension **only** reads MCP servers from `.claude.json`, never from `settings.json`

### Ollama Not Auto-Starting After Restart

**Recommended Solution**: Windows Scheduled Task (most reliable)

**Setup auto-start** (one-time):
```powershell
cd C:\Users\erikc\Dev\claude-ollama-integration
.\create-ollama-startup-task.ps1
```

This creates a Windows task that starts Ollama automatically when you log in.

**Verify task exists**:
```powershell
Get-ScheduledTask -TaskName "OllamaAutoStart"
```

**Manual start** (if needed):
```powershell
ollama serve
# Or background:
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
```

See [WINDOWS_STARTUP_TASK.md](WINDOWS_STARTUP_TASK.md) for complete details.

### Ollama Not Running (Manual Check)
```powershell
# Check
curl http://localhost:11434/api/tags

# Start manually
ollama serve
```

### MCP Server Not Loading

**Common Issue:** MCP servers in `settings.json` won't work! They must be in `.claude.json`.

```powershell
# Verify server is registered correctly
claude mcp list
# Should show: ollama-local: ... - ✓ Connected

# If not listed, add it:
claude mcp add --scope user --transport stdio ollama-local -- node "C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js"

# Test server manually
node C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js
# Should output: "Ollama MCP Server v2.0 started successfully (with routing logger)"

# Restart VSCode completely (Ctrl+Shift+P → "Developer: Reload Window")
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

# Quick Start: Ollama + Claude Integration

## 5-Minute Setup

### 1. Verify Ollama is Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags
```

If you get connection refused:
```powershell
# Windows: Start Ollama
.\start-ollama.ps1

# Or manually
ollama serve
```

### 2. Restart Claude Code (VSCode Extension)

The `.mcp.json` file in your project root is already configured. Just:

1. Close and reopen the Claude Code chat in VSCode
2. Or restart VSCode entirely

### 3. Verify Integration

In Claude Code chat, type:
```
/agents
```

You should see:
- ✅ task-router
- ✅ ollama-specialist
- ✅ claude-specialist

If you don't see them, check that `.claude/agents/` directory exists with the three `.md` files.

### 4. Test It!

Try this simple test:

```
Write a Lua function that returns the sum of two numbers
```

You should see:
- ✨ Task analyzed (complexity ~25/100)
- 🚀 Routed to Ollama
- ⚡ Result in 2-3 seconds
- 💰 Cost savings: $0.08

## Common Commands

### Check Available Models

```
@task-router list available Ollama models
```

### Force Ollama for a Task

```
@ollama-specialist write hello world in Lua
```

### Force Claude for a Task

```
@claude-specialist debug this complex issue...
```

### Analyze Task Complexity

```
@task-router analyze: Should I refactor the weapon system?
```

## Troubleshooting (30 seconds)

### MCP Server Not Loading

```bash
# Test manually
node C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\index.js

# Should output: "Ollama MCP Server started successfully"
# Press Ctrl+C to stop
```

### Agents Not Showing

Check files exist:
```bash
ls .claude/agents/
# Should show:
# - task-router.md
# - ollama-specialist.md
# - claude-specialist.md
```

### Ollama Not Responding

```bash
# Restart Ollama
taskkill /F /IM ollama.exe
ollama serve
```

## Usage Patterns

### Let the Router Decide (Recommended)

Just ask your question:
```
"Create a README for this project"
→ Auto-routes to Ollama (fast, free)

"Analyze the architecture of the weapon system"
→ Auto-routes to Claude (needs deep understanding)
```

### Manual Override

Specify the agent:
```
@ollama-specialist [simple task]
@claude-specialist [complex task]
```

## What Gets Routed Where?

### → Ollama (Fast & Free)
- Code snippets
- Simple explanations
- Documentation
- Syntax checks
- Unit test generation (simple functions)
- Format conversions

### → Claude (Deep & Accurate)
- Complex debugging
- Architecture decisions
- Security analysis
- Multi-file refactoring
- Performance optimization
- Game design decisions

## Cost Savings

Typical savings per task:
- Simple code: $0.08
- Documentation: $0.10
- Unit tests: $0.12

**Potential monthly savings**: $15-50 depending on usage

## Next Steps

1. ✅ Everything is set up!
2. ✅ Just use Claude Code normally
3. ✅ The system handles routing automatically
4. 📖 Read [OLLAMA_INTEGRATION.md](.claude/OLLAMA_INTEGRATION.md) for advanced features

**You're ready to go! Ask away and enjoy the cost savings!** 🚀

# Ollama + Claude Code Integration

## Overview

This project integrates local Ollama models with Claude Code for intelligent task routing, combining the speed and cost-effectiveness of local models with Claude's deep reasoning capabilities.

## System Architecture

```
User Request
     ↓
Task Router Agent (Haiku - fast analysis)
     ↓
Complexity Analysis (MCP Tool)
     ↓
   ┌─────────────┐
   │  Decision   │
   └─────────────┘
     ↙         ↘
Ollama          Claude
Specialist      Specialist
(Free, Fast)    (Deep Reasoning)
```

## Components

### 1. MCP Server (`~/.claude/mcp-servers/ollama-mcp-server/`)

Exposes Ollama functionality as MCP tools:

- **`ollama_query`** - Direct query to local models
- **`analyze_task_complexity`** - Determines task complexity (0-100 score)
- **`list_ollama_models`** - Shows available models
- **`estimate_cost_and_latency`** - Cost/speed comparison

### 2. Custom Subagents (`.claude/agents/`)

- **`task-router`** - Analyzes requests and routes to appropriate model
- **`ollama-specialist`** - Executes tasks on local Ollama models
- **`claude-specialist`** - Handles complex tasks requiring deep reasoning

### 3. Project Configuration (`.mcp.json`)

Registers the Ollama MCP server for this project.

## Available Ollama Models

Your system has:

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| `qwen2.5-coder:7b` | 4.7GB | Code generation, refactoring | Fast (2-3s) |
| `qwen3-coder:30b` | 18.6GB | Complex algorithms, architecture | Slower (8-12s) |
| `qwen2.5-coder:1.5b` | 986MB | Quick syntax checks | Ultra fast (1s) |
| `llama3` | 4.7GB | Explanations, documentation | Fast (2-3s) |

## Task Routing Logic

### Complexity Scoring (0-100)

The system evaluates:
- **Context Depth** - Does it need codebase understanding?
- **Reasoning Required** - Is it debugging/investigation?
- **Precision Required** - Security/critical code?
- **Creativity** - Design/architecture decisions?
- **Multi-Step Nature** - Complex workflow?

### Routing Decisions

| Score | Recommendation | Action |
|-------|----------------|--------|
| 0-30 | OLLAMA_ONLY | Route to ollama-specialist immediately |
| 31-55 | OLLAMA_PREFERRED | Use Ollama, escalate if needed |
| 56-70 | BOTH_CAPABLE | User choice or context-dependent |
| 71-100 | CLAUDE_PREFERRED | Use Claude API for accuracy |

## Usage Examples

### Simple Task → Ollama (Score: 28)

```
User: "Write a function to check if a number is prime"

[task-router analyzes]
→ Complexity: 28/100 (OLLAMA_ONLY)
→ Routes to ollama-specialist
→ Uses qwen2.5-coder:7b
→ Returns result in 2.3s
→ Cost savings: $0.12
```

### Complex Task → Claude (Score: 85)

```
User: "Debug why M6 Stalker weapons aim backwards after Blender import"

[task-router analyzes]
→ Complexity: 85/100 (CLAUDE_PREFERRED)
→ Routes to claude-specialist
→ Reads M6StalkerRigger.lua, MechController.client.lua
→ Analyzes coordinate system conversions
→ Provides detailed fix with reasoning
→ Worth the cost: $0.28 for accurate solution
```

### Moderate Task → Your Choice (Score: 62)

```
User: "Generate unit tests for WeaponManager.lua"

[task-router analyzes]
→ Complexity: 62/100 (BOTH_CAPABLE)
→ Asks: "Use Ollama (faster, free) or Claude (more comprehensive tests)?"
→ You choose based on priority
```

## How to Use

### 1. Automatic Routing (Recommended)

Just ask your question normally. The system will:
1. Analyze complexity
2. Route to appropriate model
3. Show you the decision and cost savings

Example:
```
"Write a Lua function to calculate distance between two points"
```

### 2. Explicit Routing

Mention the agent directly:

```
"@task-router analyze this and route appropriately: [your task]"
"@ollama-specialist [quick task]"
"@claude-specialist [complex task]"
```

### 3. Direct MCP Tool Usage

For advanced users:

```
Use the analyze_task_complexity tool to evaluate:
"Should I refactor the entire weapon system or just fix the aiming bug?"
```

## Cost Savings Examples

Based on typical tasks:

| Task Type | Ollama Time | Claude Time | Claude Cost | Savings |
|-----------|-------------|-------------|-------------|---------|
| Code snippet | 2s | 1s | $0.08 | $0.08 |
| Documentation | 3s | 0.8s | $0.10 | $0.10 |
| Simple debug | 4s | 1.2s | $0.15 | $0.15 |
| Unit test gen | 5s | 1.5s | $0.12 | $0.12 |

**Potential monthly savings**: $15-50 depending on usage

## Troubleshooting

### Ollama Not Running

```
Error: "Ollama not running at http://localhost:11434"

Fix: Start Ollama
→ Windows: Run start-ollama.ps1
→ Or: ollama serve
```

### Model Not Found

```
Error: "Model qwen2.5-coder:7b not found"

Fix: Pull the model
→ ollama pull qwen2.5-coder:7b
```

### MCP Server Not Loading

```
1. Check .mcp.json exists in project root
2. Verify path to index.js is correct
3. Run: node ~/.claude/mcp-servers/ollama-mcp-server/index.js (should not error)
```

### Agents Not Appearing

```
1. Check .claude/agents/ directory exists
2. Verify *.md files have proper frontmatter
3. Restart Claude Code
4. Run /agents command to see available agents
```

## Configuration

### Environment Variables

Create `.env` in project root:

```bash
# Ollama connection
OLLAMA_BASE_URL=http://localhost:11434

# Cost tracking (optional)
CLAUDE_API_BUDGET=50.00
PREFER_OLLAMA_IF_CHEAPER=true
```

### Customizing Routing Logic

Edit `.claude/mcp-servers/ollama-mcp-server/task-complexity-analyzer.js`:

```javascript
// Adjust score thresholds
recommendModel(score, taskDescription) {
  if (score <= 30) return "OLLAMA_ONLY";
  if (score <= 55) return "OLLAMA_PREFERRED";
  if (score <= 70) return "BOTH_CAPABLE";
  return "CLAUDE_PREFERRED";
}
```

## Testing the Integration

### 1. Test MCP Server

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Test MCP server (should not error)
node ~/.claude/mcp-servers/ollama-mcp-server/index.js
```

### 2. Test Agents

In Claude Code:
```
/agents
```

Should show:
- task-router
- ollama-specialist
- claude-specialist

### 3. Test Routing

Simple test:
```
@task-router "Write hello world in Lua"
```

Should route to Ollama, show cost savings.

## Integration with Cyberstrike Project

The agents are **aware of your codebase**:

- They know about Blender-Roblox integration
- They understand your server-authoritative architecture
- They follow your coding conventions
- They respect lessons learned

Example:
```
"Add a new weapon type to the game"

[claude-specialist invoked due to complexity]
→ Reads WeaponConfig.lua
→ Understands weapon system architecture
→ Follows procedural generation pattern
→ Suggests server-authoritative implementation
→ Includes test recommendations
```

## Best Practices

### 1. Let the Router Decide

Don't overthink it - just ask your question. The router is smart.

### 2. Review Cost Savings

Pay attention to cost savings messages. Builds trust in the system.

### 3. Escalate When Needed

If Ollama result is poor, say "Try again with Claude" - instant escalation.

### 4. Use Ollama for Iteration

When prototyping or exploring ideas, prefer Ollama. Switch to Claude for final implementation.

### 5. Batch Simple Tasks

Ask Ollama to generate multiple simple examples at once - very efficient.

## Future Enhancements

Potential improvements:

1. **Session cost tracking** - Track total savings per session
2. **Auto-escalation** - Automatically retry with Claude if Ollama fails
3. **Model fine-tuning** - Train routing logic based on your preferences
4. **Parallel execution** - Run both Ollama and Claude, use faster result
5. **Custom models** - Add your own fine-tuned models to Ollama

## Support

If something isn't working:

1. Check this documentation
2. Review error messages carefully
3. Test components individually (MCP server, agents, Ollama)
4. Ask Claude for help debugging the integration itself

---

**You now have intelligent, cost-effective task routing between local Ollama models and Claude API!**

Use it wisely, save money, and enjoy the best of both worlds: speed + intelligence.

# How the Claude + Ollama Integration Works

This document explains the **complete workflow** from opening a project to automatic task routing.

---

## Overview: The Three Systems

```
┌─────────────────────────────────────────────────────────────┐
│                    1. STARTUP HOOK                          │
│  (Auto-detects & offers to install integration)            │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    2. MCP SERVER                            │
│  (Provides tools: ollama_query, analyze_task_complexity)   │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    3. ROUTING AGENTS                        │
│  (task-router → ollama-specialist OR claude-specialist)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Auto-Install on Project Open

### The Startup Hook

**Location**: `.claude/hooks/SessionStart.md` (in the integration template)

**When it runs**: Every time you open a project in Claude Code

**What it does**:

```
1. Check: Does .mcp.json exist in this project?
   ↓ NO
   "🤖 Ollama Integration Not Found"
   "Install now? (y/n)"
   ↓ YES
   Copy mcp.json.template → .mcp.json
   Copy agents/*.md → .claude/agents/
   ✅ Done!

2. Check: .mcp.json exists but agents missing?
   ↓ YES
   "⚠️  Found .mcp.json but agents are missing"
   "Install routing agents? (y/n)"
   ↓ YES
   Copy agents/*.md → .claude/agents/
   ✅ Done!

3. Check: Is Ollama running?
   ↓ NO
   "⚠️  Ollama is not running!"
   "Start with: ollama serve"
```

**Example Output**:

```
🤖 Ollama Integration Not Found

This project doesn't have the Ollama + Claude integration configured.
This enables intelligent task routing between local Ollama models (free, fast)
and Claude API (deep reasoning), potentially saving $15-50/month.

Install now? This will:
  - Copy .mcp.json to enable MCP tools
  - Copy routing agents to .claude/agents/
  - Enable automatic task complexity analysis

Install Ollama integration? (y/n): y

📦 Installing Ollama integration...
✅ Copied .mcp.json
✅ Copied routing agents

🎉 Installation complete!

Usage:
  - Just ask questions normally - auto-routing works!
  - Run /agents to see available agents
  - Example: 'Write a function to add two numbers' → routes to Ollama

⚠️  Restart Claude Code to activate the integration.
```

**Why this works**:
- Users don't need to remember to install
- Offers guidance when needed
- Non-intrusive (only shows if missing)

---

## Part 2: MCP Server Architecture

### What is the MCP Server?

**Location**: `C:\Users\erikc\.claude\mcp-servers\ollama-mcp-server\`

**Purpose**: Bridges Claude Code and your local Ollama installation

**It's like**: A translator between Claude and Ollama

### The 4 MCP Tools

#### 1. `ollama_query`
**What**: Direct query to local Ollama models
**Input**:
```json
{
  "model": "qwen2.5-coder:7b",
  "prompt": "Write a function to add two numbers",
  "temperature": 0.7,
  "max_tokens": 1000
}
```
**Output**:
```
Ollama Response (qwen2.5-coder:7b):

function add(a, b) {
    return a + b;
}
```

#### 2. `analyze_task_complexity`
**What**: Scores task from 0-100 to determine routing
**Input**:
```json
{
  "task_description": "Debug why M6 Stalker weapons aim backwards",
  "available_context": "Blender import, coordinate systems"
}
```
**Output**:
```json
{
  "complexity_score": 85,
  "recommendation": "CLAUDE_PREFERRED",
  "reasoning": "Requires codebase understanding, coordinate system analysis",
  "factors": {
    "contextDepth": 85,
    "reasoning": 80,
    "precision": 90,
    "creativity": 65,
    "multiStep": 75
  }
}
```

#### 3. `list_ollama_models`
**What**: Shows installed Ollama models
**Output**:
```
Available Ollama Models:

- qwen2.5-coder:7b (4.36 GB)
- qwen3-coder:30b (17.29 GB)
- llama3:latest (4.34 GB)
```

#### 4. `estimate_cost_and_latency`
**What**: Compares Ollama vs Claude costs
**Input**:
```json
{
  "task_type": "code_review",
  "estimated_input_tokens": 500,
  "estimated_output_tokens": 300
}
```
**Output**:
```json
{
  "ollama": {
    "estimated_time_seconds": "2.50",
    "cost_usd": 0,
    "notes": "Local execution, no API costs, free"
  },
  "claude_api": {
    "estimated_time_seconds": "0.80",
    "cost_usd": "0.0084",
    "notes": "API-based, includes network latency, paid"
  },
  "comparison": {
    "speed_difference": "Ollama 212% slower",
    "cost_savings": "$0.0084 saved using Ollama",
    "recommendation": "Use Ollama (good speed, free)"
  }
}
```

### How MCP Server Starts

**Configured in** `.mcp.json`:
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

**When Claude Code starts**:
1. Reads `.mcp.json` from project root
2. Spawns `node index.js` as a subprocess
3. Communicates via stdio (standard input/output)
4. Tools become available to Claude

---

## Part 3: Routing Agents Workflow

### The Three Agents

```
task-router.md
  ↓ analyzes task
  ↓ decides route
  ┌──────┴──────┐
  ↓             ↓
ollama-       claude-
specialist    specialist
```

### Complete Workflow Example

**User asks**: `"Write a Lua function to calculate distance between two points"`

#### Step 1: task-router Activates

```lua
-- task-router receives the question
-- Calls: analyze_task_complexity MCP tool

Input to MCP:
{
  task_description: "Write a Lua function to calculate distance between two points"
}

Response from MCP:
{
  complexity_score: 28,
  recommendation: "OLLAMA_ONLY",
  reasoning: "Standard algorithm, no codebase context needed"
}
```

#### Step 2: task-router Decides

```lua
-- Score: 28/100
-- Recommendation: OLLAMA_ONLY
-- Decision: Route to ollama-specialist

task-router outputs:
"[Analyzing task complexity...]
- Complexity Score: 28/100
- Recommendation: OLLAMA_ONLY
- Reasoning: Standard algorithm, no codebase context needed

[ROUTING TO OLLAMA]
Model: qwen2.5-coder:7b (fast for code generation)
Estimated time: 2.5s
Cost savings: $0.12 vs Claude API"
```

#### Step 3: ollama-specialist Executes

```lua
-- ollama-specialist receives the delegated task
-- Selects model: qwen2.5-coder:7b (good for coding)
-- Calls: ollama_query MCP tool

Input to MCP:
{
  model: "qwen2.5-coder:7b",
  prompt: "Write a Lua function to calculate distance between two points. Use math.sqrt.",
  temperature: 0.7,
  max_tokens: 500
}

Response from MCP:
"function distance(x1, y1, x2, y2)
    local dx = x2 - x1
    local dy = y2 - y1
    return math.sqrt(dx*dx + dy*dy)
end"
```

#### Step 4: ollama-specialist Presents Result

```lua
ollama-specialist outputs:
"Ollama Response (qwen2.5-coder:7b):

function distance(x1, y1, x2, y2)
    local dx = x2 - x1
    local dy = y2 - y1
    return math.sqrt(dx*dx + dy*dy)
end

Quality check: ✓ Correct algorithm, ✓ Lua syntax, ✓ Clear
Cost savings: $0.08 vs Claude API
Time: 2.1 seconds"
```

#### Step 5: User Sees Final Result

```
✅ Task completed using Ollama (qwen2.5-coder:7b)
⏱️  Time: 2.1s
💰 Saved: $0.08

function distance(x1, y1, x2, y2)
    local dx = x2 - x1
    local dy = y2 - y1
    return math.sqrt(dx*dx + dy*dy)
end
```

---

## Complex Task Example (Routes to Claude)

**User asks**: `"Debug why the M6 Stalker mech's weapons aim backwards after Blender import"`

#### Step 1: task-router Analyzes

```
analyze_task_complexity:
  Score: 85/100
  Factors:
    - Context Depth: 85 (requires codebase understanding)
    - Reasoning: 80 (multi-step debugging)
    - Precision: 90 (game-breaking bug)
    - Creativity: 65 (design investigation)
    - Multi-Step: 75 (check import → rigging → aiming)

  Recommendation: CLAUDE_PREFERRED
```

#### Step 2: task-router Routes to Claude

```
task-router outputs:
"[Analyzing task complexity...]
- Complexity Score: 85/100
- Recommendation: CLAUDE_PREFERRED
- Reasoning: Requires codebase understanding, coordinate system analysis

[ROUTING TO CLAUDE SPECIALIST]
This task needs:
- Deep reasoning across multiple files
- Understanding Blender→Roblox coordinate conversion
- Security/correctness for game logic

Cost: ~$0.28 (worth it for accuracy)"
```

#### Step 3: claude-specialist Investigates

```
claude-specialist:
1. Read M6StalkerRigger.lua
2. Read MechController.client.lua
3. Search for "Blender" coordinate conversion
4. Analyze weapon hardpoint setup
5. Find root cause: 180° rotation applied twice
6. Provide fix with explanation
```

#### Step 4: User Sees Complete Analysis

```
✅ Task completed using Claude Sonnet 4.5
⏱️  Time: 8.3s
💰 Cost: $0.28

Root Cause:
The Blender→Roblox coordinate conversion (180° Y rotation) is being
applied twice: once in M6StalkerRigger.AddWeaponBalls() and again in
MechController.client.lua:352

Fix: Remove duplicate rotation in MechController.client.lua:352
[Shows exact code change with before/after]

Testing: [Provides verification steps]
Related: [Suggests documentation update]
```

---

## Manual Override

Users can force routing:

```
@ollama-specialist Write hello world in Python
→ Skips task-router, goes directly to Ollama

@claude-specialist Explain this simple function
→ Skips task-router, goes directly to Claude

@task-router Should I refactor the weapon system?
→ Only analyzes, asks for user decision
```

---

## File Flow Diagram

```
Project opened in Claude Code
         ↓
.claude/hooks/SessionStart.md runs
         ↓
   Checks for .mcp.json
         ↓ Missing
   Offers to copy from template
         ↓ User says YES
   Copies from ~/Dev/claude-ollama-integration/
         ↓
.mcp.json now in project
         ↓
Claude Code reads .mcp.json
         ↓
Spawns MCP server (node index.js)
         ↓
MCP tools available
         ↓
User types question
         ↓
task-router agent activates
         ↓
Calls analyze_task_complexity MCP tool
         ↓
MCP server scores the task
         ↓
task-router decides route
         ↓
      ┌──────┴──────┐
      ↓             ↓
ollama-specialist  claude-specialist
      ↓             ↓
  Ollama API    Claude API
      ↓             ↓
   Response      Response
      ↓             ↓
      └──────┬──────┘
             ↓
         User sees result
```

---

## Validation Workflow

Run `verify.ps1` to check everything:

```powershell
.\verify.ps1

🔍 Verifying Ollama Integration Setup

[1/6] Checking .mcp.json...
  ✅ .mcp.json found

[2/6] Checking agents directory...
  ✅ .claude\agents found

[3/6] Checking agents...
  ✅ task-router.md
  ✅ ollama-specialist.md
  ✅ claude-specialist.md

[4/6] Checking MCP server...
  ✅ MCP server found

[5/6] Checking Ollama service...
  ✅ Ollama is running (7 models)

[6/6] Checking Node.js...
  ✅ Node.js v20.11.0

🎉 All checks passed! Integration is ready to use.
```

---

## Summary: The Complete Loop

1. **Open project** → SessionStart hook checks for integration
2. **Missing integration** → Offers to install from template
3. **User accepts** → Copies .mcp.json + agents
4. **Claude Code restarts** → Reads .mcp.json, starts MCP server
5. **User asks question** → task-router agent analyzes
6. **MCP tool scores task** → Returns complexity 0-100
7. **Agent routes** → ollama-specialist OR claude-specialist
8. **Specialist executes** → Calls ollama_query OR uses Claude
9. **User sees result** → With time, cost, and quality info

**The magic**: All automatic, transparent, and cost-optimized! ✨

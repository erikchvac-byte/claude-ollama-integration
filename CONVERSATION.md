# Building the Claude + Ollama Integration

**Date**: January 1, 2026
**Context**: This document captures the conversation and decisions that led to building this integration system.

---

## The Problem

User had:
- Claude Code (paid) for complex development work
- Ollama (free, local) with multiple coding models
- Continue extension configured for Ollama
- **No way to intelligently route tasks between them**

Result: Either paying for all tasks (expensive) or manually switching contexts (inefficient).

---

## The Goal

Build a system that:
1. **Automatically analyzes task complexity** (0-100 score)
2. **Routes simple tasks to Ollama** (free, fast)
3. **Routes complex tasks to Claude** (accurate, deep reasoning)
4. **Works across ALL projects**, not just one
5. **Saves $15-50/month** in API costs

---

## The Solution

### Architecture Decision: MCP + Custom Agents

We chose a **three-tier architecture**:

```
User Question
     ↓
task-router agent (analyzes complexity)
     ↓
   Decision
     ↓
  ┌─────────┐
  ↓         ↓
Ollama     Claude
Specialist Specialist
```

**Why this approach?**
- ✅ Transparent: User sees routing decisions
- ✅ Flexible: Can override routing manually
- ✅ Extensible: Easy to add new agents
- ✅ Maintainable: Logic in one place (MCP server)

### Alternative Approaches Rejected

1. **Continue + Claude together**: Different tools, can't share context
2. **Manual switching**: Too slow, easy to forget
3. **Hardcoded rules**: Not adaptable to different task types

---

## Implementation Timeline

### Phase 1: Research (10 minutes)
- Spawned `claude-code-guide` agent to research MCP and Agent SDK
- Learned about MCP server architecture
- Discovered custom agent system in `.claude/agents/`

### Phase 2: MCP Server (30 minutes)
Built `ollama-mcp-server` with 4 tools:
- `ollama_query` - Direct Ollama access
- `analyze_task_complexity` - Scoring algorithm
- `list_ollama_models` - Model discovery
- `estimate_cost_and_latency` - Cost comparison

**Key Decision**: Use Node.js for MCP server (good SDK support, fast iteration)

### Phase 3: Custom Agents (20 minutes)
Created 3 markdown-based agents:
- `task-router.md` - Decision maker
- `ollama-specialist.md` - Ollama executor
- `claude-specialist.md` - Complex task handler

**Key Decision**: Markdown agents (easy to customize, no compilation needed)

### Phase 4: Project Integration (15 minutes)
- Added `.mcp.json` to Cyberstrike project
- Copied agents to `.claude/agents/`
- Tested with simple tasks

### Phase 5: Standalone Repo (20 minutes)
- Moved to `claude-ollama-integration/` directory
- Created installation scripts
- Documented everything
- Made it reusable

---

## Technical Decisions

### Task Complexity Scoring

We score tasks on 5 factors (0-100 each):

| Factor | Simple (0-30) | Complex (70-100) |
|--------|---------------|------------------|
| **Context Depth** | Single file | Entire codebase |
| **Reasoning** | Straightforward | Multi-step analysis |
| **Precision** | Low stakes | Security/critical |
| **Creativity** | Template-based | Design decisions |
| **Multi-Step** | One action | Workflow with dependencies |

**Average score determines routing**:
- 0-30: Ollama Only
- 31-55: Ollama Preferred
- 56-70: Either works
- 71-100: Claude Preferred

**Why this scoring?**
- Based on empirical testing
- Balances cost vs quality
- Conservative (prefers Claude when uncertain)

### Model Selection for Ollama

User has 7 models. We chose defaults:

| Task Type | Model | Why |
|-----------|-------|-----|
| Code generation | qwen2.5-coder:7b | Best speed/quality balance |
| Complex algorithms | qwen3-coder:30b | Highest local accuracy |
| Quick checks | qwen2.5-coder:1.5b | Ultra fast (1s) |
| Explanations | llama3 | Better for prose |

### File Organization

```
Global (works everywhere):
  ~/.claude/mcp-servers/ollama-mcp-server/

Standalone (template):
  ~/Dev/claude-ollama-integration/

Per-project (copied):
  PROJECT/.mcp.json
  PROJECT/.claude/agents/
```

**Why this split?**
- MCP server: Install once, use everywhere
- Agents: Customizable per project
- Template: Version controlled, shareable

---

## Challenges Encountered

### Challenge 1: Continue vs Claude Code Confusion

**Problem**: User thought Continue extension and Claude Code integration were related.

**Solution**: Clarified that they're separate tools:
- Continue: Code completion (uses Ollama config in `.continue/`)
- Claude Code: This integration (uses `.mcp.json` + agents)

### Challenge 2: Project-Specific vs Universal

**Problem**: Initially built inside Cyberstrike project.

**Solution**: Moved to standalone `claude-ollama-integration/` repo with installation scripts.

### Challenge 3: Ollama Connection Testing

**Problem**: Need to verify Ollama is running before routing.

**Solution**: Added health check in MCP server + startup hook validation.

---

## Key Insights

### 1. Transparency Matters

Users want to **see** routing decisions:
```
✅ Good: "Routing to Ollama (score: 28/100, saves $0.08)"
❌ Bad: *silently routes*
```

### 2. Escape Hatches Needed

Always provide manual overrides:
```
@ollama-specialist [force to Ollama]
@claude-specialist [force to Claude]
```

### 3. Cost Visibility Drives Adoption

Showing savings encourages use:
```
"Completed in 2.1s with Ollama, saved $0.08"
```

### 4. Documentation = Success

Multiple doc levels:
- README.md - Quick overview
- QUICKSTART.md - 5-minute setup
- OLLAMA_INTEGRATION.md - Full reference
- This file - Design decisions

---

## User Feedback & Iteration

### Request 1: "Move out of Cyberstrike"
✅ Created standalone repo with installation scripts

### Request 2: "Auto-install on project open"
✅ Created SessionStart hook (checks and offers install)

### Request 3: "Document this conversation"
✅ This file (CONVERSATION.md)

---

## Cost Analysis

### Before Integration
- All tasks use Claude API
- Estimated: ~500 tasks/month
- Cost: ~$40-60/month

### After Integration
- Simple tasks (60%) → Ollama (free)
- Complex tasks (40%) → Claude API
- Cost: ~$16-25/month
- **Savings: $15-50/month**

### Break-Even Time
Immediate (no setup cost, just time investment)

---

## Future Enhancements

### Potential Improvements

1. **Session Cost Tracking**
   - Track total savings per session
   - Show cumulative savings over time

2. **Auto-Escalation**
   - If Ollama gives poor result, automatically retry with Claude
   - Learn from escalation patterns

3. **Fine-Tuned Routing**
   - Train on user's routing decisions
   - Personalized complexity thresholds

4. **Parallel Execution**
   - Run both Ollama and Claude
   - Use whichever finishes first (for time-critical tasks)

5. **Project-Specific Models**
   - Roblox projects → specialized Lua model
   - Web projects → React-focused model

6. **GitHub Integration**
   - Share as public repo
   - Let others contribute routing logic

---

## Lessons Learned

### Technical

1. **MCP is powerful** - Standardized way to extend Claude Code
2. **Markdown agents are flexible** - No compilation, easy to customize
3. **Node.js for MCP** - Good SDK support, easy iteration
4. **Scoring over rules** - More adaptable than hardcoded if/else

### Process

1. **Start simple, iterate** - Built for Cyberstrike first, then generalized
2. **Test early** - Verified Ollama connection before building agents
3. **Document as you go** - Easier than retroactive documentation
4. **User feedback drives design** - The "move out of Cyberstrike" request improved the architecture

### User Experience

1. **Show, don't hide** - Transparency builds trust
2. **Provide escape hatches** - Users want control
3. **Quantify value** - Cost savings are motivating
4. **Make it easy to install** - Installer scripts = higher adoption

---

## Conclusion

We built a **universal, intelligent task routing system** that:
- ✅ Saves $15-50/month in API costs
- ✅ Works across all projects
- ✅ Self-installs with validation
- ✅ Fully documented and version controlled

**Total time**: ~2 hours
**Complexity**: Medium (MCP server + agents + tooling)
**Value**: High (ongoing cost savings + better workflow)

---

## References

- MCP Documentation: https://modelcontextprotocol.io/
- Claude Code Docs: https://code.claude.com/docs
- Ollama API: https://github.com/ollama/ollama/blob/main/docs/api.md

---

**This conversation happened on 2026-01-01 between Erik and Claude Sonnet 4.5**

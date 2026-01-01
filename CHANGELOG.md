# Changelog

All notable changes to the Claude + Ollama Integration will be documented in this file.

## [2.0.0] - 2026-01-01

### 🚀 New Features

#### Self-Improving Routing System
- **Automatic Decision Logging**: Every routing decision is now automatically logged to `~/.claude/routing-log.json`
- **Pattern Analysis**: New `routing-optimizer` agent analyzes your routing patterns and suggests improvements
- **Feedback Loop**: System learns from your manual overrides and adapts over time

#### New MCP Tools
- `log_routing_decision` - Records every routing choice with context
- `get_routing_stats` - View routing statistics and patterns
- `analyze_routing_patterns` - Get AI-generated improvement suggestions

#### New Agent
- `routing-optimizer` - Analyzes routing patterns using local Ollama, presents improvement suggestions to the user

### ✨ Improvements

#### Domain-Specific Keywords
Added keywords for better scoring of domain-specific tasks:
- **Roblox/Game Development**: "blender", "rigging", "animation", "game mechanics", "mech", "weapon system", "balancing", "game design"
- **3D/Integration**: "coordinate system", "coordinate conversion", "3d model", "blender import"
- **Debugging**: "aim backwards", "broken", "incorrect", "wrong orientation", "inverted", "flipped"
- **Precision**: "gameplay", "game-breaking", "player experience", "multiplayer", "synchronization"

**Impact**: Tasks like "Debug Blender import coordinate issues" now score correctly as high-complexity (85 context depth vs 25 before)

#### Enhanced task-router Agent
- Now automatically logs all routing decisions
- Tracks manual overrides (`@claude-specialist` or `@ollama-specialist`)
- Provides data for continuous improvement

### 📊 Analytics

- **Routing Statistics**: Track Ollama vs Claude usage, override rates, score distributions
- **Pattern Detection**: Identifies high-override score ranges, common keywords in overridden tasks
- **Improvement Suggestions**: After 20+ decisions, get specific recommendations:
  - Threshold adjustments
  - Keyword additions
  - Impact estimates

### 🔧 Technical Changes

- Upgraded MCP server to v2.0
- Added `RoutingLogger` class for decision tracking
- Enhanced `TaskAnalyzer` with 20+ new domain keywords
- Maintained backward compatibility (v1.0 configs still work)

### 📦 Installation

**New Installation**: Use `install.ps1` as before
**Upgrading from v1.0**: Run `upgrade-v2.ps1` to preserve your existing setup

### 🎯 Usage

1. **Use normally**: Logging happens automatically
2. **Check stats**: `@routing-optimizer` or use `get_routing_stats` MCP tool
3. **Get suggestions**: After 20+ tasks, `@routing-optimizer` provides improvement options
4. **Approve changes**: System never auto-applies changes, you're in control

---

## [1.0.0] - 2026-01-01

### Initial Release

#### Core Features
- Intelligent task routing between Ollama (local, free) and Claude API (paid, accurate)
- MCP server with 4 tools:
  - `ollama_query` - Direct Ollama access
  - `analyze_task_complexity` - Scoring algorithm (0-100)
  - `list_ollama_models` - Model discovery
  - `estimate_cost_and_latency` - Cost comparison

#### Agents
- `task-router` - Analyzes and routes tasks automatically
- `ollama-specialist` - Executes on local Ollama models
- `claude-specialist` - Handles complex tasks with Claude

#### Complexity Scoring
- 5-factor analysis: context depth, reasoning, precision, creativity, multi-step
- 4 routing tiers: OLLAMA_ONLY (≤30), OLLAMA_PREFERRED (31-55), BOTH_CAPABLE (56-70), CLAUDE_PREFERRED (>70)

#### Installation
- One-command setup: `install.ps1`
- Auto-install hook on project open
- Verification script: `verify.ps1`

#### Documentation
- README.md - Quick overview
- HOW_IT_WORKS.md - Technical deep-dive
- QUICKSTART_OLLAMA.md - 5-minute setup
- CONVERSATION.md - Design decisions and context

### Cost Savings
- Estimated $15-50/month savings for typical usage
- Transparent cost tracking on every decision

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to MCP tools or agent interfaces
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, documentation updates

## Upgrade Path

- v1.0 → v2.0: Run `upgrade-v2.ps1` (non-breaking, additive changes only)
- All v1.0 configurations remain valid in v2.0

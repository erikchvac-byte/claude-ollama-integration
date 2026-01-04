# Future Features

This directory contains design documents for future enhancements to the Claude-Ollama integration system.

## Planned Features

### 1. Dependency Resolver Agent
**Status**: Design Complete, Implementation Pending
**File**: [DEPENDENCY_RESOLVER_DESIGN.md](DEPENDENCY_RESOLVER_DESIGN.md)
**Priority**: High
**Timeline**: 2-4 weeks

Auto-detect and resolve libraries, data, and resources needed for coding tasks.

**Key Capabilities**:
- Static code analysis (detect imports/requires)
- Auto-installation of safe packages
- User prompting for ambiguous cases
- Alternative suggestions when packages unavailable

**Next Steps**: Implement Phase 1 (MCP tool) when ready to start development.

---

## How to Add New Feature Designs

1. Create a new `.md` file with detailed design
2. Update this README with a summary
3. Tag with status, priority, and timeline
4. Link from main project docs if relevant

---

**Note**: These are planned features, not active development. See main project [HANDOFF.md](../HANDOFF.md) for current work.

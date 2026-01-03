# Testing Ollama Integration in Your Next Project

Copy and paste this message to Claude Code when you open your next VSCode project:

---

**Test the Ollama MCP Integration:**

Please verify that the Ollama MCP server is working correctly in this project by:

1. Checking if the `mcp__ollama-local__list_ollama_models` tool is available
2. Listing all available Ollama models on my system
3. Testing a simple query using the qwen2.5-coder:7b model with the prompt "Hello, are you working?"
4. Confirming that the global configuration at `C:\Users\erikc\.claude\settings.json` is being loaded correctly

This will confirm that the global Ollama integration from my claude-ollama-integration project is working across all VSCode workspaces.

---

**Expected Outcome:**
- Claude should be able to access Ollama models globally
- No project-specific configuration should be needed
- All MCP tools (list models, query, analyze complexity, etc.) should work immediately

# Ollama Fallback Mode

## When Claude API is Unavailable

If you run out of Claude API tokens or the service is unavailable, you can still use the integration with **local Ollama models only**.

---

## How to Use Fallback Mode

### Option 1: Use @ollama-specialist Directly

Force all requests to use Ollama regardless of complexity:

```
@ollama-specialist Help me debug this code
@ollama-specialist Write a complex algorithm
@ollama-specialist Explain this architecture
```

**Benefits:**
- Works even when Claude API is down
- Completely free
- Fast for most tasks
- All 7 of your local models available

**Limitations:**
- May struggle with very complex architectural decisions
- Less accurate for security-critical code
- Won't have access to latest Claude features

### Option 2: Use Specific Models

Choose which Ollama model to use based on task complexity:

**For Simple Tasks** (use fast model):
```
Use ollama_query with model qwen2.5-coder:1.5b to write a hello world function
```

**For Moderate Tasks** (use balanced model):
```
Use ollama_query with model qwen2.5-coder:7b to implement a sorting algorithm
```

**For Complex Tasks** (use powerful model):
```
Use ollama_query with model qwen3-coder:30b to refactor this module
```

**For Explanations** (use general model):
```
Use ollama_query with model llama3 to explain how this works
```

---

## Your Available Models

Based on your Ollama installation:

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| **qwen2.5-coder:1.5b** | 0.99 GB | Quick code snippets, syntax checks | ⚡ Very Fast (1-2s) |
| **qwen2.5-coder:7b** | 4.68 GB | General coding tasks, algorithms | 🚀 Fast (2-4s) |
| **qwen3-coder:30b** | 18.56 GB | Complex refactoring, architecture | 🐢 Slower (5-10s) |
| **llama3** | 4.66 GB | Explanations, documentation | 🚀 Fast (2-4s) |

---

## Notification When Tokens Run Out

### Current Behavior

Right now, if you run out of Claude API tokens, you'll get an error message.

### Improved Behavior (Future Enhancement)

We could add an agent that:

1. **Detects when Claude API fails** due to token limits
2. **Automatically switches to Ollama** for that request
3. **Notifies you**: "Claude API unavailable, using Ollama (qwen2.5-coder:7b) instead"
4. **Offers to continue in fallback mode** until tokens refresh

**Would you like this feature?** Let me know and I can implement it!

---

## Example Fallback Session

```
You: "Help me refactor this authentication module"

System: ⚠️  Claude API tokens exhausted
        🔄 Falling back to local Ollama (qwen3-coder:30b)
        💡 This will take ~8 seconds but is free

        Continue? (y/n): y

@ollama-specialist: [Analyzes code with qwen3-coder:30b]
Here's a refactored version using modern patterns...
[Response continues...]

Completed in 7.8s using local model
Saved: Would have cost $0.45 with Claude API
```

---

## Manual Fallback Commands

### Check What's Available

```bash
# See all local models
Use list_ollama_models

# Check if Ollama is running
curl http://localhost:11434/api/tags
```

### Force Ollama for Everything

Add this to your conversation:
```
For the rest of this session, use @ollama-specialist for all tasks regardless of complexity
```

Or:
```
Prefer local models (Ollama) for all tasks unless I specifically ask for Claude
```

---

## When to Use Each Model

### qwen2.5-coder:1.5b (Ultra Fast)
- "Write a function to add two numbers"
- "Fix this syntax error"
- "Convert this JSON to YAML"
- Quick validations

### qwen2.5-coder:7b (Balanced)
- "Implement a binary search"
- "Write unit tests for this function"
- "Debug this loop"
- General coding tasks

### qwen3-coder:30b (Powerful)
- "Refactor this module for better patterns"
- "Optimize this algorithm"
- "Review this architecture"
- Complex problem-solving

### llama3 (Explanatory)
- "Explain how this works"
- "Document this API"
- "Write a README"
- Concept explanations

---

## Cost Comparison

When using Ollama fallback:

| Task | Claude API Cost | Ollama Cost | Savings |
|------|----------------|-------------|---------|
| Simple code | $0.08 | $0.00 | $0.08 |
| Unit tests | $0.12 | $0.00 | $0.12 |
| Refactoring | $0.45 | $0.00 | $0.45 |
| Documentation | $0.10 | $0.00 | $0.10 |

**If you use Ollama exclusively**, your costs are **$0.00/month** (hardware cost only).

---

## Hybrid Strategy

**Best Approach** when tokens are limited:

1. **Simple tasks** → Always use Ollama (qwen2.5-coder:7b)
2. **Moderate tasks** → Use Ollama (qwen3-coder:30b)
3. **Complex/critical tasks** → Save Claude API tokens for these
4. **Architecture decisions** → Worth using Claude when available

This maximizes your free tier and reserves premium tokens for high-value tasks.

---

## Setting Up Permanent Fallback

If you want to primarily use Ollama and only use Claude for specific tasks:

1. **Default to Ollama**:
   ```
   @task-router should prefer Ollama for all tasks unless I explicitly request Claude
   ```

2. **Override when needed**:
   ```
   @claude-specialist [for critical tasks only]
   ```

3. **Track usage**:
   ```
   Use get_routing_stats to see how much you're saving
   ```

---

## Future Feature: Smart Fallback

**Planned Enhancement:**

Create a new agent: `@smart-fallback` that:
- Monitors Claude API availability
- Automatically retries with Ollama on failure
- Learns which tasks work well on Ollama
- Suggests model upgrades when Ollama struggles

**Interest?** Let me know if you want this implemented!

---

## Summary

✅ **You can use the integration without Claude API**
✅ **7 local models available right now**
✅ **Completely free operation**
✅ **Good quality for most tasks**
✅ **Manual override always available**

**The integration works fine in "Ollama-only mode" - you're never locked out!**

#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const OllamaClient = require("./ollama-client");
const TaskAnalyzer = require("./task-complexity-analyzer");
const RoutingLogger = require("./routing-logger");

const server = new Server({
  name: "ollama-mcp-server",
  version: "2.0.0",
}, {
  capabilities: {
    tools: {},
  },
});

const ollamaClient = new OllamaClient(process.env.OLLAMA_BASE_URL || "http://localhost:11434");
const taskAnalyzer = new TaskAnalyzer();
const routingLogger = new RoutingLogger();

// Define available tools
const tools = [
  {
    name: "ollama_query",
    description: "Query a local Ollama model for fast, cost-free task completion. Best for simple code tasks, explanations, and documentation.",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          description: "Ollama model name (e.g., 'qwen2.5-coder:7b', 'qwen3-coder:30b', 'llama3')",
        },
        prompt: {
          type: "string",
          description: "The prompt/question to send to the model",
        },
        temperature: {
          type: "number",
          description: "Model temperature (0.0-2.0), lower = more deterministic",
          default: 0.7,
        },
        max_tokens: {
          type: "integer",
          description: "Maximum tokens in response",
          default: 1000,
        },
      },
      required: ["model", "prompt"],
    },
  },
  {
    name: "analyze_task_complexity",
    description: "Analyze a task to determine if local Ollama or Claude API is better suited. Returns complexity score and recommendation.",
    inputSchema: {
      type: "object",
      properties: {
        task_description: {
          type: "string",
          description: "Description of the task to analyze",
        },
        available_context: {
          type: "string",
          description: "Available context/information for the task (optional)",
        },
      },
      required: ["task_description"],
    },
  },
  {
    name: "list_ollama_models",
    description: "List all available Ollama models installed on the local system",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "estimate_cost_and_latency",
    description: "Estimate cost and latency comparison between Claude API and Ollama for a given task type",
    inputSchema: {
      type: "object",
      properties: {
        task_type: {
          type: "string",
          enum: ["code_review", "bug_fix", "documentation", "analysis", "creative"],
          description: "Type of task to estimate",
        },
        estimated_input_tokens: {
          type: "integer",
          description: "Estimated input tokens (optional, default: 500)",
        },
        estimated_output_tokens: {
          type: "integer",
          description: "Estimated output tokens (optional, default: 300)",
        },
      },
      required: ["task_type"],
    },
  },
  {
    name: "log_routing_decision",
    description: "Log a routing decision for pattern analysis and auto-tuning. Call this after making a routing choice.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task description that was routed",
        },
        score: {
          type: "integer",
          description: "Complexity score from analyze_task_complexity",
        },
        recommendation: {
          type: "string",
          enum: ["OLLAMA_ONLY", "OLLAMA_PREFERRED", "BOTH_CAPABLE", "CLAUDE_PREFERRED"],
          description: "Recommendation from analyze_task_complexity",
        },
        factors: {
          type: "object",
          description: "Complexity factors from analysis",
        },
        actualChoice: {
          type: "string",
          enum: ["ollama", "claude"],
          description: "Which system was actually used",
        },
        manualOverride: {
          type: "boolean",
          description: "Whether user manually overrode the recommendation",
          default: false,
        },
        modelUsed: {
          type: "string",
          description: "Specific model used (e.g., 'qwen2.5-coder:7b' or 'claude-sonnet-4.5')",
        },
      },
      required: ["task", "score", "recommendation", "actualChoice", "modelUsed"],
    },
  },
  {
    name: "get_routing_stats",
    description: "Get statistics about routing decisions and patterns. Shows override rates and score distributions.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "analyze_routing_patterns",
    description: "Analyze routing patterns and generate suggestions for improving the system. Requires at least 20 logged decisions.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "ollama_query":
        return await handleOllamaQuery(args);
      case "analyze_task_complexity":
        return await handleTaskAnalysis(args);
      case "list_ollama_models":
        return await handleListModels();
      case "estimate_cost_and_latency":
        return await handleCostEstimate(args);
      case "log_routing_decision":
        return await handleLogRouting(args);
      case "get_routing_stats":
        return await handleGetStats();
      case "analyze_routing_patterns":
        return await handleAnalyzePatterns();
      default:
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown tool: ${name}` }]
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${error.message}` }]
    };
  }
});

async function handleOllamaQuery(args) {
  const { model, prompt, temperature, max_tokens } = args;
  try {
    const response = await ollamaClient.query(model, prompt, {
      temperature: temperature || 0.7,
      num_predict: max_tokens || 1000,
    });

    return {
      content: [
        {
          type: "text",
          text: `**Ollama Response (${model}):**\n\n${response}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }]
    };
  }
}

async function handleTaskAnalysis(args) {
  const { task_description, available_context } = args;
  const analysis = await taskAnalyzer.analyze(task_description, available_context || "");

  return {
    content: [
      {
        type: "text",
        text: `**Task Complexity Analysis:**

**Score:** ${analysis.score_display}
**Recommendation:** ${analysis.recommendation}
**Reasoning:** ${analysis.reasoning}

**Complexity Factors:**
- Context Depth: ${analysis.factors.contextDepth}/100
- Reasoning Required: ${analysis.factors.reasoning}/100
- Precision Required: ${analysis.factors.precision}/100
- Creativity: ${analysis.factors.creativity}/100
- Multi-step Nature: ${analysis.factors.multiStep}/100`,
      },
    ],
  };
}

async function handleListModels() {
  try {
    const models = await ollamaClient.listModels();

    if (models.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No Ollama models found. Install models with:\n  ollama pull qwen2.5-coder:7b\n  ollama pull qwen3-coder:30b",
          },
        ],
      };
    }

    const modelList = models.map((m) => {
      const sizeGB = m.size ? (m.size / 1e9).toFixed(2) : "unknown";
      return `- **${m.name}** (${sizeGB} GB)`;
    }).join("\n");

    return {
      content: [
        {
          type: "text",
          text: `**Available Ollama Models:**\n\n${modelList}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: error.message }]
    };
  }
}

async function handleCostEstimate(args) {
  const { task_type, estimated_input_tokens, estimated_output_tokens } = args;
  const estimate = taskAnalyzer.estimateCostAndLatency(
    task_type,
    estimated_input_tokens || 500,
    estimated_output_tokens || 300
  );

  return {
    content: [
      {
        type: "text",
        text: `**Cost & Latency Estimate for ${task_type}:**

**Ollama (Local):**
- Latency: ${estimate.ollama.estimated_time_seconds}s
- Cost: FREE
- ${estimate.ollama.notes}

**Claude API:**
- Latency: ${estimate.claude_api.estimated_time_seconds}s
- Cost: $${estimate.claude_api.cost_usd}
- ${estimate.claude_api.notes}

**Comparison:**
- ${estimate.comparison.speed_difference}
- ${estimate.comparison.cost_savings}
- **Recommendation:** ${estimate.comparison.recommendation}`,
      },
    ],
  };
}

async function handleLogRouting(args) {
  try {
    const entry = routingLogger.logDecision(args);

    return {
      content: [
        {
          type: "text",
          text: `**Routing Decision Logged**

Task: ${entry.task.substring(0, 60)}${entry.task.length > 60 ? '...' : ''}
Score: ${entry.score}/100
Recommendation: ${entry.recommendation}
Actual Choice: ${entry.actualChoice} (${entry.modelUsed})
${entry.manualOverride ? '⚠️ Manual Override' : '✓ Followed Recommendation'}

Total logged decisions: ${routingLogger.readLog().decisions.length}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Logging failed: ${error.message}` }]
    };
  }
}

async function handleGetStats() {
  try {
    const stats = routingLogger.getStats();

    if (stats.total === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No routing decisions logged yet. Start using the task-router to build a history!",
          },
        ],
      };
    }

    let output = `**Routing Statistics**

**Total Decisions:** ${stats.total}
- Ollama: ${stats.ollamaCount} (${((stats.ollamaCount / stats.total) * 100).toFixed(1)}%)
- Claude: ${stats.claudeCount} (${((stats.claudeCount / stats.total) * 100).toFixed(1)}%)
- Manual Overrides: ${stats.overrides} (${stats.overrideRate})

**Score Distribution:**
- 0-30 (OLLAMA_ONLY): ${stats.scoreRanges['0-30']} tasks
- 31-55 (OLLAMA_PREFERRED): ${stats.scoreRanges['31-55']} tasks
- 56-70 (BOTH_CAPABLE): ${stats.scoreRanges['56-70']} tasks
- 71-100 (CLAUDE_PREFERRED): ${stats.scoreRanges['71-100']} tasks
`;

    if (Object.keys(stats.overridePatterns).length > 0) {
      output += `\n**Override Patterns:**\n`;
      for (const [range, count] of Object.entries(stats.overridePatterns)) {
        const rangeTotal = stats.scoreRanges[range];
        const rate = ((count / rangeTotal) * 100).toFixed(0);
        output += `- Range ${range}: ${count}/${rangeTotal} overridden (${rate}%)\n`;
      }
    }

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Stats retrieval failed: ${error.message}` }]
    };
  }
}

async function handleAnalyzePatterns() {
  try {
    const analysis = routingLogger.analyzeForSuggestions();

    if (!analysis.ready) {
      return {
        content: [
          {
            type: "text",
            text: `**Pattern Analysis Not Ready**\n\n${analysis.message}\n\nKeep using the system and patterns will emerge!`,
          },
        ],
      };
    }

    let output = `**Routing Pattern Analysis**\n\nAnalyzed ${analysis.total} routing decisions.\n\n`;

    if (analysis.suggestions.length === 0) {
      output += `✅ **No Issues Detected**\n\nYour routing is working well! The system is being used as designed with minimal overrides.`;
    } else {
      output += `**Suggestions for Improvement:**\n\n`;

      analysis.suggestions.forEach((suggestion, i) => {
        const icon = suggestion.severity === 'high' ? '🔴' : suggestion.severity === 'medium' ? '🟡' : '🟢';
        output += `${icon} **${suggestion.type.replace('_', ' ').toUpperCase()}**\n`;
        output += `${suggestion.message}\n`;
        output += `💡 Recommendation: ${suggestion.recommendation}\n\n`;
      });
    }

    return {
      content: [{ type: "text", text: output }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Pattern analysis failed: ${error.message}` }]
    };
  }
}

const transport = new StdioServerTransport();
server.connect(transport);

console.error("Ollama MCP Server v2.0 started successfully (with routing logger)");

class TaskAnalyzer {
  // Complexity scoring: 0-100
  async analyze(taskDescription, context = "") {
    const fullText = `${taskDescription} ${context}`.toLowerCase();

    const complexityFactors = {
      contextDepth: this.scoreContextDepth(fullText),
      reasoning: this.scoreReasoningRequired(fullText),
      precision: this.scorePrecisionRequired(fullText),
      creativity: this.scoreCreativity(fullText),
      multiStep: this.scoreMultiStepNature(fullText),
    };

    const overallScore = Math.round(
      Object.values(complexityFactors).reduce((a, b) => a + b) / Object.keys(complexityFactors).length
    );

    const recommendation = this.recommendModel(overallScore, taskDescription);

    return {
      complexity_score: overallScore,
      score_display: `${overallScore}/100`,
      factors: complexityFactors,
      recommendation,
      reasoning: this.getReasoningForRecommendation(overallScore, taskDescription),
    };
  }

  scoreContextDepth(text) {
    const contextKeywords = [
      // Original keywords
      "analyze codebase",
      "understand architecture",
      "refactor",
      "migrate",
      "design pattern",
      "entire project",
      "multiple files",
      // Domain-specific: Roblox/Game Development
      "blender",
      "blender import",
      "coordinate system",
      "coordinate conversion",
      "rigging",
      "animation",
      "game mechanics",
      "mech",
      "weapon system",
      "roblox",
      "3d model",
      "studio integration",
      // Game design complexity
      "balancing",
      "game design",
      "level design",
      "system design",
    ];
    return contextKeywords.some((kw) => text.includes(kw)) ? 85 : 25;
  }

  scoreReasoningRequired(text) {
    const reasoningKeywords = [
      // Original keywords
      "debug",
      "root cause",
      "why",
      "investigate",
      "troubleshoot",
      "compare",
      "evaluate",
      "analyze performance",
      // Domain-specific debugging
      "aim backwards",
      "not working",
      "broken",
      "incorrect",
      "wrong orientation",
      "backwards",
      "inverted",
      "flipped",
    ];
    return reasoningKeywords.some((kw) => text.includes(kw)) ? 80 : 30;
  }

  scorePrecisionRequired(text) {
    const precisionKeywords = [
      // Original keywords
      "security",
      "safety",
      "critical",
      "verify",
      "validate",
      "compliance",
      "production",
      "deploy",
      // Game-specific precision
      "gameplay",
      "game-breaking",
      "player experience",
      "multiplayer",
      "synchronization",
      "network",
    ];
    return precisionKeywords.some((kw) => text.includes(kw)) ? 90 : 20;
  }

  scoreCreativity(text) {
    const creativeKeywords = [
      // Original keywords
      "generate",
      "create",
      "design",
      "brainstorm",
      "innovative",
      "implement feature",
      // Game design creativity
      "game design",
      "new feature",
      "ability",
      "mechanic",
      "system design",
    ];
    return creativeKeywords.some((kw) => text.includes(kw)) ? 65 : 30;
  }

  scoreMultiStepNature(text) {
    const multiStepKeywords = [
      "then",
      "also",
      "additionally",
      "furthermore",
      "workflow",
      "first",
      "next",
      "finally"
    ];
    const stepCount = multiStepKeywords.filter(kw => text.includes(kw)).length;
    return stepCount >= 2 ? 75 : stepCount === 1 ? 50 : 25;
  }

  recommendModel(score, taskDescription) {
    if (score <= 30) {
      return "OLLAMA_ONLY";
    } else if (score <= 55) {
      return "OLLAMA_PREFERRED";
    } else if (score <= 70) {
      return "BOTH_CAPABLE";
    } else {
      return "CLAUDE_PREFERRED";
    }
  }

  getReasoningForRecommendation(score, taskDescription) {
    const recommendation = this.recommendModel(score, taskDescription);

    const recommendations = {
      OLLAMA_ONLY:
        "Task is straightforward and self-contained. Local Ollama is sufficient, faster, and free.",
      OLLAMA_PREFERRED:
        "Task has low-moderate complexity. Ollama can handle this efficiently with less latency and no cost.",
      BOTH_CAPABLE:
        "Task is moderately complex. Either model works - choose Ollama for speed/cost or Claude for depth.",
      CLAUDE_PREFERRED:
        "Task is complex, requires deep reasoning, or needs high accuracy. Claude API strongly recommended.",
    };

    return recommendations[recommendation] || "Unable to determine recommendation";
  }

  estimateCostAndLatency(taskType, inputTokens = 500, outputTokens = 300) {
    // Ollama performance metrics (local execution)
    const ollamaCosts = {
      code_review: { latency_ms: 2000, tokens_per_sec: 15 },
      bug_fix: { latency_ms: 3000, tokens_per_sec: 12 },
      documentation: { latency_ms: 1500, tokens_per_sec: 20 },
      analysis: { latency_ms: 3500, tokens_per_sec: 10 },
      creative: { latency_ms: 2500, tokens_per_sec: 18 },
    };

    // Claude API metrics
    const claudeCosts = {
      code_review: { cost_usd: 0.15, latency_ms: 800 },
      bug_fix: { cost_usd: 0.25, latency_ms: 1200 },
      documentation: { cost_usd: 0.10, latency_ms: 600 },
      analysis: { cost_usd: 0.30, latency_ms: 1500 },
      creative: { cost_usd: 0.20, latency_ms: 900 },
    };

    const ollamaMetrics = ollamaCosts[taskType] || ollamaCosts.analysis;
    const claudeMetrics = claudeCosts[taskType] || claudeCosts.analysis;

    const ollamaLatency = ollamaMetrics.latency_ms + Math.ceil(outputTokens / ollamaMetrics.tokens_per_sec) * 1000;
    const claudeLatency = claudeMetrics.latency_ms;

    // Claude pricing (approximate for Sonnet 4.5)
    const estimatedClaudeCost = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;

    return {
      ollama: {
        latency_ms: ollamaLatency,
        estimated_time_seconds: (ollamaLatency / 1000).toFixed(2),
        cost_usd: 0,
        notes: "Local execution, no API costs, free",
      },
      claude_api: {
        latency_ms: claudeLatency,
        estimated_time_seconds: (claudeLatency / 1000).toFixed(2),
        cost_usd: estimatedClaudeCost.toFixed(4),
        notes: "API-based, includes network latency, paid",
      },
      comparison: {
        speed_difference: ollamaLatency > claudeLatency
          ? `Ollama ${Math.round((ollamaLatency / claudeLatency - 1) * 100)}% slower`
          : `Ollama ${Math.round((1 - ollamaLatency / claudeLatency) * 100)}% faster`,
        cost_savings: `$${estimatedClaudeCost.toFixed(4)} saved using Ollama`,
        recommendation:
          estimatedClaudeCost > 0.05 && ollamaLatency < claudeLatency * 3
            ? "Use Ollama (good speed, free)"
            : estimatedClaudeCost < 0.02
              ? "Use Claude API (worth the cost)"
              : "Either works",
      },
    };
  }
}

module.exports = TaskAnalyzer;

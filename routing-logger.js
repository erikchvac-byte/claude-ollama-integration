const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Routing Decision Logger
 * Logs all routing decisions for pattern analysis and auto-tuning
 */
class RoutingLogger {
  constructor(logPath = null) {
    this.logPath = logPath || path.join(os.homedir(), '.claude', 'routing-log.json');
    this.ensureLogFile();
  }

  ensureLogFile() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, JSON.stringify({ decisions: [], metadata: { version: '1.0', created: new Date().toISOString() } }, null, 2));
    }
  }

  logDecision(decision) {
    const log = this.readLog();

    const entry = {
      timestamp: new Date().toISOString(),
      task: decision.task,
      score: decision.score,
      recommendation: decision.recommendation,
      factors: decision.factors,
      actualChoice: decision.actualChoice, // 'ollama', 'claude', or 'user-override'
      manualOverride: decision.manualOverride || false,
      modelUsed: decision.modelUsed, // which specific model
      success: decision.success, // did it work well? (optional, set later)
    };

    log.decisions.push(entry);

    // Keep only last 200 decisions (prevent file bloat)
    if (log.decisions.length > 200) {
      log.decisions = log.decisions.slice(-200);
    }

    fs.writeFileSync(this.logPath, JSON.stringify(log, null, 2));
    return entry;
  }

  readLog() {
    try {
      const data = fs.readFileSync(this.logPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { decisions: [], metadata: { version: '1.0', created: new Date().toISOString() } };
    }
  }

  getStats() {
    const log = this.readLog();
    const decisions = log.decisions;

    if (decisions.length === 0) {
      return { total: 0, message: 'No routing decisions logged yet' };
    }

    const total = decisions.length;
    const ollamaCount = decisions.filter(d => d.actualChoice === 'ollama').length;
    const claudeCount = decisions.filter(d => d.actualChoice === 'claude').length;
    const overrides = decisions.filter(d => d.manualOverride).length;

    // Score range analysis
    const scoreRanges = {
      '0-30': decisions.filter(d => d.score <= 30).length,
      '31-55': decisions.filter(d => d.score > 30 && d.score <= 55).length,
      '56-70': decisions.filter(d => d.score > 55 && d.score <= 70).length,
      '71-100': decisions.filter(d => d.score > 70).length,
    };

    // Manual override patterns
    const overridePatterns = decisions
      .filter(d => d.manualOverride)
      .reduce((acc, d) => {
        const range = d.score <= 30 ? '0-30' : d.score <= 55 ? '31-55' : d.score <= 70 ? '56-70' : '71-100';
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {});

    return {
      total,
      ollamaCount,
      claudeCount,
      overrides,
      overrideRate: ((overrides / total) * 100).toFixed(1) + '%',
      scoreRanges,
      overridePatterns,
      recentDecisions: decisions.slice(-10),
    };
  }

  analyzeForSuggestions() {
    const stats = this.getStats();

    if (stats.total < 20) {
      return {
        ready: false,
        message: `Need ${20 - stats.total} more routing decisions before analysis`,
      };
    }

    const suggestions = [];

    // Pattern 1: High override rate in a specific score range
    for (const [range, count] of Object.entries(stats.overridePatterns || {})) {
      const rangeTotal = stats.scoreRanges[range];
      const overrideRate = (count / rangeTotal) * 100;

      if (overrideRate > 40 && count >= 5) {
        suggestions.push({
          type: 'threshold_adjustment',
          severity: 'high',
          message: `${overrideRate.toFixed(0)}% of tasks in range ${range} are manually overridden`,
          recommendation: this.suggestThresholdChange(range, stats),
          data: { range, overrideRate, count, rangeTotal }
        });
      }
    }

    // Pattern 2: Keyword suggestions based on overridden tasks
    const overriddenTasks = stats.recentDecisions
      .filter(d => d.manualOverride)
      .map(d => d.task.toLowerCase());

    const commonWords = this.findCommonWords(overriddenTasks);
    if (commonWords.length > 0) {
      suggestions.push({
        type: 'keyword_addition',
        severity: 'medium',
        message: 'Detected common patterns in manually overridden tasks',
        recommendation: `Consider adding keywords: ${commonWords.slice(0, 5).join(', ')}`,
        data: { keywords: commonWords.slice(0, 10) }
      });
    }

    return {
      ready: true,
      total: stats.total,
      suggestions,
      stats,
    };
  }

  suggestThresholdChange(range, stats) {
    // Analyze which direction overrides go
    const log = this.readLog();
    const overridesInRange = log.decisions.filter(d => {
      const score = d.score;
      if (range === '0-30') return score <= 30 && d.manualOverride;
      if (range === '31-55') return score > 30 && score <= 55 && d.manualOverride;
      if (range === '56-70') return score > 55 && score <= 70 && d.manualOverride;
      if (range === '71-100') return score > 70 && d.manualOverride;
      return false;
    });

    const toClaudeCount = overridesInRange.filter(d => d.actualChoice === 'claude').length;
    const toOllamaCount = overridesInRange.filter(d => d.actualChoice === 'ollama').length;

    if (toClaudeCount > toOllamaCount) {
      return `Lower the Claude threshold to include range ${range} (currently requires >70)`;
    } else {
      return `Raise the Ollama threshold to exclude range ${range} (currently accepts ≤55)`;
    }
  }

  findCommonWords(tasks) {
    const wordCounts = {};

    // Common English words to ignore
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                               'of', 'with', 'by', 'from', 'this', 'that', 'is', 'it', 'as', 'was']);

    tasks.forEach(task => {
      const words = task.match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    // Return words that appear in multiple tasks
    return Object.entries(wordCounts)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }

  clearLog() {
    fs.writeFileSync(this.logPath, JSON.stringify({
      decisions: [],
      metadata: { version: '1.0', created: new Date().toISOString(), cleared: new Date().toISOString() }
    }, null, 2));
  }
}

module.exports = RoutingLogger;

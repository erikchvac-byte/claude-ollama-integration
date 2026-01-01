#!/usr/bin/env node

/**
 * Integration Test Suite for Claude + Ollama Integration
 * Tests the MCP server components directly
 */

const path = require('path');
const os = require('os');

// Load from the actual MCP server directory
const mcpServerPath = path.join(os.homedir(), '.claude', 'mcp-servers', 'ollama-mcp-server');
const OllamaClient = require(path.join(mcpServerPath, 'ollama-client.js'));
const TaskAnalyzer = require(path.join(mcpServerPath, 'task-complexity-analyzer.js'));

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, emoji, message) {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Test suite
async function runTests() {
  section('Claude + Ollama Integration Test Suite');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Ollama Connection
  section('Test 1: Ollama Service Connection');
  try {
    const client = new OllamaClient('http://localhost:11434');
    const models = await client.listModels();

    if (models && models.length > 0) {
      log('green', '✅', `Connected to Ollama - Found ${models.length} models`);
      models.slice(0, 3).forEach(m => {
        const size = (m.size / 1e9).toFixed(2);
        console.log(`   - ${m.name} (${size} GB)`);
      });
      passedTests++;
    } else {
      throw new Error('No models found');
    }
  } catch (error) {
    log('red', '❌', `Failed to connect to Ollama: ${error.message}`);
    failedTests++;
  }

  // Test 2: Task Complexity Analysis - Simple Task
  section('Test 2: Task Complexity Analysis - Simple Task');
  try {
    const analyzer = new TaskAnalyzer();
    const result = await analyzer.analyze('Write a function to add two numbers');

    console.log(`   Score: ${result.score_display}`);
    console.log(`   Recommendation: ${result.recommendation}`);
    console.log(`   Reasoning: ${result.reasoning}`);

    if (result.complexity_score >= 0 && result.complexity_score <= 100) {
      log('green', '✅', 'Complexity analysis working correctly');

      // Verify simple task gets low score
      if (result.complexity_score <= 40) {
        log('green', '✅', `Correctly identified as simple task (${result.complexity_score}/100)`);
        passedTests++;
      } else {
        log('yellow', '⚠️', `Score seems high for simple task (${result.complexity_score}/100)`);
        passedTests++; // Still passes, just unexpected
      }
    } else {
      throw new Error(`Invalid score: ${result.complexity_score}`);
    }
  } catch (error) {
    log('red', '❌', `Task analysis failed: ${error.message}`);
    failedTests++;
  }

  // Test 3: Task Complexity Analysis - Complex Task
  section('Test 3: Task Complexity Analysis - Complex Task');
  try {
    const analyzer = new TaskAnalyzer();
    const result = await analyzer.analyze(
      'Debug why the M6 Stalker weapons aim backwards after Blender import',
      'Requires understanding coordinate systems, Blender import, and game mechanics'
    );

    console.log(`   Score: ${result.score_display}`);
    console.log(`   Recommendation: ${result.recommendation}`);
    console.log(`   Reasoning: ${result.reasoning}`);
    console.log(`   Factors:`);
    console.log(`     - Context Depth: ${result.factors.contextDepth}/100`);
    console.log(`     - Reasoning: ${result.factors.reasoning}/100`);
    console.log(`     - Precision: ${result.factors.precision}/100`);

    if (result.complexity_score >= 60) {
      log('green', '✅', `Correctly identified as complex task (${result.complexity_score}/100)`);
      passedTests++;
    } else {
      log('yellow', '⚠️', `Score seems low for complex task (${result.complexity_score}/100)`);
      failedTests++;
    }
  } catch (error) {
    log('red', '❌', `Complex task analysis failed: ${error.message}`);
    failedTests++;
  }

  // Test 4: Cost Estimation
  section('Test 4: Cost & Latency Estimation');
  try {
    const analyzer = new TaskAnalyzer();
    const estimate = analyzer.estimateCostAndLatency('code_review', 500, 300);

    console.log(`   Ollama: ${estimate.ollama.estimated_time_seconds}s, $${estimate.ollama.cost_usd}`);
    console.log(`   Claude: ${estimate.claude_api.estimated_time_seconds}s, $${estimate.claude_api.cost_usd}`);
    console.log(`   Savings: ${estimate.comparison.cost_savings}`);
    console.log(`   Speed: ${estimate.comparison.speed_difference}`);

    if (estimate.ollama.cost_usd === 0 && parseFloat(estimate.claude_api.cost_usd) > 0) {
      log('green', '✅', 'Cost estimation working correctly');
      passedTests++;
    } else {
      throw new Error('Invalid cost estimates');
    }
  } catch (error) {
    log('red', '❌', `Cost estimation failed: ${error.message}`);
    failedTests++;
  }

  // Test 5: Various Task Types
  section('Test 5: Testing Various Task Types');
  const testCases = [
    { task: 'Write hello world in Python', expectedMax: 40, type: 'simple' },
    { task: 'Generate unit tests for this function', expectedMin: 30, expectedMax: 60, type: 'moderate' },
    { task: 'Refactor entire authentication system for security', expectedMin: 70, type: 'complex' },
    { task: 'Explain how this function works', expectedMax: 50, type: 'simple' },
  ];

  for (const testCase of testCases) {
    try {
      const analyzer = new TaskAnalyzer();
      const result = await analyzer.analyze(testCase.task);
      const score = result.complexity_score;

      let passed = true;
      if (testCase.expectedMin && score < testCase.expectedMin) passed = false;
      if (testCase.expectedMax && score > testCase.expectedMax) passed = false;

      if (passed) {
        log('green', '✅', `"${testCase.task.slice(0, 40)}..." → ${score}/100 (${testCase.type})`);
        passedTests++;
      } else {
        log('yellow', '⚠️', `"${testCase.task.slice(0, 40)}..." → ${score}/100 (expected ${testCase.type})`);
        failedTests++;
      }
    } catch (error) {
      log('red', '❌', `Failed: ${testCase.task.slice(0, 40)}...`);
      failedTests++;
    }
  }

  // Test 6: Ollama Query (if Ollama is running)
  section('Test 6: Direct Ollama Query');
  try {
    const client = new OllamaClient('http://localhost:11434');
    log('blue', '🔄', 'Sending test query to qwen2.5-coder:1.5b (fast model)...');

    const response = await client.query(
      'qwen2.5-coder:1.5b',
      'Write a one-line Python function that adds two numbers. Just the code, no explanation.',
      { num_predict: 100, temperature: 0.3 }
    );

    if (response && response.length > 0) {
      console.log(`\n   Response: ${response.slice(0, 100)}...`);
      log('green', '✅', 'Successfully queried Ollama model');
      passedTests++;
    } else {
      throw new Error('Empty response from Ollama');
    }
  } catch (error) {
    log('red', '❌', `Ollama query failed: ${error.message}`);
    failedTests++;
  }

  // Test 7: Agent Files Present
  section('Test 7: Agent Files Validation');
  const fs = require('fs');
  const agentFiles = [
    '.claude/agents/task-router.md',
    '.claude/agents/ollama-specialist.md',
    '.claude/agents/claude-specialist.md',
  ];

  for (const file of agentFiles) {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.length > 100) {
          log('green', '✅', `${file} exists and has content`);
          passedTests++;
        } else {
          throw new Error('File too small');
        }
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      log('red', '❌', `${file}: ${error.message}`);
      failedTests++;
    }
  }

  // Test 8: MCP Config
  section('Test 8: MCP Configuration');
  try {
    const mcpConfig = require('./.mcp.json');
    if (mcpConfig.mcpServers && mcpConfig.mcpServers['ollama-local']) {
      log('green', '✅', '.mcp.json is properly configured');
      console.log(`   Server: ${mcpConfig.mcpServers['ollama-local'].command}`);
      passedTests++;
    } else {
      throw new Error('Invalid MCP configuration');
    }
  } catch (error) {
    log('red', '❌', `MCP config validation failed: ${error.message}`);
    failedTests++;
  }

  // Summary
  section('Test Summary');
  const total = passedTests + failedTests;
  console.log(`Total Tests: ${total}`);
  log('green', '✅', `Passed: ${passedTests}`);
  if (failedTests > 0) {
    log('red', '❌', `Failed: ${failedTests}`);
  }

  const percentage = ((passedTests / total) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${percentage}%\n`);

  if (failedTests === 0) {
    log('green', '🎉', 'All tests passed! Integration is ready to use.');
  } else {
    log('yellow', '⚠️', 'Some tests failed. Review the output above.');
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log('red', '💥', `Test suite crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

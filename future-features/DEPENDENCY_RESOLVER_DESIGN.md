# Dependency Resolver Agent - Design Document

**Date**: January 3, 2026
**Purpose**: Auto-detect and resolve libraries, data, and resources needed for tasks

---

## Problem Statement

When agents generate code, they often need:
- **Libraries**: npm packages, pip modules, system binaries
- **Data**: API keys, configuration files, sample data
- **Context**: Documentation, code examples, API schemas
- **Resources**: File paths, database connections, external services

**Current Gap**: Agents assume resources exist or hallucinate non-existent APIs.

**Goal**: Build a system that automatically detects, validates, and resolves dependencies.

---

## Design Options

### Option 1: Integrated MCP Tool (Quickest Implementation)

**Structure**: Add to existing `ollama-mcp-server`

```javascript
// New MCP tool: analyze_and_resolve_dependencies
{
  name: "mcp__ollama-local__analyze_dependencies",
  description: "Detect required libraries and resources for a code task",
  parameters: {
    code: "string",           // Code to analyze
    language: "string",        // js, python, etc.
    auto_install: "boolean",  // Auto-install safe packages
    context_files: "array"    // Files to check for existing imports
  }
}
```

**Pros**:
- Quick to implement (1-2 hours)
- Integrates with existing telemetry
- Works immediately with current agent workflows

**Cons**:
- Limited to static analysis
- No runtime error detection
- Can't handle complex dependency chains

---

### Option 2: Specialized Agent (Recommended)

**Structure**: New agent type in `.claude/agents/`

```markdown
# dependency-resolver agent

**Purpose**: Analyze tasks to detect and resolve required dependencies

**Capabilities**:
1. Static code analysis (imports, requires)
2. Package.json/requirements.txt parsing
3. Runtime error detection patterns
4. Auto-installation with safety checks
5. Alternative suggestion when packages unavailable
6. User prompting for ambiguous cases

**Tools Available**: All tools + special dependency resolution tools

**Workflow**:
1. Receive task description or code
2. Parse for dependencies (imports, APIs referenced)
3. Check if dependencies exist locally
4. For missing deps:
   - If safe → auto-install
   - If ambiguous → ask user
   - If unavailable → suggest alternatives
5. Return resolved context + installation log
```

**Pros**:
- Handles complex scenarios
- Can iterate with user
- Full access to tools for verification
- Extensible for future capabilities

**Cons**:
- Requires more development time (4-6 hours)
- Needs testing across languages

---

### Option 3: Modular Skill System (Most Flexible)

**Structure**: Multiple small, composable skills

```
/analyze-deps <code>         - Detect dependencies
/check-installed <package>   - Verify package exists
/install-safe <package>      - Auto-install whitelisted packages
/suggest-alternatives <pkg>  - Find replacements
/fetch-docs <library>        - Get API documentation
```

**Pros**:
- Highly modular and testable
- Easy to extend
- Clear separation of concerns
- Users can invoke individually

**Cons**:
- Requires orchestration logic
- More overhead to maintain multiple skills

---

## Recommended Architecture: Hybrid Approach

**Combine Options 1 & 2**: MCP tool + specialized agent

### Phase 1: MCP Tool (Quick Win - This Week)

Add basic static analysis to MCP server:

```javascript
// context-extractor.js enhancement
class ContextExtractor {
  // ... existing code ...

  /**
   * Analyze code for missing dependencies
   */
  analyzeDependencies(code, language, contextFiles) {
    const detected = this.extractImportsFromCode(code, language);
    const available = this.getAvailableAPIs(
      contextFiles.flatMap(f => this.extractImportsFromFile(f))
    );

    const missing = detected.filter(dep => !available.includes(dep));

    return {
      detected: detected,
      available: available,
      missing: missing,
      recommendations: this.getInstallRecommendations(missing)
    };
  }

  getInstallRecommendations(packages) {
    return packages.map(pkg => ({
      package: pkg,
      command: this.getInstallCommand(pkg),
      safe: this.isSafeToAutoInstall(pkg),
      alternatives: this.getAlternatives(pkg)
    }));
  }
}
```

**New MCP Tool**:
```javascript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ... existing tools ...
    {
      name: "analyze_dependencies",
      description: "Analyze code to detect required dependencies and suggest installation",
      inputSchema: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code to analyze" },
          language: {
            type: "string",
            enum: ["javascript", "python", "typescript"],
            description: "Programming language"
          },
          context_files: {
            type: "array",
            items: { type: "string" },
            description: "Files to check for existing dependencies"
          },
          auto_suggest: {
            type: "boolean",
            default: true,
            description: "Automatically suggest installation commands"
          }
        },
        required: ["code", "language"]
      }
    }
  ]
}));
```

### Phase 2: Specialized Agent (Next Week)

**File**: `.claude/agents/dependency-resolver.md`

```markdown
# dependency-resolver

You are a dependency resolution specialist. Your job is to:

1. **Analyze** code and task descriptions to identify required libraries, data, and resources
2. **Validate** whether dependencies are available in the environment
3. **Resolve** missing dependencies through:
   - Auto-installation (safe packages only)
   - User guidance (ambiguous cases)
   - Alternative suggestions (unavailable packages)
4. **Document** all resolutions in execution logs

## Workflow

### Step 1: Detection
Use `analyze_dependencies` MCP tool or static analysis to find:
- Import statements
- API calls to external libraries
- File path references
- Environment variable usage
- Network endpoints

### Step 2: Validation
Check each dependency:
- Is it installed? (package.json, requirements.txt, node_modules/, venv/)
- Is it the right version?
- Are credentials/API keys available?

### Step 3: Resolution Strategy

**Auto-Install (No User Prompt)**:
- Whitelisted packages (express, axios, lodash, pandas, numpy, requests)
- Packages already in package.json/requirements.txt
- Official packages from npm/PyPI with >10k downloads

**Ask User**:
- Custom/internal packages
- Packages requiring configuration
- Deprecated or risky packages
- Multiple version conflicts

**Suggest Alternatives**:
- Package not found → suggest similar packages
- Package deprecated → suggest modern replacement
- Incompatible version → suggest compatible alternative

### Step 4: Documentation
Log all actions:
```json
{
  "task": "Create Express API server",
  "detected_dependencies": ["express", "body-parser", "dotenv"],
  "available": ["express"],
  "installed": ["body-parser", "dotenv"],
  "user_prompts": [],
  "alternatives_suggested": [],
  "final_status": "resolved"
}
```

## Safety Rules

**NEVER auto-install**:
- Packages with known vulnerabilities
- Packages requiring sudo/admin privileges
- System-level binaries
- Database management systems
- Packages that modify global config

**ALWAYS ask user for**:
- API keys and credentials
- Database connection strings
- File paths outside project directory
- External service URLs

## Examples

### Example 1: Auto-Install Safe Package
```
User: "Create a REST API with Express"
Agent: [Uses analyze_dependencies]
Result: Missing "express"
Action: npm install express --save
Output: "✓ Installed express@4.18.2"
```

### Example 2: Ask User for Ambiguous Case
```
User: "Connect to our internal database"
Agent: [Detects database requirement]
Question: "Which database system? (PostgreSQL, MySQL, MongoDB, Other)"
User: "PostgreSQL"
Agent: [Checks for pg package]
Action: npm install pg
Question: "Please provide database connection string"
User: [Provides connection string]
Output: "✓ Database connection configured"
```

### Example 3: Suggest Alternative
```
User: "Use request library to fetch API"
Agent: [Detects 'request' package]
Warning: "The 'request' package is deprecated"
Suggestion: "Use 'axios' or 'node-fetch' instead"
User: "Use axios"
Action: npm install axios
Output: "✓ Installed axios@1.6.0 (modern alternative to request)"
```

## Tool Usage

Prefer using `analyze_dependencies` MCP tool for initial analysis, then:
- Use `Bash` tool for installation commands
- Use `Read` tool to check package.json/requirements.txt
- Use `AskUserQuestion` for ambiguous cases
- Use `ollama_query` with context injection for alternative suggestions

## Success Metrics

Track:
- Auto-resolution rate (target: >80%)
- User prompt rate (target: <15%)
- Failed resolutions (target: <5%)
- Time to resolve (target: <30s average)
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1) ✅ IN PROGRESS
- [x] Enhance context-extractor.js with dependency analysis
- [ ] Add `analyze_dependencies` MCP tool
- [ ] Test with JavaScript and Python code samples
- [ ] Measure baseline resolution accuracy

### Phase 2: Agent Integration (Week 2)
- [ ] Create `dependency-resolver` agent
- [ ] Build safety whitelist for auto-install
- [ ] Implement user prompting logic
- [ ] Add alternative suggestion database

### Phase 3: Advanced Features (Week 3)
- [ ] Runtime error detection (parse stack traces)
- [ ] Dependency chain resolution (transitive deps)
- [ ] Version conflict detection
- [ ] API key management helper

### Phase 4: Optimization (Week 4)
- [ ] Cache resolution decisions
- [ ] Build project fingerprint (remember resolved deps)
- [ ] Auto-update package lists
- [ ] Integrate with existing routing-logger telemetry

---

## Existing Patterns to Leverage

### 1. **Package Manager Integration**
- **npm**: `npm list`, `npm outdated`, `npm audit`
- **pip**: `pip freeze`, `pip check`, `pip list --outdated`
- **Homebrew**: `brew list`, `brew deps`

### 2. **Static Analysis Tools**
- **JavaScript**: `@babel/parser`, `acorn`, `esprima`
- **Python**: `ast` module, `importlib`
- **Multi-language**: Tree-sitter

### 3. **Dependency Graphs**
- **npm**: package-lock.json, dependency trees
- **pip**: pipdeptree
- **Universal**: SBOM (Software Bill of Materials)

### 4. **Auto-Installation Frameworks**
- **Colab/Jupyter**: `!pip install` auto-execution
- **Stackblitz**: Auto-detects and installs npm packages
- **Replit**: Guesses packages from imports

---

## Data Structures

### Dependency Record
```javascript
{
  package: "express",
  version: "^4.18.0",
  language: "javascript",
  manager: "npm",
  source: "import",         // "import" | "require" | "api_call"
  location: "server.js:1",
  status: "missing",        // "available" | "missing" | "incompatible"
  safe_to_install: true,
  install_command: "npm install express",
  alternatives: ["fastify", "koa"],
  confidence: 0.95
}
```

### Resolution Log
```javascript
{
  timestamp: "2026-01-03T10:30:00Z",
  task_id: "abc123",
  dependencies_detected: 5,
  auto_installed: 3,
  user_prompted: 1,
  failed: 0,
  alternatives_suggested: 1,
  total_time_ms: 2341,
  actions: [
    { package: "express", action: "auto_install", result: "success" },
    { package: "dotenv", action: "auto_install", result: "success" },
    { package: "custom-auth", action: "user_prompt", result: "user_provided_path" }
  ]
}
```

---

## Safety Mechanisms

### Auto-Install Whitelist (Safe Packages)

**JavaScript**:
```javascript
const SAFE_NPM_PACKAGES = [
  'express', 'axios', 'lodash', 'moment', 'dotenv',
  'cors', 'body-parser', 'morgan', 'uuid', 'chalk',
  'winston', 'debug', 'validator', 'bcrypt', 'jsonwebtoken'
];
```

**Python**:
```python
SAFE_PIP_PACKAGES = [
  'requests', 'numpy', 'pandas', 'matplotlib', 'flask',
  'django', 'pytest', 'black', 'pylint', 'python-dotenv',
  'pydantic', 'fastapi', 'sqlalchemy', 'beautifulsoup4'
]
```

### Risk Assessment
```javascript
function assessRisk(package) {
  const riskFactors = {
    downloads: getDownloadCount(package),      // >10k = low risk
    maintainers: getActiveMaintainers(package), // >2 = low risk
    lastUpdate: getLastUpdateDate(package),     // <6mo = low risk
    vulnerabilities: getVulnCount(package),     // 0 = low risk
    scope: isGlobalInstall(package)             // false = low risk
  };

  return calculateRiskScore(riskFactors); // 0-100
}
```

---

## Questions for You

1. **Scope**: Start with Phase 1 (MCP tool) or jump straight to Phase 2 (full agent)?

2. **Languages**: Focus on JavaScript & Python first, or include others?

3. **Safety Level**:
   - Conservative (only install explicit whitelist)
   - Moderate (install popular packages automatically)
   - Aggressive (install anything, prompt only for credentials)

4. **Integration**: Should this be:
   - Standalone agent users invoke manually?
   - Automatic pre-check before every task?
   - Triggered only when import errors detected?

5. **User Experience**: When prompting user:
   - Simple yes/no questions?
   - Multiple choice with recommendations?
   - Full explanation with alternatives?

---

## Next Steps

**Immediate (Today)**:
1. Add basic dependency detection to context-extractor.js
2. Create `analyze_dependencies` MCP tool
3. Test with MyWisperAuto project code

**This Week**:
4. Build dependency-resolver agent
5. Create safety whitelist
6. Test auto-resolution workflows

**Next Week**:
7. Add telemetry tracking
8. Measure resolution accuracy
9. Iterate based on real usage data

---

**Would you like me to start implementing Phase 1 (MCP tool) now?**

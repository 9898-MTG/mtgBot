# Contributing to mtgBot

Thank you for your interest in contributing to the 9898-MTG platform! This guide covers coding standards, development setup, and the process for submitting changes.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Hook Development Guide](#hook-development-guide)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/mtgBot.git
   cd mtgBot
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

---

## Development Setup

### Prerequisites

| Requirement     | Version   | Purpose                       |
|-----------------|-----------|-------------------------------|
| **Node.js**     | ≥ 16.x    | Discord bot & tooling         |
| **npm**         | ≥ 8.x     | Package management            |
| **Python 3**    | ≥ 3.8     | Build scripts (optional)      |
| **.NET SDK**    | 8.0       | Blazor app (optional)         |

### Available Scripts

| Command              | Description                                   |
|----------------------|-----------------------------------------------|
| `npm run lint`       | Run ESLint across all JavaScript files         |
| `npm run lint:fix`   | Auto-fix linting issues                        |
| `npm run format`     | Format all files with Prettier                 |
| `npm test`           | Run Jest test suite                            |
| `npm run test:watch` | Run tests in watch mode                        |
| `npm run validate`   | Lint + test combined                           |
| `npm run validate:json` | Validate bot JSON configuration files       |

### Discord Bot Setup

```bash
cd discord/BotFiles
cp .env.example .env
# Edit .env with your Discord bot token
node bot.js
```

> **Important:** Never commit your `.env` file or bot token.

---

## Coding Standards

### JavaScript

- **Style**: Configured via ESLint (`.eslintrc.json`) and Prettier (`.prettierrc.json`)
- **Quotes**: Double quotes
- **Semicolons**: Required
- **Indentation**: 4 spaces
- **Variables**: Prefer `const`, use `let` when reassignment is needed, avoid `var`
- **Equality**: Use `===` and `!==` (strict equality)
- **Error handling**: Always wrap async operations in try/catch
- **Documentation**: Add JSDoc comments to all exported functions

### File Organization

```
project-root/
├── discord/BotFiles/     # Bot code — Node.js modules
├── generateBooster/      # Web app — browser JavaScript
├── chaos_commander_drafting/ # Web app — browser JavaScript
├── hooks/                # Hook system (shared between bot & web)
├── lib/                  # Shared utility functions
├── scripts/              # Build & maintenance scripts
└── __tests__/            # Test files (co-located with source)
```

### Naming Conventions

| Type         | Convention      | Example                  |
|--------------|----------------|--------------------------|
| Files        | camelCase       | `HookRegistry.js`        |
| Variables    | camelCase       | `serverVars`             |
| Constants    | UPPER_SNAKE     | `MAX_RETRIES`            |
| Functions    | camelCase       | `fetchCard()`            |
| Classes      | PascalCase      | `HookRegistry`           |
| CSS classes  | kebab-case      | `.card-image`            |
| Hook names   | ID:PascalCase   | `H01:BotInit`            |

---

## Hook Development Guide

The hook system is an event-driven architecture that allows different parts of the platform to communicate. See [hooks/HOOKS.md](hooks/HOOKS.md) for the full specification and [hooks/HOOK_REFERENCE.md](hooks/HOOK_REFERENCE.md) for the auto-generated reference.

### Creating a New Hook

1. **Define the hook** in `hooks/HookRegistry.js`:
   ```javascript
   "H99:MyNewHook": {
       id: "H99",
       name: "My New Hook",
       category: "custom",
       description: "When something happens",
       source: "path/to/source.js"
   }
   ```

2. **Add a schema** in `hooks/schemas.js`:
   ```javascript
   "H99:MyNewHook": {
       description: "When something happens",
       payload: {
           data: { type: "string", description: "The relevant data" }
       }
   }
   ```

3. **Emit the hook** in your code:
   ```javascript
   hookRegistry.trigger("H99:MyNewHook", { data: "value" });
   ```

4. **Register a listener**:
   ```javascript
   hookRegistry.register("H99:MyNewHook", (payload) => {
       console.log("Hook fired!", payload);
   });
   ```

5. **Regenerate docs**:
   ```bash
   node scripts/generateHookDocs.js
   ```

### Hook Categories

| Category     | ID Range | Purpose                              |
|-------------|----------|--------------------------------------|
| lifecycle   | H01-H09  | Bot startup, shutdown, config        |
| message     | H10-H19  | Message and command processing        |
| event       | H20-H29  | Discord server events                |
| moderation  | H30-H39  | Anti-spam, bans, kicks               |
| variable    | H40-H49  | Variable read/write/persist          |
| web         | H50-H59  | Web application interactions          |

---

## Testing

Tests use **Jest** and are co-located with source code in `__tests__/` directories.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest hooks/__tests__/HookRegistry.test.js

# Run with coverage
npx jest --coverage
```

### Writing Tests

```javascript
const { HookRegistry } = require("../HookRegistry");

describe("MyFeature", () => {
    it("should do the expected thing", () => {
        // Arrange
        const registry = new HookRegistry();

        // Act
        registry.trigger("H01:BotInit", { test: true });

        // Assert
        expect(registry.getHistory()).toHaveLength(1);
    });
});
```

---

## Pull Request Process

1. **Run validation** before submitting:
   ```bash
   npm run validate
   npm run validate:json
   ```

2. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add booster generation retry logic"
   ```

3. **Push** to your fork and open a Pull Request

4. **PR checklist**:
   - [ ] Code follows the style guidelines
   - [ ] Self-reviewed the code
   - [ ] Added/updated tests for new functionality
   - [ ] All tests pass (`npm test`)
   - [ ] Lint passes (`npm run lint`)
   - [ ] Updated relevant documentation

5. **Wait for review** — maintainers will review and provide feedback

---

## Commit Message Format

Use conventional commit prefixes:

| Prefix     | Use for                              |
|------------|--------------------------------------|
| `feat:`    | New features                         |
| `fix:`     | Bug fixes                            |
| `refactor:`| Code restructuring                   |
| `docs:`    | Documentation changes                |
| `test:`    | Adding or updating tests             |
| `chore:`   | Build scripts, CI, dependencies      |
| `style:`   | Formatting, whitespace, semicolons   |

---

## Questions?

Open an issue or reach out on the 9898-MTG Discord server.

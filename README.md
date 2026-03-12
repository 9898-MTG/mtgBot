# mtgBot

> **Magic: The Gathering Discord Bot & Web Development Platform**
> A comprehensive toolkit for the 9898-MTG League — featuring a Discord bot, web applications, AI agent integration, Scryfall API tools, and a custom Chaos Commander RPG format.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Discord Bot Setup](#discord-bot-setup)
  - [Web Application Setup](#web-application-setup)
  - [Blazor Application Setup](#blazor-application-setup)
- [Key Features](#key-features)
- [Integration Files](#integration-files)
  - [Prompts](#prompts)
  - [Instructions](#instructions)
  - [Skills](#skills)
  - [Agents](#agents)
  - [Hooks](#hooks)
- [API Integrations](#api-integrations)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**mtgBot** is the core platform for the **9898-MTG League**, a custom Magic: The Gathering community built around the Chaos Commander RPG format. The project includes:

- **Discord Bot** — Automates server management, league events, and player tracking via discord.js v13
- **Booster Generator** — Dynamically creates random booster packs using the Scryfall API
- **Chaos Commander Drafting** — Implements a custom MTG draft format with interactive web UI
- **AI Agent (mtgBot)** — An AI assistant trained for MTG development, code generation, and gameplay support
- **Web Portal** — Static HTML/CSS/JS pages and a Blazor WebAssembly app for league management

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    9898-MTG Platform                     │
├──────────────┬──────────────┬───────────────────────────┤
│  Discord Bot │   Web Apps   │     AI Agent (mtgBot)     │
│  (Node.js)   │  (HTML/JS)   │     (CodeGPT / GPT)      │
├──────────────┼──────────────┼───────────────────────────┤
│ discord.js   │ Scryfall API │ Prompt Templates          │
│ express      │ Vanilla JS   │ Personality Traits        │
│ winston      │ CSS Theming  │ Skills & Hooks            │
├──────────────┴──────────────┴───────────────────────────┤
│              Data Layer (JSON / CSV / Access)            │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| **Bot**      | Node.js, discord.js v13, express, winston      |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript                |
| **Blazor**   | .NET 8, Blazor WebAssembly, C#                 |
| **AI**       | CodeGPT Agent, GPT Prompt Engineering          |
| **APIs**     | Scryfall, Discord API, Google Forms/Sheets     |
| **Data**     | JSON, CSV (PapaParse), Microsoft Access        |
| **Logging**  | Winston (JSON format, file-based)              |
| **Security** | discord-anti-spam, configurable rules          |

---

## Directory Structure

```
mtgBot/
├── discord/BotFiles/          # Discord bot (Node.js)
│   ├── bot.js                 # Bot entry point
│   ├── Handlers/              # Message & event handlers
│   ├── BotData/               # Settings, commands, variables, user data
│   └── package.json           # Bot dependencies
├── generateBooster/           # Scryfall booster generator (HTML/JS)
├── chaos_commander_drafting/  # Chaos Commander draft format (HTML/JS)
├── solution/mtgBot/           # Blazor WebAssembly app (.NET 8)
├── prompts/                   # AI prompt templates
├── instructions/              # Setup and development guides
├── skills/                    # Technical skills and API reference
├── agents/                    # Agent configuration and behavior
├── hooks/                     # Event hooks and extension points
├── markdown/                  # Documentation and agent info
├── scryfall/                  # Scryfall API resources
├── rules/                     # MTG rules reference
├── league/                    # League management
├── events/                    # Event management
├── players/                   # Player data
├── members/                   # Member management
└── index.html                 # Main navigation hub
```

---

## Getting Started

### Prerequisites

| Requirement     | Version   | Purpose                       |
|-----------------|-----------|-------------------------------|
| **Node.js**     | ≥ 16.x    | Discord bot runtime           |
| **npm**         | ≥ 8.x     | Package management            |
| **.NET SDK**    | 8.0       | Blazor WebAssembly (optional) |
| **Discord App** | —         | Bot token from Discord Developer Portal |

### Discord Bot Setup

```bash
# 1. Navigate to the bot directory
cd discord/BotFiles

# 2. Install dependencies
npm install

# 3. Configure the bot
#    Edit BotData/Settings/Settings.json with your:
#    - Discord bot token
#    - Client ID
#    - Command prefix (default: !)

# 4. Start the bot
node bot.js
```

> **Important:** Never commit your Discord bot token. See [Configuration](#configuration) for details.

### Web Application Setup

The web applications are static HTML/CSS/JS — no build step required:

```bash
# Open in a browser directly or use a local server
# Option 1: Direct
open index.html

# Option 2: Using Python
python3 -m http.server 8080

# Option 3: Using Node.js
npx serve .
```

### Blazor Application Setup

```bash
cd solution/mtgBot
dotnet restore
dotnet run
```

---

## Key Features

| Feature                     | Description                                              | Location                         |
|-----------------------------|----------------------------------------------------------|----------------------------------|
| **Command System**          | Prefix-based commands with JSON configuration            | `discord/BotFiles/Handlers/`     |
| **Event Handling**          | User joins, bans, kicks, message events                  | `discord/BotFiles/Handlers/`     |
| **Anti-Spam**               | Configurable warn/kick/ban thresholds                    | `discord/BotFiles/BotData/`      |
| **Booster Generation**      | Scryfall API-powered random booster packs                | `generateBooster/`               |
| **Chaos Commander Draft**   | Custom MTG draft format with interactive UI              | `chaos_commander_drafting/`      |
| **User Data Tracking**      | XP, statistics, and persistent user data                 | `discord/BotFiles/BotData/user/` |
| **Variable System**         | Global and server-scoped runtime variables               | `discord/BotFiles/BotData/`      |
| **AI Agent**                | MTG development assistant with personality traits        | `agents/`, `markdown/`           |
| **League Management**       | Events, members, forms, and registration                 | `league/`, `members/`, `forms/`  |

---

## Integration Files

This project includes structured integration files for AI-assisted development and project clarity:

### Prompts

> [`prompts/mtg-development-prompts.md`](prompts/mtg-development-prompts.md)

Curated AI prompt templates for MTG web development, Scryfall API integration, Discord bot features, game mechanics, and deck building tools.

### Instructions

> [`instructions/INSTRUCTIONS.md`](instructions/INSTRUCTIONS.md)

Complete setup, development, deployment, and contribution guide with step-by-step walkthroughs for every component of the project.

### Skills

> [`skills/SKILLS.md`](skills/SKILLS.md)

Technical skills reference covering all APIs, frameworks, and development capabilities required for MTG web and game development.

### Agents

> [`agents/mtgbot-agent.md`](agents/mtgbot-agent.md)

Agent configuration, behavior rules, personality traits, and prompt engineering guidelines for the mtgBot AI assistant.

### Hooks

> [`hooks/HOOKS.md`](hooks/HOOKS.md)

Event hooks, lifecycle integration points, and extension guide for the Discord bot and web application systems.

---

## API Integrations

| API                   | Base URL                          | Usage                                    |
|-----------------------|-----------------------------------|------------------------------------------|
| **Scryfall**          | `https://api.scryfall.com`        | Card data, images, booster generation    |
| **Discord**           | via discord.js                    | Bot commands, events, user management    |
| **Google Forms**      | Embedded links                    | League registration and surveys          |
| **Google Sheets**     | URL references                    | Standings, statistics, data analysis     |
| **MTG Fandom Wiki**  | `https://mtg.fandom.com`         | Rules, card lore, mechanics reference    |
| **CubeCobra**         | `https://cubecobra.com`          | Cube building and analysis               |
| **Draftmancer**       | `https://draftmancer.com`        | Draft simulation and testing             |

---

## Configuration

### Bot Settings (`discord/BotFiles/BotData/Settings/Settings.json`)

| Key         | Description                        | Default   |
|-------------|------------------------------------|-----------|
| `token`     | Discord bot token                  | (required)|
| `clientid`  | Discord application client ID     | (required)|
| `prefix`    | Command prefix                     | `!`       |

### Anti-Spam Rules (`discord/BotFiles/BotData/Settings/Rules.json`)

| Key                    | Description                        | Default |
|------------------------|------------------------------------|---------|
| `enabled`              | Enable anti-spam                   | `false` |
| `warnThreshold`        | Messages before warning            | `3`     |
| `kickThreshold`        | Messages before kick               | `5`     |
| `banThreshold`         | Messages before ban                | `7`     |
| `maxInterval`          | Time window (ms)                   | `2000`  |
| `maxDuplicatesInterval`| Duplicate check window (ms)       | `60000` |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Follow the [Instructions guide](instructions/INSTRUCTIONS.md) for development setup
4. Commit your changes (`git commit -m "Add my feature"`)
5. Push to the branch (`git push origin feature/my-feature`)
6. Open a Pull Request

---

## License

© 2024 9898-MTG. All rights reserved.
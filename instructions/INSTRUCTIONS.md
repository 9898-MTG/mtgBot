# Instructions

> Complete setup, development, deployment, and contribution guide for the mtgBot project.
> Follow these instructions to get started with any component of the 9898-MTG platform.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Discord Bot Setup](#discord-bot-setup)
  - [Prerequisites](#discord-bot-prerequisites)
  - [Installation](#discord-bot-installation)
  - [Configuration](#discord-bot-configuration)
  - [Running the Bot](#running-the-bot)
  - [Adding Commands](#adding-commands)
  - [Adding Events](#adding-events)
- [Web Application Setup](#web-application-setup)
  - [Local Development Server](#local-development-server)
  - [Booster Generator](#booster-generator)
  - [Chaos Commander Drafting](#chaos-commander-drafting)
- [Blazor WebAssembly Setup](#blazor-webassembly-setup)
- [AI Agent Setup](#ai-agent-setup)
- [Scryfall API Usage](#scryfall-api-usage)
- [Project Conventions](#project-conventions)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/9898-MTG/mtgBot.git
cd mtgBot

# For the Discord bot
cd discord/BotFiles
npm install
# Edit BotData/Settings/Settings.json with your bot token
node bot.js

# For web apps (open directly or use a server)
cd ../../
python3 -m http.server 8080
# Visit http://localhost:8080
```

---

## Discord Bot Setup

### Discord Bot Prerequisites

| Requirement        | Details                                                    |
|--------------------|------------------------------------------------------------|
| **Node.js**        | Version 16.x or higher                                    |
| **npm**            | Included with Node.js                                      |
| **Discord Account**| [discord.com](https://discord.com)                        |
| **Bot Application**| Create at [Discord Developer Portal](https://discord.com/developers/applications) |

### Discord Bot Installation

1. **Navigate to the bot directory:**
   ```bash
   cd discord/BotFiles
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs: discord.js, express, winston, discord-anti-spam, papaparse, node-fetch, flatted.

3. **Verify installation:**
   ```bash
   ls node_modules/.package-lock.json
   ```

### Discord Bot Configuration

Edit `BotData/Settings/Settings.json` with your bot credentials:

```json
{
  "settings": [{
    "token": "YOUR_DISCORD_BOT_TOKEN",
    "clientid": "YOUR_CLIENT_ID",
    "prefix": "!"
  }]
}
```

**How to get your bot token:**

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it (e.g., "mtgBot")
3. Go to **Bot** → click **Add Bot**
4. Click **Reset Token** → copy the token
5. Under **Privileged Gateway Intents**, enable:
   - `PRESENCE INTENT`
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
6. Go to **OAuth2** → **URL Generator**
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator` (or select specific permissions)
7. Copy the generated URL and open it to invite the bot to your server

> ⚠️ **Security:** Never commit your bot token to version control. Consider using environment variables or a `.env` file (add `.env` to `.gitignore`).

### Running the Bot

```bash
cd discord/BotFiles
node bot.js
```

**Expected output:**
- Winston logger initializes
- Bot connects to Discord
- Event handlers load
- Anti-spam module activates (if enabled)

**Logs:**
- Errors are written to `botErrors.log`
- Combined logs are written to `combined.log`

### Adding Commands

Commands are defined in `BotData/commands/commands.json`. Each command has:

```json
{
  "name": "commandname",
  "comType": "0",
  "permissions": "NONE",
  "restriction": "NONE",
  "actions": [
    {
      "type": 1,
      "name": "Send Message",
      "fields": ["channel", "message content"]
    }
  ]
}
```

**Action types:**

| Type | Name             | Description                        |
|------|------------------|------------------------------------|
| 1    | Send Message     | Send a message to a channel        |
| 2    | Send Embed       | Send an embedded message           |
| 3    | Edit User Data   | Modify user variables              |
| 4    | Set Variable     | Set a global or server variable    |
| 5    | Add Reaction     | Add a reaction to a message        |

### Adding Events

Events are defined in `BotData/commands/events.json`. Supported event types:

| Event              | Trigger                                |
|--------------------|----------------------------------------|
| `Bot Initialization` | When the bot starts                  |
| `User Joins Server`  | When a new member joins              |
| `User Banned`        | When a member is banned              |
| `User Kicked`        | When a member is kicked              |
| `Message Received`   | When any message is sent             |
| `Message Deleted`    | When a message is deleted            |
| `Channel Created`    | When a new channel is created        |

---

## Web Application Setup

### Local Development Server

All web applications are static HTML/CSS/JavaScript files. No build step is required.

**Option 1: Open directly**
```bash
open index.html
# or on Linux: xdg-open index.html
```

**Option 2: Python HTTP server**
```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

**Option 3: Node.js serve**
```bash
npx serve .
# Visit http://localhost:3000
```

### Booster Generator

Located in `generateBooster/`:

1. Open `generateBooster/index.html` in a browser
2. Enter Scryfall search syntax (e.g., `set:mh2 rarity:rare`)
3. Click **Generate** to fetch random cards from Scryfall API
4. Cards display as images in a grid layout

**Scryfall syntax examples:**

| Syntax                        | Result                                |
|-------------------------------|---------------------------------------|
| `set:mh2`                    | All cards from Modern Horizons 2      |
| `type:creature cmc<=3`       | Creatures with CMC 3 or less          |
| `id:RG type:creature`        | Red/Green identity creatures          |
| `rarity:mythic format:commander` | Mythic rares legal in Commander   |
| `keyword:flying color:U`     | Blue cards with flying                |

### Chaos Commander Drafting

Located in `chaos_commander_drafting/`:

1. Open `chaos_commander_drafting/index.html` in a browser
2. Follow the on-screen instructions for the draft format
3. Cards are fetched from Scryfall with randomized filters

---

## Blazor WebAssembly Setup

The Blazor app provides an alternative web interface using .NET 8.

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

### Build and Run

```bash
cd solution/mtgBot
dotnet restore
dotnet run
```

Visit `https://localhost:5001` (or the URL shown in terminal output).

### Project Structure

| File               | Purpose                             |
|--------------------|-------------------------------------|
| `Program.cs`       | Application host configuration      |
| `App.razor`        | Root component with routing         |
| `Pages/Home.razor` | Home page                           |
| `wwwroot/`         | Static assets (CSS, JS, images)     |

---

## AI Agent Setup

The mtgBot AI agent is configured for MTG development assistance.

### Using the Agent

- **Agent URL:** [mtgBot on Perchance](https://perchance.org/9898-mtg-chaos-rpg-2024)
- **Agent ID:** `29fe07f3-96bc-4eca-815d-3d31c1fcf6f4`

### Agent Configuration Files

| File                                        | Purpose                              |
|---------------------------------------------|--------------------------------------|
| `agents/mtgbot-agent.md`                    | Agent behavior and personality rules |
| `prompts/mtg-development-prompts.md`        | Prompt templates for the agent       |
| `skills/SKILLS.md`                          | Skills and capabilities reference    |
| `markdown/mtgBotInfo.md`                    | Original agent instructions          |

See [`agents/mtgbot-agent.md`](../agents/mtgbot-agent.md) for full configuration details.

---

## Scryfall API Usage

The Scryfall API is the primary data source for card information.

### Base URL

```
https://api.scryfall.com
```

### Key Endpoints

| Endpoint                           | Method | Description                    |
|------------------------------------|--------|--------------------------------|
| `/cards/search?q={query}`          | GET    | Search cards by query          |
| `/cards/random`                    | GET    | Get a random card              |
| `/cards/named?exact={name}`        | GET    | Get card by exact name         |
| `/cards/{id}`                      | GET    | Get card by Scryfall ID        |
| `/sets`                            | GET    | List all sets                  |
| `/sets/{code}`                     | GET    | Get set by code                |
| `/symbology`                       | GET    | List all mana symbols          |

### Rate Limits

- **Maximum:** 10 requests per second
- **Recommended:** 50–100ms delay between requests
- **Best practice:** Use bulk data endpoints for large datasets

### Example Usage (JavaScript)

```javascript
async function searchCards(query) {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Scryfall API error: ${response.status}`);
  const data = await response.json();
  return data.data; // Array of card objects
}

// Usage
const cards = await searchCards('type:creature set:mh2 rarity:rare');
cards.forEach(card => {
  console.log(`${card.name} - ${card.mana_cost}`);
});
```

---

## Project Conventions

### File Organization

| Directory        | Content                                          |
|------------------|--------------------------------------------------|
| Root-level dirs  | Each topic has its own directory with `index.html`|
| `discord/`       | All Discord bot code and data                    |
| `solution/`      | .NET/Blazor application                          |
| Markdown files   | Documentation and agent configuration            |

### Coding Style

- **JavaScript:** Vanilla ES6+, no transpilation required
- **HTML:** Semantic elements, accessibility attributes
- **CSS:** Dark red (`#8b0000`) and black (`#1a1a1a`) theme
- **JSON:** 2-space indentation for configuration files
- **Naming:** camelCase for JavaScript, PascalCase for C#

### Theme Colors

| Element      | Color     | Hex       |
|--------------|-----------|-----------|
| Background   | Black     | `#1a1a1a` |
| Primary      | Dark Red  | `#8b0000` |
| Accent       | Gold      | `#c9a52c` |
| Text         | Light Gray| `#e0e0e0` |
| Border       | Dark Gray | `#333333` |

---

## Troubleshooting

### Bot Won't Start

| Issue                        | Solution                                         |
|------------------------------|--------------------------------------------------|
| `TOKEN_INVALID`              | Verify token in Settings.json                    |
| `DISALLOWED_INTENTS`         | Enable intents in Discord Developer Portal       |
| Module not found             | Run `npm install` in `discord/BotFiles/`         |
| Node.js version error        | Upgrade to Node.js 16.x or higher               |

### Scryfall API Errors

| Status | Meaning            | Solution                                    |
|--------|--------------------|---------------------------------------------|
| `400`  | Bad Request        | Check search syntax                         |
| `404`  | Not Found          | Card or set does not exist                  |
| `429`  | Rate Limited       | Add delay between requests (100ms minimum)  |
| `500`  | Server Error       | Retry after a short wait                    |

### Web App Issues

| Issue                    | Solution                                          |
|--------------------------|---------------------------------------------------|
| CORS errors              | Use a local HTTP server instead of `file://`      |
| Cards not loading        | Check browser console for Scryfall API errors     |
| Styles not applying      | Verify `style.css` path in `<link>` tag           |
| Navigation not working   | Ensure `script.js` is loaded after the DOM        |

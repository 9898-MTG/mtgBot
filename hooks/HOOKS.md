# Hooks

> Event hooks, lifecycle integration points, and extension guide for the mtgBot platform.
> Hooks define how the Discord bot, web applications, and AI agent respond to events and integrate with external systems.

---

## Table of Contents

- [Overview](#overview)
- [Discord Bot Hooks](#discord-bot-hooks)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [Message Hooks](#message-hooks)
  - [Event Hooks](#event-hooks)
  - [Moderation Hooks](#moderation-hooks)
- [Web Application Hooks](#web-application-hooks)
  - [Scryfall API Hooks](#scryfall-api-hooks)
  - [UI Interaction Hooks](#ui-interaction-hooks)
  - [Navigation Hooks](#navigation-hooks)
- [Agent Hooks](#agent-hooks)
- [Variable System Hooks](#variable-system-hooks)
- [Creating Custom Hooks](#creating-custom-hooks)
- [Hook Reference Table](#hook-reference-table)

---

## Overview

Hooks in the mtgBot platform are integration points where custom logic can be triggered in response to events. They follow an event-driven architecture:

```
Event Occurs → Hook Triggered → Action Executed → Response Sent
```

**Hook Categories:**

| Category          | Source                         | Trigger Type             |
|-------------------|--------------------------------|--------------------------|
| Discord Bot       | `discord/BotFiles/`            | Discord API events       |
| Web Application   | `generateBooster/`, `chaos_commander_drafting/` | User interactions |
| Agent             | `agents/`, `prompts/`          | AI conversation events   |
| Variable System   | `BotData/varcache.js`          | Variable read/write      |

---

## Discord Bot Hooks

### Lifecycle Hooks

These hooks fire during bot startup and shutdown.

#### H01: Bot Initialization

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Bot connects to Discord successfully             |
| **Source**   | `discord/BotFiles/bot.js`                       |
| **Actions** | Load settings, initialize handlers, log startup  |

**Implementation:**
```javascript
// bot.js - Client ready event
client.on('ready', () => {
  // H01: Bot Initialization Hook
  // - Load settings from Settings.json
  // - Initialize message and event handlers
  // - Start anti-spam module
  // - Log startup with winston
  logger.info(`Bot logged in as ${client.user.tag}`);
});
```

**Extension Point:** Add custom initialization logic after the `ready` event fires. Load additional data, connect to external services, or send startup notifications.

---

#### H02: Settings Load

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Settings.json is read at startup                 |
| **Source**   | `discord/BotFiles/bot.js`                       |
| **Data**     | Bot token, client ID, prefix, channel settings  |

**Configuration (`BotData/Settings/Settings.json`):**
```json
{
  "settings": [{
    "token": "BOT_TOKEN",
    "clientid": "CLIENT_ID",
    "prefix": "!"
  }]
}
```

---

### Message Hooks

These hooks fire when messages are received in Discord.

#### H03: Message Received

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Any message in a monitored channel               |
| **Source**   | `discord/BotFiles/Handlers/Message.js`          |
| **Input**    | Discord Message object                          |
| **Actions** | Parse command, check permissions, execute action |

**Flow:**
```
Message Received
├── Check if author is bot → Skip if true
├── Check for command prefix
│   ├── Yes → Parse command name and arguments
│   │   ├── Look up in commands.json
│   │   ├── Check permissions
│   │   └── Execute action sequence
│   └── No → Check event triggers
├── Process variable substitutions
└── Send response (if any)
```

**Extension Point:** Add custom message processing logic by modifying the action sequence in `commands.json`. Add new action types in `Message.js`.

---

#### H04: Command Execution

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Valid command with proper permissions             |
| **Source**   | `discord/BotFiles/Handlers/Message.js`          |
| **Input**    | Command name, arguments, user context           |
| **Output**   | Bot response (message, embed, data update)      |

**Action Types:**

| Type | Action           | Description                        | Fields                    |
|------|------------------|------------------------------------|---------------------------|
| 1    | Send Message     | Send text to a channel             | channel, message          |
| 2    | Send Embed       | Send embedded message              | channel, title, fields    |
| 3    | Edit User Data   | Modify user variables              | user, variable, value     |
| 4    | Set Variable     | Set global/server variable         | scope, name, value        |
| 5    | Add Reaction     | React to a message                 | message, emoji            |

---

#### H05: Variable Substitution

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Message contains `${variable}` patterns          |
| **Source**   | `discord/BotFiles/BotData/varcache.js`          |
| **Input**    | Raw message string with variable placeholders   |
| **Output**   | Resolved message string with values             |

**Built-in Variables:**

| Variable          | Resolves To                    |
|-------------------|--------------------------------|
| `${user}`         | Message author username        |
| `${userid}`       | Message author ID              |
| `${server}`       | Server name                    |
| `${serverid}`     | Server ID                      |
| `${channel}`      | Channel name                   |
| `${channelid}`    | Channel ID                     |
| `${membercount}`  | Total server members           |
| `${date}`         | Current date                   |
| `${time}`         | Current time                   |
| `${random:X}`     | Random number from 0 to X     |

**Extension Point:** Add custom variables by extending the variable cache in `varcache.js`.

---

### Event Hooks

These hooks fire when Discord server events occur.

#### H06: Member Join

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | New member joins the server                      |
| **Source**   | `discord/BotFiles/Handlers/Events.js`           |
| **Input**    | GuildMember object                              |
| **Actions** | Send welcome message, assign roles, log event   |

**Configuration (`BotData/commands/events.json`):**
```json
{
  "name": "User Joins Server",
  "temp": "member",
  "actions": [
    {
      "type": 1,
      "name": "Send Message",
      "fields": ["welcome-channel", "Welcome ${user} to the server!"]
    }
  ]
}
```

---

#### H07: Member Ban

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Member is banned from the server                 |
| **Source**   | `discord/BotFiles/Handlers/Events.js`           |
| **Input**    | GuildBan object                                 |
| **Actions** | Log event, send notification, update records    |

---

#### H08: Member Kick

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Member is kicked from the server                 |
| **Source**   | `discord/BotFiles/Handlers/Events.js`           |
| **Input**    | GuildMember object                              |

---

#### H09: Channel Created

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | New channel is created in the server             |
| **Source**   | `discord/BotFiles/Handlers/Events.js`           |
| **Input**    | Channel object                                  |

---

#### H10: Message Deleted

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Message is deleted in a monitored channel        |
| **Source**   | `discord/BotFiles/Handlers/Events.js`           |
| **Input**    | Message object (partial)                        |

---

### Moderation Hooks

These hooks fire when the anti-spam system takes action.

#### H11: Spam Warning

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User exceeds `warnThreshold` messages            |
| **Source**   | discord-anti-spam module                        |
| **Config**  | `BotData/Settings/Rules.json`                   |
| **Action**  | Send warning message to user                     |

---

#### H12: Spam Kick

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User exceeds `kickThreshold` messages            |
| **Source**   | discord-anti-spam module                        |
| **Action**  | Kick user from server                            |

---

#### H13: Spam Ban

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User exceeds `banThreshold` messages             |
| **Source**   | discord-anti-spam module                        |
| **Action**  | Ban user from server                             |

---

## Web Application Hooks

### Scryfall API Hooks

#### H14: Card Search

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User submits a search query                      |
| **Source**   | `generateBooster/script.js`                     |
| **Input**    | Scryfall search syntax string                   |
| **Output**   | Array of card objects                           |
| **API**      | `GET https://api.scryfall.com/cards/search`     |

**Implementation:**
```javascript
// generateBooster/script.js - Card search hook
async function onCardSearch(syntax) {
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(syntax)}`;
  const response = await fetch(url);
  const data = await response.json();
  displayCards(data.data);
}
```

**Extension Point:** Add post-processing logic (filtering, sorting, caching) after the API response.

---

#### H15: Booster Generation

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User clicks generate/re-roll button              |
| **Source**   | `generateBooster/script.js`                     |
| **Input**    | Scryfall syntax + pack configuration            |
| **Output**   | Array of cards matching rarity distribution     |

---

### UI Interaction Hooks

#### H16: Navigation Menu Selection

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User selects an option from the navigation dropdown |
| **Source**   | `script.js` (root)                              |
| **Input**    | Selected option value                           |
| **Output**   | Page redirect to `/{value}/index.html`          |

**Implementation:**
```javascript
// script.js - Navigation hook
document.getElementById('menu').addEventListener('change', function() {
  const selected = this.value;
  window.location.href = `${selected}/index.html`;
});
```

---

#### H17: Card Display Interaction

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User hovers/clicks on a card image               |
| **Source**   | Various web app scripts                         |
| **Input**    | Card element reference                          |
| **Output**   | Zoom effect, detail panel, or modal display     |

---

## Agent Hooks

#### H18: Conversation Start

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | New conversation with mtgBot agent               |
| **Source**   | `agents/mtgbot-agent.md`                        |
| **Action**  | Display greeting, set personality mode           |

---

#### H19: Code Generation Request

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | User requests code or web app generation         |
| **Source**   | `prompts/mtg-development-prompts.md`            |
| **Action**  | Select appropriate prompt template, generate code |

---

#### H20: Error Encountered

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Agent encounters an error in user's code         |
| **Source**   | `agents/mtgbot-agent.md`                        |
| **Action**  | Identify error, explain cause, provide fix       |

---

## Variable System Hooks

#### H21: Variable Read

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Variable placeholder `${name}` is encountered    |
| **Source**   | `BotData/varcache.js`                           |
| **Input**    | Variable name and scope                         |
| **Output**   | Resolved value from global or server vars       |

---

#### H22: Variable Write

| Property    | Value                                           |
|-------------|-------------------------------------------------|
| **Trigger** | Set Variable action is executed                  |
| **Source**   | `BotData/varcache.js`                           |
| **Input**    | Variable name, scope, new value                 |
| **Output**   | Updated JSON file (globalvars or servervars)    |

---

## Creating Custom Hooks

### Step 1: Define the Hook

Decide what event triggers the hook and what action it should perform.

```javascript
// Example: Custom hook for tracking card searches
const hookDefinition = {
  name: "Card Search Tracker",
  trigger: "cardSearch",
  action: "logSearchQuery",
  source: "generateBooster/script.js"
};
```

### Step 2: Register the Hook

**For Discord Bot hooks:** Add an event entry in `BotData/commands/events.json`:

```json
{
  "name": "Custom Event Name",
  "temp": "eventData",
  "actions": [
    {
      "type": 1,
      "name": "Send Message",
      "fields": ["log-channel", "Event triggered: ${eventData}"]
    }
  ]
}
```

**For Web Application hooks:** Add an event listener in the relevant script file:

```javascript
// Register a custom hook
document.addEventListener('customEvent', function(event) {
  // Hook logic here
  console.log('Hook triggered:', event.detail);
});

// Fire the hook
document.dispatchEvent(new CustomEvent('customEvent', {
  detail: { query: 'type:creature', results: 42 }
}));
```

### Step 3: Test the Hook

1. Trigger the event that should fire the hook
2. Verify the action executes correctly
3. Check logs for any errors (winston for bot, browser console for web)

---

## Hook Reference Table

| Hook ID | Name                    | Category   | Trigger                    | Source                 |
|---------|-------------------------|------------|----------------------------|------------------------|
| H01     | Bot Initialization      | Lifecycle  | Bot connects               | `bot.js`               |
| H02     | Settings Load           | Lifecycle  | Settings.json read         | `bot.js`               |
| H03     | Message Received        | Message    | Any message                | `Message.js`           |
| H04     | Command Execution       | Message    | Valid command               | `Message.js`           |
| H05     | Variable Substitution   | Message    | `${var}` pattern           | `varcache.js`          |
| H06     | Member Join             | Event      | New member                 | `Events.js`            |
| H07     | Member Ban              | Event      | Member banned              | `Events.js`            |
| H08     | Member Kick             | Event      | Member kicked              | `Events.js`            |
| H09     | Channel Created         | Event      | New channel                | `Events.js`            |
| H10     | Message Deleted         | Event      | Message removed            | `Events.js`            |
| H11     | Spam Warning            | Moderation | Warn threshold             | `discord-anti-spam`    |
| H12     | Spam Kick               | Moderation | Kick threshold             | `discord-anti-spam`    |
| H13     | Spam Ban                | Moderation | Ban threshold              | `discord-anti-spam`    |
| H14     | Card Search             | API        | Search query               | `generateBooster/`     |
| H15     | Booster Generation      | API        | Generate button            | `generateBooster/`     |
| H16     | Navigation Selection    | UI         | Menu change                | `script.js`            |
| H17     | Card Display            | UI         | Card hover/click           | Various                |
| H18     | Conversation Start      | Agent      | New conversation           | `agents/`              |
| H19     | Code Generation Request | Agent      | Code request               | `prompts/`             |
| H20     | Error Encountered       | Agent      | Error in user code         | `agents/`              |
| H21     | Variable Read           | Variable   | `${name}` encountered      | `varcache.js`          |
| H22     | Variable Write          | Variable   | Set Variable action        | `varcache.js`          |

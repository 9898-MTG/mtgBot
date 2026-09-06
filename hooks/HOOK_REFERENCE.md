# Hook Reference

> Auto-generated from `hooks/HookRegistry.js` and `hooks/schemas.js`.
> Generated: 2026-09-06

---

## Table of Contents

- [Lifecycle Hooks](#lifecycle-hooks)
- [Message Hooks](#message-hooks)
- [Event Hooks](#event-hooks)
- [Moderation Hooks](#moderation-hooks)
- [Variable Hooks](#variable-hooks)
- [Web Hooks](#web-hooks)

---

## Lifecycle Hooks

### H01:BotInit

| Property | Value |
|----------|-------|
| **ID** | H01 |
| **Name** | Bot Initialization |
| **Category** | lifecycle |
| **Trigger** | Bot connects to Discord successfully |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `timestamp` | number | Unix timestamp of initialization |

**Usage:**

```javascript
hooks.register("H01:BotInit", (payload) => {
    console.log("Bot Initialization triggered", payload);
});
```

---

### H02:SettingsLoad

| Property | Value |
|----------|-------|
| **ID** | H02 |
| **Name** | Settings Load |
| **Category** | lifecycle |
| **Trigger** | Settings.json is read at startup |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `source` | string (env \| json) | Configuration source |
| `hasToken` | boolean | Whether a bot token was found |
| `prefix` | string | Command prefix |

**Usage:**

```javascript
hooks.register("H02:SettingsLoad", (payload) => {
    console.log("Settings Load triggered", payload);
});
```

---

### H03:BotReady

| Property | Value |
|----------|-------|
| **ID** | H03 |
| **Name** | Bot Ready |
| **Category** | lifecycle |
| **Trigger** | Bot fully initialized and ready to process events |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guildCount` | number | Number of guilds the bot is in |
| `timestamp` | number | Unix timestamp |

**Usage:**

```javascript
hooks.register("H03:BotReady", (payload) => {
    console.log("Bot Ready triggered", payload);
});
```

---

### H04:BotShutdown

| Property | Value |
|----------|-------|
| **ID** | H04 |
| **Name** | Bot Shutdown |
| **Category** | lifecycle |
| **Trigger** | Bot is shutting down gracefully |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `reason` | string | Shutdown reason |
| `timestamp` | number | Unix timestamp |

**Usage:**

```javascript
hooks.register("H04:BotShutdown", (payload) => {
    console.log("Bot Shutdown triggered", payload);
});
```

---

## Message Hooks

### H10:MessageReceived

| Property | Value |
|----------|-------|
| **ID** | H10 |
| **Name** | Message Received |
| **Category** | message |
| **Trigger** | Any message in a monitored channel |
| **Source** | `discord/BotFiles/Handlers/Message.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `message` | object | Discord Message object |
| `isCommand` | boolean | Whether the message starts with the command prefix |

**Usage:**

```javascript
hooks.register("H10:MessageReceived", (payload) => {
    console.log("Message Received triggered", payload);
});
```

---

### H11:CommandParsed

| Property | Value |
|----------|-------|
| **ID** | H11 |
| **Name** | Command Parsed |
| **Category** | message |
| **Trigger** | A command prefix message is identified and parsed |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `commandName` | string | Parsed command name |
| `args` | array | Parsed command arguments |
| `message` | object | Discord Message object |

**Usage:**

```javascript
hooks.register("H11:CommandParsed", (payload) => {
    console.log("Command Parsed triggered", payload);
});
```

---

### H12:CommandExecuted

| Property | Value |
|----------|-------|
| **ID** | H12 |
| **Name** | Command Executed |
| **Category** | message |
| **Trigger** | Valid command executed with proper permissions |
| **Source** | `discord/BotFiles/Handlers/Message.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `commandName` | string | Executed command name |
| `args` | array | Command arguments |
| `success` | boolean | Whether the command succeeded |

**Usage:**

```javascript
hooks.register("H12:CommandExecuted", (payload) => {
    console.log("Command Executed triggered", payload);
});
```

---

### H13:ActionExecuted

| Property | Value |
|----------|-------|
| **ID** | H13 |
| **Name** | Action Executed |
| **Category** | message |
| **Trigger** | An individual action in a command sequence completes |
| **Source** | `discord/BotFiles/Handlers/Message.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `actionType` | string | Type of action executed |
| `actionName` | string | Name of the action |
| `index` | number | Action index in the sequence |

**Usage:**

```javascript
hooks.register("H13:ActionExecuted", (payload) => {
    console.log("Action Executed triggered", payload);
});
```

---

## Event Hooks

### H20:MemberJoin

| Property | Value |
|----------|-------|
| **ID** | H20 |
| **Name** | Member Join |
| **Category** | event |
| **Trigger** | New member joins the server |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `member` | object | Discord GuildMember object |

**Usage:**

```javascript
hooks.register("H20:MemberJoin", (payload) => {
    console.log("Member Join triggered", payload);
});
```

---

### H21:MemberLeave

| Property | Value |
|----------|-------|
| **ID** | H21 |
| **Name** | Member Leave |
| **Category** | event |
| **Trigger** | Member leaves or is removed from server |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `member` | object | Discord GuildMember object |

**Usage:**

```javascript
hooks.register("H21:MemberLeave", (payload) => {
    console.log("Member Leave triggered", payload);
});
```

---

### H22:EventHandled

| Property | Value |
|----------|-------|
| **ID** | H22 |
| **Name** | Event Handled |
| **Category** | event |
| **Trigger** | A Discord event has been processed by the event handler |
| **Source** | `discord/BotFiles/Handlers/Events.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Event type name |
| `guild` | object | Discord Guild object |

**Usage:**

```javascript
hooks.register("H22:EventHandled", (payload) => {
    console.log("Event Handled triggered", payload);
});
```

---

### H23:InteractionReceived

| Property | Value |
|----------|-------|
| **ID** | H23 |
| **Name** | Interaction Received |
| **Category** | event |
| **Trigger** | Button, select menu, or slash command interaction |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | string (button \| select \| command) | Interaction type |
| `guild` | object | Discord Guild object |
| `interaction` | object | Discord Interaction object |

**Usage:**

```javascript
hooks.register("H23:InteractionReceived", (payload) => {
    console.log("Interaction Received triggered", payload);
});
```

---

## Moderation Hooks

### H30:SpamDetected

| Property | Value |
|----------|-------|
| **ID** | H30 |
| **Name** | Spam Detected |
| **Category** | moderation |
| **Trigger** | Anti-spam system detects potential spam |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `user` | object | Discord User object |
| `action` | string (warn \| kick \| ban) | Moderation action taken |

**Usage:**

```javascript
hooks.register("H30:SpamDetected", (payload) => {
    console.log("Spam Detected triggered", payload);
});
```

---

### H31:UserBanned

| Property | Value |
|----------|-------|
| **ID** | H31 |
| **Name** | User Banned |
| **Category** | moderation |
| **Trigger** | User is banned from the server |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `user` | object | Banned Discord User object |

**Usage:**

```javascript
hooks.register("H31:UserBanned", (payload) => {
    console.log("User Banned triggered", payload);
});
```

---

### H32:UserKicked

| Property | Value |
|----------|-------|
| **ID** | H32 |
| **Name** | User Kicked |
| **Category** | moderation |
| **Trigger** | User is kicked from the server |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guild` | object | Discord Guild object |
| `member` | object | Kicked Discord GuildMember object |

**Usage:**

```javascript
hooks.register("H32:UserKicked", (payload) => {
    console.log("User Kicked triggered", payload);
});
```

---

## Variable Hooks

### H40:VarRead

| Property | Value |
|----------|-------|
| **ID** | H40 |
| **Name** | Variable Read |
| **Category** | variable |
| **Trigger** | A variable is read from the cache |
| **Source** | `discord/BotFiles/BotData/varcache.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guildId` | string | Guild ID |
| `name` | string | Variable name |
| `value` | any | Variable value |

**Usage:**

```javascript
hooks.register("H40:VarRead", (payload) => {
    console.log("Variable Read triggered", payload);
});
```

---

### H41:VarWrite

| Property | Value |
|----------|-------|
| **ID** | H41 |
| **Name** | Variable Write |
| **Category** | variable |
| **Trigger** | A variable is written to the cache |
| **Source** | `discord/BotFiles/BotData/varcache.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `guildId` | string | Guild ID |
| `name` | string | Variable name |
| `oldValue` | any | Previous value |
| `newValue` | any | New value |

**Usage:**

```javascript
hooks.register("H41:VarWrite", (payload) => {
    console.log("Variable Write triggered", payload);
});
```

---

### H42:VarsPersisted

| Property | Value |
|----------|-------|
| **ID** | H42 |
| **Name** | Variables Persisted |
| **Category** | variable |
| **Trigger** | Variables are written to disk (servervars.json / globalvars.json) |
| **Source** | `discord/BotFiles/bot.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `scope` | string (server \| global) | Variable scope |
| `timestamp` | number | Unix timestamp |

**Usage:**

```javascript
hooks.register("H42:VarsPersisted", (payload) => {
    console.log("Variables Persisted triggered", payload);
});
```

---

## Web Hooks

### H50:BoosterGenerated

| Property | Value |
|----------|-------|
| **ID** | H50 |
| **Name** | Booster Generated |
| **Category** | web |
| **Trigger** | A booster pack is generated via Scryfall API |
| **Source** | `generateBooster/script.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `syntax` | string | Scryfall search syntax used |
| `cardCount` | number | Number of cards returned |
| `success` | boolean | Whether generation succeeded |

**Usage:**

```javascript
hooks.register("H50:BoosterGenerated", (payload) => {
    console.log("Booster Generated triggered", payload);
});
```

---

### H51:DraftStarted

| Property | Value |
|----------|-------|
| **ID** | H51 |
| **Name** | Draft Started |
| **Category** | web |
| **Trigger** | A Chaos Commander draft pack is generated |
| **Source** | `chaos_commander_drafting/script.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `cardCount` | number | Number of cards in the draft pack |
| `success` | boolean | Whether draft generation succeeded |

**Usage:**

```javascript
hooks.register("H51:DraftStarted", (payload) => {
    console.log("Draft Started triggered", payload);
});
```

---

### H52:ApiRequest

| Property | Value |
|----------|-------|
| **ID** | H52 |
| **Name** | API Request |
| **Category** | web |
| **Trigger** | An external API call is made (Scryfall, etc.) |
| **Source** | `lib/utils.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | API URL |
| `method` | string | HTTP method |
| `status` | number | HTTP status code |
| `duration` | number | Request duration in ms |

**Usage:**

```javascript
hooks.register("H52:ApiRequest", (payload) => {
    console.log("API Request triggered", payload);
});
```

---

### H53:NavChange

| Property | Value |
|----------|-------|
| **ID** | H53 |
| **Name** | Navigation Change |
| **Category** | web |
| **Trigger** | User navigates via the main menu |
| **Source** | `script.js` |

**Payload:**

| Field | Type | Description |
|-------|------|-------------|
| `from` | string | Previous page |
| `to` | string | Target page |

**Usage:**

```javascript
hooks.register("H53:NavChange", (payload) => {
    console.log("Navigation Change triggered", payload);
});
```

---

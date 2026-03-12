# Skills

> Technical skills, capabilities, and API reference for Magic: The Gathering web and game development.
> This document defines what the mtgBot platform and its agents are capable of.

---

## Table of Contents

- [Core Skills](#core-skills)
- [Scryfall API Skills](#scryfall-api-skills)
- [Discord Bot Skills](#discord-bot-skills)
- [Web Development Skills](#web-development-skills)
- [Game Mechanics Skills](#game-mechanics-skills)
- [Data Management Skills](#data-management-skills)
- [AI Agent Skills](#ai-agent-skills)
- [Skill Reference Matrix](#skill-reference-matrix)

---

## Core Skills

### S01: MTG Card Data Retrieval

**Description:** Fetch and display Magic: The Gathering card data from the Scryfall API.

| Attribute      | Value                                    |
|----------------|------------------------------------------|
| **Input**      | Card name, search query, or Scryfall syntax |
| **Output**     | Card object with name, cost, type, text, image |
| **API**        | `GET https://api.scryfall.com/cards/search?q={query}` |
| **Rate Limit** | 10 requests/second, 100ms recommended delay |

**Implementation:**
```javascript
async function fetchCard(query) {
  const response = await fetch(
    `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.data;
}
```

---

### S02: Booster Pack Generation

**Description:** Generate random booster packs from card pools using Scryfall search filters.

| Attribute      | Value                                    |
|----------------|------------------------------------------|
| **Input**      | Scryfall search syntax, pack size        |
| **Output**     | Array of card objects matching rarity distribution |
| **Distribution** | 1 rare/mythic, 3 uncommons, 10 commons, 1 land |
| **Source**      | `generateBooster/script.js`              |

**Scryfall Syntax Filters:**

| Filter          | Example                    | Description                     |
|-----------------|----------------------------|---------------------------------|
| `id:`           | `id:RG`                    | Color identity                  |
| `color:`        | `color:blue`               | Card color                      |
| `type:`         | `type:creature`            | Card type                       |
| `rarity:`       | `rarity:rare`              | Card rarity                     |
| `set:`          | `set:mh2`                  | Set code                        |
| `cmc=`          | `cmc>=3`                   | Converted mana cost             |
| `power=`        | `power>=4`                 | Creature power                  |
| `toughness=`    | `toughness<=2`             | Creature toughness              |
| `keyword:`      | `keyword:flying`           | Keyword ability                 |
| `format:`       | `format:commander`         | Format legality                 |
| `frame:`        | `frame:2015`               | Card frame style                |
| `watermark:`    | `watermark:dimir`          | Card watermark                  |
| `border:`       | `border:borderless`        | Border type                     |
| `game:`         | `game:paper`               | Game type                       |
| `lang:`         | `lang:en`                  | Language                        |

---

### S03: Discord Command Processing

**Description:** Parse and execute user commands from Discord messages.

| Attribute      | Value                                    |
|----------------|------------------------------------------|
| **Input**      | Discord message with command prefix      |
| **Output**     | Bot action (message, embed, data update) |
| **Prefix**     | `!` (configurable)                       |
| **Source**      | `discord/BotFiles/Handlers/Message.js`   |

**Command Flow:**
1. Message received → check for prefix
2. Parse command name and arguments
3. Look up command in `commands.json`
4. Check permissions
5. Execute action sequence
6. Handle variable substitution
7. Send response

---

### S04: Event-Driven Automation

**Description:** Respond to Discord server events with automated actions.

| Attribute      | Value                                    |
|----------------|------------------------------------------|
| **Input**      | Discord events (member join, ban, message) |
| **Output**     | Automated bot response/action            |
| **Source**      | `discord/BotFiles/Handlers/Events.js`    |

**Supported Events:**

| Event                  | Trigger                              |
|------------------------|--------------------------------------|
| `Bot Initialization`   | Bot startup                          |
| `User Joins Server`    | New member joins guild               |
| `User Banned`          | Member is banned                     |
| `User Kicked`          | Member is kicked                     |
| `Message Received`     | Any message in monitored channels    |
| `Message Deleted`      | Message is removed                   |
| `Channel Created`      | New channel is added                 |

---

## Scryfall API Skills

### S05: Card Search and Filtering

**Description:** Build complex card searches using Scryfall's full-text search syntax.

**Operators:**

| Operator | Example                | Description                     |
|----------|------------------------|---------------------------------|
| `AND`    | `type:creature cmc:3`  | Both conditions (implicit)      |
| `OR`     | `color:R OR color:G`   | Either condition                |
| `NOT`    | `NOT type:land`        | Exclude condition               |
| `-`      | `-type:land`           | Shorthand for NOT               |
| `()`     | `(color:R OR color:G)` | Group conditions                |

**Regex Support:**

| Field          | Syntax                          | Example                        |
|----------------|---------------------------------|--------------------------------|
| Name           | `name:/regex/`                  | `name:/^lightning/`            |
| Oracle text    | `oracle:/regex/`                | `oracle:/draw.*card/`          |
| Artist         | `artist:/regex/`                | `artist:/^john/`               |
| Flavor text    | `flavor:/regex/`                | `flavor:/darkness/`            |

---

### S06: Card Image Display

**Description:** Retrieve and display card images from Scryfall.

**Image URIs (from card object):**

| Size      | Field                     | Resolution | Use Case            |
|-----------|---------------------------|------------|---------------------|
| Small     | `image_uris.small`        | 146×204    | Thumbnails          |
| Normal    | `image_uris.normal`       | 488×680    | Standard display    |
| Large     | `image_uris.large`        | 672×936    | Detailed view       |
| PNG       | `image_uris.png`          | 745×1040   | High quality        |
| Art Crop  | `image_uris.art_crop`     | Varies     | Art-only display    |
| Border Crop | `image_uris.border_crop`| 480×680    | No border           |

---

### S07: Set and Collection Data

**Description:** Access MTG set information and collection data.

**Endpoints:**

| Endpoint          | Returns                              |
|-------------------|--------------------------------------|
| `/sets`           | All MTG sets with codes and dates    |
| `/sets/{code}`    | Specific set details                 |
| `/cards/random`   | Random card from all sets            |
| `/symbology`      | Mana symbols and SVG images          |
| `/catalog/card-names` | All card names for autocomplete |

---

## Discord Bot Skills

### S08: Message Handling

**Description:** Process all incoming Discord messages with variable substitution and action execution.

**Variable System:**

| Variable           | Resolves To                          |
|--------------------|--------------------------------------|
| `${user}`          | Message author username              |
| `${server}`        | Server name                          |
| `${channel}`       | Channel name                         |
| `${membercount}`   | Total server members                 |
| `${date}`          | Current date                         |
| `${time}`          | Current time                         |
| `${random:X}`      | Random number 0 to X                |

**Source:** `discord/BotFiles/BotData/varcache.js`

---

### S09: User Data Management

**Description:** Track and manage user data including XP, levels, and statistics.

| Data Point      | Storage                                    |
|-----------------|---------------------------------------------|
| User XP         | `BotData/user/user.json`                    |
| Server vars     | `BotData/variables/servervars.json`         |
| Global vars     | `BotData/variables/globalvars.json`         |

---

### S10: Anti-Spam Protection

**Description:** Protect the Discord server from spam using configurable thresholds.

| Parameter              | Default | Description                     |
|------------------------|---------|---------------------------------|
| `warnThreshold`        | 3       | Messages before warning         |
| `kickThreshold`        | 5       | Messages before kick            |
| `banThreshold`         | 7       | Messages before ban             |
| `maxInterval`          | 2000ms  | Time window for spam detection  |
| `maxDuplicatesWarning` | 4       | Duplicate messages before warn  |
| `maxDuplicatesKick`    | 7       | Duplicate messages before kick  |
| `maxDuplicatesBan`     | 12      | Duplicate messages before ban   |

**Source:** `discord/BotFiles/BotData/Settings/Rules.json`

---

## Web Development Skills

### S11: MTG-Themed UI Development

**Description:** Build web interfaces with the 9898-MTG dark red and black theme.

**Theme Specification:**

| Element        | Color        | CSS Value             |
|----------------|--------------|------------------------|
| Background     | Dark Black   | `#1a1a1a`             |
| Primary        | Dark Red     | `#8b0000`             |
| Accent         | Gold         | `#c9a52c`             |
| Text           | Light Gray   | `#e0e0e0`             |
| Card Border    | Gray         | `#333333`             |
| Heading Font   | ARCENA       | `url('ARCENA.ttf')`   |

---

### S12: Interactive Game Components

**Description:** Build JavaScript-based interactive game components.

**Component Library:**

| Component          | Purpose                                |
|--------------------|----------------------------------------|
| Card Viewer        | Display card with hover zoom           |
| Life Counter       | Track player life totals               |
| Mana Pool          | Display and manage mana                |
| Turn Tracker       | Navigate through MTG phases/steps      |
| Battlefield Grid   | Arrange cards in play                  |
| Deck List Editor   | Add/remove/sort cards                  |

---

## Game Mechanics Skills

### S13: Turn Structure Management

**Description:** Implement the complete MTG turn structure.

**Phase Sequence:**

```
Beginning Phase
├── Untap Step
├── Upkeep Step
└── Draw Step
Main Phase (Pre-Combat)
Combat Phase
├── Beginning of Combat Step
├── Declare Attackers Step
├── Declare Blockers Step
├── Combat Damage Step
└── End of Combat Step
Main Phase (Post-Combat)
Ending Phase
├── End Step
└── Cleanup Step
```

---

### S14: Zone Management

**Description:** Track and manage MTG game zones.

| Zone           | Visibility | Ordered | Notes                        |
|----------------|------------|---------|------------------------------|
| Library        | Hidden     | Yes     | Draw from top                |
| Hand           | Owner only | No      | Maximum hand size: 7         |
| Battlefield    | Public     | No      | Tapped/untapped state        |
| Graveyard      | Public     | Yes     | Last in, first out           |
| Exile          | Public     | No      | Face-up by default           |
| Command Zone   | Public     | No      | Commander tax tracking       |
| Stack          | Public     | Yes     | LIFO resolution              |

---

## Data Management Skills

### S15: JSON Configuration Management

**Description:** Read, write, and manage JSON-based configuration and data files.

**Configuration Files:**

| File                          | Purpose                      |
|-------------------------------|------------------------------|
| `Settings.json`               | Bot token, prefix, client ID |
| `Rules.json`                  | Anti-spam thresholds         |
| `commands.json`               | Command definitions          |
| `events.json`                 | Event definitions            |
| `globalvars.json`             | Global runtime variables     |
| `servervars.json`             | Server-scoped variables      |
| `user.json`                   | User data and statistics     |

---

### S16: CSV Data Processing

**Description:** Parse and process CSV data using PapaParse.

| Feature           | Detail                                |
|-------------------|---------------------------------------|
| Library           | PapaParse v5.2.0                      |
| Input             | CSV files (e.g., game data sheets)    |
| Output            | JavaScript array of objects           |
| Source             | `BotData/sheets/` directory           |

---

## AI Agent Skills

### S17: MTG Code Generation

**Description:** Generate HTML, CSS, and JavaScript code for MTG web applications.

**Capabilities:**
- Create interactive MTG web apps with dark red/black theme
- Generate Scryfall API integration code
- Build game zone layouts and turn trackers
- Create deck building and analysis tools
- Produce booster pack generation logic

---

### S18: MTG Knowledge Base

**Description:** Access and apply MTG rules, mechanics, and game knowledge.

**Resources:**

| Resource              | URL                                        |
|-----------------------|--------------------------------------------|
| Scryfall              | https://scryfall.com                       |
| MTG Fandom Wiki       | https://mtg.fandom.com                     |
| CubeCobra             | https://cubecobra.com                      |
| Draftmancer           | https://draftmancer.com                    |
| Untap.in              | https://untap.in                           |
| TappedOut             | https://tappedout.net                      |
| Perchance Generator   | https://perchance.org/9898-mtg-chaos-rpg-2024 |

---

## Skill Reference Matrix

| Skill ID | Name                       | Category      | Components Used               |
|----------|----------------------------|---------------|-------------------------------|
| S01      | Card Data Retrieval        | API           | Scryfall API, fetch           |
| S02      | Booster Pack Generation    | Game          | Scryfall API, generateBooster |
| S03      | Command Processing         | Bot           | Message.js, commands.json     |
| S04      | Event Automation           | Bot           | Events.js, events.json        |
| S05      | Card Search & Filtering    | API           | Scryfall search syntax        |
| S06      | Card Image Display         | UI            | Scryfall image URIs           |
| S07      | Set & Collection Data      | API           | Scryfall sets endpoint        |
| S08      | Message Handling           | Bot           | Message.js, varcache.js       |
| S09      | User Data Management       | Data          | user.json, variables          |
| S10      | Anti-Spam Protection       | Bot           | discord-anti-spam, Rules.json |
| S11      | MTG-Themed UI              | UI            | CSS, ARCENA.ttf               |
| S12      | Interactive Components     | UI            | Vanilla JavaScript            |
| S13      | Turn Structure             | Game          | Phase/step sequence           |
| S14      | Zone Management            | Game          | MTG zone rules                |
| S15      | JSON Configuration         | Data          | Settings, commands, events    |
| S16      | CSV Data Processing        | Data          | PapaParse, sheets             |
| S17      | Code Generation            | AI            | mtgBot agent, prompts         |
| S18      | MTG Knowledge Base         | AI            | External resources            |

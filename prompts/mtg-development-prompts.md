# MTG Development Prompts

> AI prompt templates for Magic: The Gathering web and game development, organized by category.
> Use these prompts with the mtgBot agent or any AI assistant to generate MTG-related code, content, and tools.

---

## Table of Contents

- [How to Use These Prompts](#how-to-use-these-prompts)
- [Web App Development](#web-app-development)
- [Scryfall API Integration](#scryfall-api-integration)
- [Discord Bot Development](#discord-bot-development)
- [Game Mechanics & Turn Structure](#game-mechanics--turn-structure)
- [Deck Building & Analysis](#deck-building--analysis)
- [League Management](#league-management)
- [Chaos Commander Format](#chaos-commander-format)
- [Theming & UI Design](#theming--ui-design)

---

## How to Use These Prompts

1. **Copy** the prompt template you need
2. **Replace** placeholders (marked with `{PLACEHOLDER}`) with your specific values
3. **Submit** to the mtgBot agent or any AI assistant
4. **Iterate** by combining prompts or chaining them for complex tasks

> **Tip:** Combine prompts from different categories for comprehensive results. For example, use a Scryfall API prompt with a Web App Development prompt to build a card search tool.

---

## Web App Development

### Prompt: Generate an MTG Web App

```
Create a Magic: The Gathering web app using HTML, CSS, and JavaScript with these requirements:
- Dark red and black theme consistent with 9898-MTG branding
- Feature: {FEATURE_DESCRIPTION}
- Include a table of contents for navigation
- Use semantic HTML elements and CSS Grid/Flexbox for layout
- Add interactive JavaScript functionality with variables and functions
- Include Scryfall API integration for card data
- Ensure the app is responsive and accessible
```

### Prompt: Create an Interactive MTG Component

```
Build an interactive MTG component in vanilla JavaScript that:
- Displays {COMPONENT_TYPE} (e.g., card viewer, life counter, mana pool)
- Responds to user input (click, hover, drag)
- Uses document.innerHTML for live DOM updates
- Follows the 9898-MTG dark red/black color scheme
- Stores state in JavaScript variables
- Includes error handling for edge cases
```

### Prompt: Build a Forum-Style MTG Web App

```
Generate a forum-style web app for 9898-MTG-League that includes:
- Thread listing with MTG-themed categories
- Post creation with rich text formatting
- User profiles displaying league statistics
- Dark red and black themed design
- Navigation with dropdown menus
- Responsive layout for mobile and desktop
- JavaScript functions for all interactive elements
```

---

## Scryfall API Integration

### Prompt: Search Cards with Scryfall API

```
Write JavaScript code to search Magic: The Gathering cards using the Scryfall API:
- Base URL: https://api.scryfall.com/cards/search
- Search query: {SEARCH_QUERY}
- Handle pagination with has_more and next_page
- Display card images using image_uris.normal
- Include error handling for API rate limits (100ms delay between requests)
- Parse and display: name, mana_cost, type_line, oracle_text, power, toughness
```

### Prompt: Generate Random Booster Pack

```
Create a booster pack generator using the Scryfall API that:
- Accepts custom Scryfall search syntax as input
- Fetches cards matching the syntax from https://api.scryfall.com/cards/search
- Generates a pack with the following distribution:
  - 1 rare or mythic rare
  - 3 uncommons
  - 10 commons
  - 1 basic land
- Displays card images in a grid layout
- Allows re-rolling individual card slots
- Supports custom set filters: {SET_CODES}
```

### Prompt: Scryfall Syntax Builder

```
Build a Scryfall syntax builder UI that lets users construct search queries using:
- Color identity filters (id:W, id:U, id:B, id:R, id:G)
- Type filters (type:creature, type:instant, type:sorcery)
- Rarity filters (rarity:common, rarity:uncommon, rarity:rare, rarity:mythic)
- CMC filters (cmc=1, cmc>=3, cmc<=5)
- Set filters (set:{SET_CODE})
- Keyword filters (keyword:flying, keyword:trample)
- Format legality (format:commander, format:standard)
- Power/toughness filters (power>=4, toughness<=2)
Display the constructed query and a preview of matching cards.
```

---

## Discord Bot Development

### Prompt: Add a Bot Command

```
Create a new Discord bot command for mtgBot using discord.js v13:
- Command name: !{COMMAND_NAME}
- Description: {COMMAND_DESCRIPTION}
- Parameters: {PARAMETERS}
- Action: {ACTION_DESCRIPTION}
- Include permission checks
- Add error handling with winston logging
- Follow the existing command JSON structure in BotData/commands/commands.json
- Return an embedded message with MTG-themed formatting
```

### Prompt: Create a Discord Event Handler

```
Write a Discord event handler for mtgBot that:
- Listens for: {EVENT_TYPE} (e.g., guildMemberAdd, messageCreate, interactionCreate)
- Triggers: {TRIGGER_DESCRIPTION}
- Uses the existing Events.js handler pattern
- Updates server variables in BotData/variables/servervars.json
- Logs events using winston logger
- Sends a notification to the configured default channel
```

### Prompt: Build a Slash Command

```
Implement a Discord slash command for mtgBot:
- Name: /{COMMAND_NAME}
- Options: {OPTIONS_ARRAY}
- Response type: {ephemeral|reply|embed}
- Integrate with Scryfall API to fetch: {DATA_TYPE}
- Register the command in bot.js using REST API
- Handle interaction responses with deferred replies for API calls
```

---

## Game Mechanics & Turn Structure

### Prompt: Implement Turn Structure

```
Create a JavaScript-based MTG turn structure manager that tracks:
- Beginning Phase: Untap Step → Upkeep Step → Draw Step
- Main Phase (Pre-Combat)
- Combat Phase: Beginning of Combat → Declare Attackers → Declare Blockers → Combat Damage → End of Combat
- Main Phase (Post-Combat)
- Ending Phase: End Step → Cleanup Step

Requirements:
- Display the current phase/step with visual highlighting
- Allow button clicks to advance through phases
- Track priority passing between players
- Handle triggered abilities at each step
- Show phase transitions with CSS animations
```

### Prompt: Build a Battlefield Zone Manager

```
Create a web-based MTG battlefield zone manager with these zones:
- Library (face-down pile with card count)
- Hand (hidden cards with count)
- Battlefield (tapped/untapped card grid)
- Graveyard (face-up pile, scrollable)
- Exile (face-up pile, scrollable)
- Command Zone (commander display)
- Stack (LIFO display for spells/abilities)

Each zone should:
- Accept drag-and-drop card movement
- Display card count
- Support tap/untap animations
- Use Scryfall card images
- Follow MTG zone rules for card visibility
```

### Prompt: Create a Combat Calculator

```
Build an MTG combat damage calculator that:
- Accepts attacking creatures with power/toughness
- Accepts blocking assignments
- Calculates combat damage considering:
  - First strike and double strike
  - Trample damage assignment
  - Deathtouch lethal damage rules
  - Indestructible creatures
  - Protection abilities
- Displays damage assignment and creature destruction results
- Allows manual damage assignment overrides
```

---

## Deck Building & Analysis

### Prompt: Build a Deck Editor

```
Create an MTG deck editor web app that:
- Searches cards via Scryfall API with autocomplete
- Displays deck list grouped by card type
- Shows mana curve chart (bar graph of CMC distribution)
- Calculates deck statistics:
  - Total cards, lands, creatures, spells
  - Average CMC
  - Color distribution pie chart
  - Card type breakdown
- Supports Commander format (100 cards, singleton rule, color identity)
- Allows import/export in standard deck list format
- Uses the 9898-MTG dark red/black theme
```

### Prompt: Generate Deck Statistics

```
Analyze an MTG deck list and generate statistics:
- Input format: {DECK_LIST_FORMAT}
- Calculate:
  - Mana curve distribution
  - Color pip requirements
  - Recommended land count (using Frank Karsten method)
  - Card type ratios
  - Average CMC (excluding lands)
  - Keyword ability frequency
- Display results as interactive charts
- Provide optimization suggestions
```

---

## League Management

### Prompt: Create a League Dashboard

```
Build a 9898-MTG League dashboard web app that displays:
- League standings with player rankings
- Recent event results
- Upcoming scheduled events
- Player profile cards with statistics
- Registration form (linking to Google Forms)
- Terms and conditions acceptance
- Dark red and black theme with MTG card-style borders
- Responsive layout for mobile viewing
```

### Prompt: Generate Event Tracking

```
Create an event tracking system for 9898-MTG-League that:
- Records game results (winner, loser, format, date)
- Calculates ELO ratings or point standings
- Tracks attendance across events
- Generates leaderboards
- Supports multiple event types: {EVENT_TYPES}
- Exports data to CSV format
- Integrates with Google Sheets for persistence
```

---

## Chaos Commander Format

### Prompt: Chaos Commander Draft Generator

```
Build a Chaos Commander draft experience that:
- Generates a random set of cards using Scryfall API with chaos-themed filters
- Allows players to draft from a shared pool
- Enforces Commander deckbuilding rules:
  - 100 card singleton (except basic lands)
  - Color identity restrictions
  - Commander must be legendary creature or valid commander
- Includes a random plane selection for flavor
- Adds chaos events that trigger during gameplay
- Displays all cards with Scryfall images in a drafting grid
```

### Prompt: Random Chaos Event Generator

```
Create a chaos event generator for the 9898-MTG Chaos RPG format:
- Generate random events that affect gameplay
- Categories: combat modifiers, mana effects, zone changes, rule alterations
- Display events with MTG-themed styling
- Include a timer for timed events
- Support custom event creation and saving
- Reference the Perchance generator at https://perchance.org/9898-mtg-chaos-rpg-2024
```

---

## Theming & UI Design

### Prompt: Apply 9898-MTG Theme

```
Apply the 9898-MTG dark theme to a web app with these CSS specifications:
- Background: dark black (#1a1a1a) with subtle texture
- Primary color: dark red (#8b0000)
- Accent color: gold (#c9a52c) for highlights
- Text: light gray (#e0e0e0) on dark backgrounds
- Card borders: MTG card frame style with rounded corners
- Fonts: Use ARCENA.ttf for headings, system sans-serif for body
- Buttons: Red gradient with hover glow effect
- Scrollbars: Custom styled to match theme
- Responsive breakpoints: 768px (tablet), 480px (mobile)
```

### Prompt: Create MTG Card Display Component

```
Build a reusable MTG card display component that:
- Accepts a Scryfall card object as input
- Renders the card image with hover zoom effect
- Shows card details on click (name, cost, type, text, P/T)
- Supports both normal and transform/flip cards
- Includes loading skeleton while fetching images
- Handles missing image gracefully with placeholder
- Uses CSS transitions for smooth interactions
```

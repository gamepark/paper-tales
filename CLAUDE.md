# Game Park Framework - Instructions for Claude

This project uses the **Game Park framework** to create digital board games.

## Documentation

Official documentation: https://gamepark.github.io

For Claude to read the documentation, use raw GitHub URLs:
```
https://raw.githubusercontent.com/gamepark/gamepark.github.io/main/docs/[path]
```

### Key documentation files
| Topic | Path |
|-------|------|
| Core concepts | `concepts/core-concepts.md` |
| Game options | `features/game-options.md` |
| Items & Locations | `concepts/items-and-locations.md` |
| Hiding data | `concepts/hiding-data.md` |
| Item moves | `features/item-moves.md` |
| Rule moves | `features/rule-moves.md` |
| Custom moves | `features/custom-moves.md` |
| Location strategies | `features/location-strategies.md` |
| Hand of cards | `features/hand-of-cards.md` |
| Piles of items | `features/piles-of-items.md` |
| Tutorial AI | `features/tutorial-ai.md` |

### Step-by-step guide
The `step-by-step-example/` folder contains a complete tutorial:
1. `choose-a-game.md` → `set-up-your-computer.md` → `set-up-the-project.md`
2. `identify-the-players.md` → `identify-the-material.md` → `identify-the-locations.md`
3. `prepare-the-images.md` → `display-first-item.md` → `create-items.md`
4. `place-items.md` → `organize-the-table.md` → `hide-the-cards.md`
5. `identify-the-rules.md` → `player-turn.md` → `end-of-the-game.md`
6. `write-the-headers.md` → `help-dialogs.md` → `tutorial.md`

### Checklist
Full checklist: `step-by-step-example/checklist.md`

## Project Structure

```
rules/src/                    # Server-side game logic
  ├── material/
  │   ├── MaterialType.ts     # Game components enum (start at 1)
  │   └── LocationType.ts     # Possible locations enum
  ├── rules/
  │   ├── RuleId.ts           # Game phases enum
  │   └── *Rule.ts            # Rule implementations
  ├── [Game]Rules.ts          # Main rules class
  ├── [Game]Setup.ts          # Initial game setup
  └── [Game]Options.ts        # OptionsSpecV2: option structure, no text

app/public/
  ├── translation/*.json      # Game texts, one file per locale
  └── options/*.json          # Option labels, one file per locale

app/src/                      # Client-side React UI
  ├── material/Material.ts    # Visual descriptions (sizes, images)
  ├── locators/Locators.ts    # Positioning on screen
  ├── headers/Headers.tsx     # In-game text display
  └── images/                 # Game assets
```

## Core Concepts

### MaterialItem
Every game element is an item with a location:
```typescript
{ id: CardId.Guard, location: { type: LocationType.PlayerHand, player: 1 } }
```

### Location properties
- `type`: LocationType (required)
- `player`: Owner player
- `id`: Location variant (e.g., which deck)
- `x`, `y`: Grid coordinates
- `parent`: Index of parent item
- `rotation`: Tile rotation

### Rules
- Extend `PlayerTurnRule` (one player acts) or `SimultaneousRule` (all players act)
- Implement `getPlayerMoves()` to define legal moves
- Use `afterItemMove()` or `onRuleStart()` for consequences
- Transition with `this.startRule(RuleId.Next)` or `this.endGame()`

## Development Workflow

1. **Define MaterialType** - List all physical components
2. **Define LocationType** - List all possible locations
3. **Implement Setup** - Create initial game state
4. **Implement Rules** - One file per game phase
5. **Configure Material.ts** - Sizes and images
6. **Create Locators** - Position items on screen
7. **Add Headers** - Display game text
8. **Test** - Use `game.new()`, `game.view`, `game.legalMoves` in browser console

## Lint

After changing code, run `yarn lint` at the root alongside the `tsc` check — once per batch of
changes. It runs **oxlint** (config in `.oxlintrc.json`) and catches what `tsc` cannot, chiefly the
React hooks rules in `app/` (`rules-of-hooks`, `exhaustive-deps`). Fix its warnings rather than
silencing them; a disable comment needs a reason.

## Console Commands (browser)

```javascript
game.new(playerCount)    // Start new game
game.view                // Current game state
game.legalMoves          // Available moves
game.undo()              // Undo last move
game.monkeyOpponents(true) // Auto-play opponents
```

## Patterns to Follow

### Creating items in Setup
```typescript
this.material(MaterialType.Card).createItems(
  cardIds.map(id => ({ id, location: { type: LocationType.Deck } }))
)
this.material(MaterialType.Card).shuffle()
```

### Player moves in Rule
```typescript
getPlayerMoves() {
  return this.material(MaterialType.Card)
    .location(LocationType.PlayerHand)
    .player(this.player)
    .moveItems({ type: LocationType.PlayArea })
}
```

### Filter the Material, never loop over indexes
Keep selections as `Material` (`filter((item, index) => …)`, `id(predicate)`…) and call `moveItems` on
the result; never `getIndexes().map(i => this.material(X).index(i)…)`. Helpers return `Material`, not
`number[]`. See `features/item-moves.md#filter-items`.

### Consequences
```typescript
afterItemMove(move: ItemMove) {
  if (isMoveItem(move) && move.location.type === LocationType.PlayArea) {
    return [this.startRule(RuleId.ResolveCard)]
  }
  return []
}
```

## Reference Games

Similar games on GitHub (gamepark org) for inspiration:
- **Mythologies** - Complex drafting, multiple card types
- **Looot** - Hexagonal grid, tile placement
- **Along History** - Card game with effects
- **District Noir** - Simple card game

## Translations

Translation files are located in `app/public/translation/` (one JSON file per language: `en.json`, `fr.json`, `de.json`, `es.json`, `it.json`, `ru.json`). The project uses `i18next` + `react-i18next`.

### Translation workflow

**During development**: only write translations in the **developer's native language** file (e.g. `fr.json` for a French developer). Do not touch other language files — this saves tokens.

**Before production release**: when asked, translate all texts into every other supported language in a dedicated pass.

:bulb: The same native-language rule applies to `app/public/options/*.json`.

### Where translations are used
- `app/public/translation/*.json` — UI texts (headers, dialogs, tooltips, buttons)
- `Headers.tsx` — uses `useTranslation()` to display in-game messages
- `materialI18n` prop on `GameProvider` — localized material descriptions

### Translation keys convention
Follow existing key naming patterns in the JSON files. Keep keys descriptive and organized by feature/screen.

## Game Options

Options are declared in `rules/src/[Game]Options.ts` with `OptionsSpecV2` — **plain JSON, no functions
and no text**. The platform snapshots it when the bundle is prepared and reads it from its database.

```typescript
export const PaperTalesOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 2, max: 4 },
  identities: { values: getEnumValues(PlayerColor) }
}
```

Three things do **not** belong in it:

- **Texts** go to `app/public/options/{locale}.json`, keyed by convention: `option.<option>`,
  `option.<option>.<value>`, `identities.<value>`, plus optional `.help` and `.warn` variants. Values
  are addressed by value, so `PlayerColor.Blue = 1` gives `identities.1`.
- **`subscriberRequired`, `competitiveDisabled`, `competitivePlayers`** belong to the platform database.
- **`validate`** no longer exists. Express constraints as `playerCount` (on an option or a value),
  `requires` on a value, or a `forbidden-combination` rule whose `message` is a key in the options
  document.

Read `features/game-options.md` before changing this file — the shape is precise and the platform
depends on it. Never reintroduce a v1 `OptionsSpec`.

## Backward Compatibility

Saved games store enum values as numbers (`MaterialType`, `LocationType`, `RuleId`, `Memory`, ids…).
Check the `version` in `rules/package.json`:

- **Below 1.0.0**: the game is not in production. Consistency of the code comes before stable enum
  values: put a new value where it belongs, renumber freely, rename and restructure.
- **1.0.0 or above**: backward compatibility wins. Never shift existing values: append new ones at
  the end, and keep every game already started playable.

## When Helping

1. **Always read existing code first** before suggesting changes
2. **Follow established patterns** in the codebase
3. **Test incrementally** - suggest testing after each major change
4. **Reference documentation** when explaining concepts
5. **Start with MaterialType/LocationType** for new games

---

# Paper Tales — Project Guide

## Game Overview

Paper Tales is a competitive card drafting and tableau-building game for **2-7 players**, played over **4 rounds** (ages). Each round has 6 phases.

## Project Structure

```
rules/src/                      → Backend (pure logic, no React)
  PaperTalesRules.ts            → Main rules class (SecretMaterialRules + CompetitiveScore)
  PaperTalesSetup.ts            → Game setup
  PaperTalesOptions.ts          → Game options
  PlayerColor.ts                → Player enum (Blue=1, Red, Green, Yellow, Black, Purple, White)
  material/
    MaterialType.ts             → Unit, Building, Age, Gold, Time, ScoreBoard, ScoreToken
    LocationType.ts             → All locations (board, hand, stock, deck, etc.)
    Unit.ts                     → 42 unit card enum
    UnitCaracteristics.ts       → Record<Unit, UnitPattern> — stats, effects, costs
    Building.ts                 → 5 buildings enum (Mine, Temple, Tavern, Barracks, Town)
    BuildingCaracteristics.ts   → Record<Building, BuildingPattern>
    effects/                    → Effect types by phase
  rules/
    RuleId.ts                   → All rule phases
    Memory.ts                   → Memory keys
    CustomMoveType.ts           → Custom move types
    1_Recruit/                  → Deal, Draft, GiveDraftToNeighbor
    2_Deployment/               → PlaceUnitOnBoard, RevealBoards, PayDeployedUnits, DeployEffects, ChooseWherePlacingAgeToken
    3_War/                      → War
    4_Income/                   → Income
    5_Build/                    → Build, BuildWithSubstitution
    6_Age/                      → AgeEffects, AgeUnitsDie, AgeUnitsAge, SaveUnitsWithMysticEffect, NextTurn, EndGame
    helpers/                    → AgeHelper, BuildHelper, ResourcesHelper, ScoreHelper

app/src/                        → Frontend (React + Emotion CSS)
  main.tsx                      → Entry point (GameProvider)
  App.tsx                       → App shell
  GameDisplay.tsx               → GameTable with dynamic dimensions
  material/                     → MaterialDescriptions + help components
  locators/                     → All locators; TableLayout.ts holds the whole table layout
  headers/                      → Phase headers
  panels/                       → Player panels (compact, laid on the table in a column)
  table/                        → Phase widgets laid on the table (draft direction, deployment gold, build info, war results, view buttons)
  animations/                   → PaperTalesAnimations.ts
```

## Game Phases (Round Flow)

```
Deal → Draft → GiveDraftToNeighbor → (repeat Draft) →
PlaceUnitOnBoard → RevealBoards → PayDeployedUnits → DeployEffects →
  [ChooseWherePlacingAgeToken →] War → Income → Build →
  [SaveUnitsWithMysticEffect →] AgeEffects → AgeUnitsDie → AgeUnitsAge →
  (round 1-3: NextTurn) | (round 4: EndGame)
```

## Board Layout

- **Grid**: 2 rows × 2 cols standard, 3rd column (x=2) unlocked by Level-2 building
- **Front lane**: y=0 (participates in war)
- **Back lane**: y=1 (no war unless WarFromBacklane effect)
- Cards placed face-down (`rotation=true`) during deployment, revealed after

## Key Conventions

- **Hiding**: `hideRotatedCardToOthers` — face-down board cards hidden to non-owners
- **Score**: Tracked via `ScoreToken.location.x` (0-60 on score board)
- **Gold**: Uses `MoneyDescription` with Gold1 (1g) and Gold5 (5g) coins
- **Age tokens**: Accumulate on units each round; unit dies when ≥1 token (unless special condition)
- **Draft direction**: Alternates each round (odd=clockwise, even=counter-clockwise)
- **2-player draft**: Special rules — 9 cards, keep one AND discard one per pick

## Memory Keys

- `PlayedCardsDuringDeployment`: Per-player array of newly deployed unit indexes
- `UnitSavedWithMystic`: Per-player array of saved unit indexes
- `TwoPlayersDraftMoves`: 2p draft tracking
- `PlacingAgeTokenUnitsIndexes`: Queue for age token placement choices
- `Time`: Current round (1-4)

## Effects System

Effects grouped by phase in `rules/src/material/effects/`:
- **DeploymentEffect**: Shapeshifter, GainTokenOnDeploy, ImproveBuilding, GainAgeToken
- **WarEffect**: GainTokenIfWinWar, ChangeWarPower, AddWarPower, WarFromBacklane
- **IncomeEffect**: SimpleIncome, IncomePerResource, IncomeIfAgeToken
- **BuildEffect**: IgnoreFieldCost, ReplaceResourceByGold
- **AgeEffect**: GainTokenIfDying, MysticEffect, SpecialDyingCondition
- **RelicEffect**: End-game scoring per age token

## Player Panels

Panels are React components laid in the game table, in a column on the left, in seating order: right neighbour, me, left neighbour, then the others (arrows between them show the draft direction of the round). The eye of a panel plays a transient changeView to display that player area.

## Table layout

The table shows one player area at a time (`locators/TableLayout.ts`), the same on a phone in landscape and on a desktop: mine by default, another player through the eye of their panel, or my 2 neighbours on each side of me (neighbours view: `changeView(NEIGHBOURS_VIEW)`, and automatic from RevealBoards to War, since War resolves at once). The right column holds the turn counter, the deck, the discard and the reserves. Use only React and the framework: no direct DOM access.

## Framework

- **Build**: Vite
- **React**: 19
- **@gamepark/rules-api**: ~7.8
- **@gamepark/react-game**: ~7.8

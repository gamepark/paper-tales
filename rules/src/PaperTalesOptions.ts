import { OptionsSpecV2 } from '@gamepark/rules-api'
import { PlayerColor, playerColors } from './PlayerColor'

/**
 * This is the options for each player in the game.
 */
type PlayerOptions = { id: PlayerColor }

/**
 * This is the type of object that the game receives when a new game is started.
 */
export type PaperTalesOptions = {
  players: PlayerOptions[]
  /** The 20 units of Beyond the gates in the deck (rulebook p.9) */
  beyondTheGatesUnits?: boolean
  /** The buildings of Beyond the gates: 3 drawn at random besides the 4 permanent ones (rulebook p.9) */
  beyondTheGatesBuildings?: boolean
  /** What forges legends, as a whole: its 26 units, 18 Legendary Artifacts and 3 buildings (rulebook p.10) */
  whatForgesLegends?: boolean
}

/**
 * This object describes all the options a game can have, and will be used by GamePark website to create automatically forms for you game
 * (forms for friendly games, or forms for matchmaking preferences, for instance).
 * Labels are in app/public/options/{locale}.json
 */
export const PaperTalesOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 2, max: 7 },
  identities: { values: playerColors },
  options: {
    beyondTheGatesUnits: { kind: 'boolean' },
    beyondTheGatesBuildings: { kind: 'boolean' },
    whatForgesLegends: { kind: 'boolean' }
  }
}

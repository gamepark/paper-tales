import { MaterialGameSetup } from '@gamepark/rules-api'
import { sampleSize } from 'es-toolkit/compat'
import { artifactsDeck, Card } from './material/Artifact'
import {
  baseGameBuildings,
  beyondTheGatesBuildings,
  Building,
  permanentBuildings,
  whatForgesLegendsBuildings
} from './material/Building'
import { Gold } from './material/Gold'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { baseGameDeck, beyondTheGatesUnits, deckOf, whatForgesLegendsUnits } from './material/Unit'
import { PaperTalesOptions } from './PaperTalesOptions'
import { PaperTalesRules } from './PaperTalesRules'
import { PlayerColor } from './PlayerColor'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class PaperTalesSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, PaperTalesOptions> {
  Rules = PaperTalesRules

  setupMaterial(options: PaperTalesOptions) {
    this.setupDeck(options)
    this.setupPlayers(this.getBuildings(options))
    this.game.players.forEach((player) => {
      this.material(MaterialType.ScoreToken).createItem({
        id: player,
        location: { type: LocationType.PlayerScore, player: player, x: 0 }
      })
    })

    this.memorize(Memory.Time, 1)
  }

  /** The units of the base game, of the expansions played, and the Legendary Artifacts of What forges legends */
  setupDeck(options: PaperTalesOptions) {
    const cards: Card[] = [
      ...baseGameDeck,
      ...(options.beyondTheGatesUnits ? deckOf(beyondTheGatesUnits) : []),
      ...(options.whatForgesLegends ? [...deckOf(whatForgesLegendsUnits), ...artifactsDeck] : [])
    ]
    this.material(MaterialType.Unit).createItems(cards.map((card) => ({ id: card, location: { type: LocationType.Deck } })))
    this.material(MaterialType.Unit).location(LocationType.Deck).shuffle()
  }

  /**
   * The buildings every Monarch can construct, the same for all (rulebook p.9-10): with Beyond the gates, the 4 permanent
   * ones plus 3 drawn at random among the Barracks and the buildings of the expansions; with What forges legends alone,
   * the 5 of the base game plus 2 drawn among its 3.
   */
  getBuildings(options: PaperTalesOptions): Building[] {
    if (options.beyondTheGatesBuildings) {
      const variable = [Building.Barracks, ...beyondTheGatesBuildings, ...(options.whatForgesLegends ? whatForgesLegendsBuildings : [])]
      return [...permanentBuildings, ...sampleSize(variable, 3)]
    }
    if (options.whatForgesLegends) return [...baseGameBuildings, ...sampleSize(whatForgesLegendsBuildings, 2)]
    return baseGameBuildings
  }

  setupPlayers(buildings: Building[]) {
    this.players.forEach((player) => {
      this.material(MaterialType.Gold).createItem({
        id: Gold.Gold1,
        location: { type: LocationType.PlayerGoldStock, player },
        quantity: 3
      })

      this.material(MaterialType.Building).createItems(buildings.map((building) => ({ id: building, location: { type: LocationType.PlayerBuildingHand, player } })))
    })
  }

  start() {
    this.startPlayerTurn(RuleId.Deal, this.game.players[0])
  }
}

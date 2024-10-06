import { MaterialGameSetup } from '@gamepark/rules-api'
import { PaperTalesOptions } from './PaperTalesOptions'
import { PaperTalesRules } from './PaperTalesRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { theRealDeck } from './material/Unit'
import { Gold } from './material/Gold'
import { buildings } from './material/Building'

/**
 * This class creates a new Game based on the game options
 */
export class PaperTalesSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, PaperTalesOptions> {
  Rules = PaperTalesRules

  setupMaterial() {
    this.setupDeck()
    this.setupPlayers()
  }

  setupDeck() {
    const items = theRealDeck.map(unit => ({
      id:unit,
      location: { type: LocationType.Deck }
    }))
    this.material(MaterialType.Unit).createItems(items)
    this.material(MaterialType.Unit).location(LocationType.Deck).shuffle()
  }

  setupPlayers() {
    this.players.forEach(player => {
      this.material(MaterialType.Gold).createItem({
        id: Gold.Gold1,
        location: { type: LocationType.PlayerGoldStock, player },
        quantity: 3
      })

      const items = buildings.map(building => ({
        id:building,
        location: { type: LocationType.PlayerBuildingHand, player}
      }))
      
      this.material(MaterialType.Building).createItems(items)
      
    })

  }

  start() {
    this.startPlayerTurn(RuleId.Deal, this.game.players[0])
  }
}
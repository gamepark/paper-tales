import { MaterialGameSetup } from '@gamepark/rules-api'
import { PaperTalesOptions } from './PaperTalesOptions'
import { PaperTalesRules } from './PaperTalesRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class PaperTalesSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, PaperTalesOptions> {
  Rules = PaperTalesRules

  setupMaterial(_options: PaperTalesOptions) {
  }

  start() {
    this.startPlayerTurn(RuleId.PlayerTurn, this.game.players[0])
  }
}
import { isMoveItemType, MaterialGame, MaterialMove, RandomBot } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PaperTalesRules } from './PaperTalesRules'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'

/**
 * Plays a random legal move, except the moves that would never end a turn. During the deployment, every move takes a
 * card out of the hand, so that the deployment ends in a few moves: a unit already in the kingdom is never moved to
 * another space nor discarded, and a unit of the hand is never laid on a unit placed this turn (which would go back to
 * the hand, see PlaceUnitOnBoard).
 */
export class PaperTalesBot extends RandomBot<MaterialGame, MaterialMove, number> {
  constructor(player: number) {
    super(PaperTalesRules, player)
  }

  override getLegalMoves(game: MaterialGame): MaterialMove[] {
    const legalMoves = super.getLegalMoves(game)
    if (game.rule?.id !== RuleId.PlaceUnitOnBoard) return legalMoves
    const rules = new PaperTalesRules(game)
    const units = rules.material(MaterialType.Unit)
    const placedThisTurn: number[] = rules.remind(Memory.PlayedCardsDuringDeployment, this.player) ?? []
    return legalMoves.filter((move) => {
      if (!isMoveItemType(MaterialType.Unit)(move)) return true
      if (units.getItem(move.itemIndex).location.type === LocationType.PlayerUnitBoard) return false
      if (move.location.type !== LocationType.PlayerUnitBoard) return true
      return !units
        .location(LocationType.PlayerUnitBoard)
        .player(this.player)
        .filter((unit) => unit.location.x === move.location.x && unit.location.y === move.location.y)
        .getIndexes()
        .some((index) => placedThisTurn.includes(index))
    })
  }
}

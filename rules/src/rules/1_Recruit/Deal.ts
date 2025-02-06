import { MaterialMove, PlayerTurnRule} from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { RuleId } from '../RuleId'

export class Deal extends PlayerTurnRule {

  onRuleStart(): MaterialMove[] {

    const moves:MaterialMove[] = []
    const deck = this.material(MaterialType.Unit).location(LocationType.Deck).deck()
    const missingCardsTotal = (this.game.players.length * 5) - this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).getQuantity()

    // Distribution
    this.game.players.forEach(player => {
      const missingCards = 5 - this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(player).getQuantity()
      missingCards > 0 && moves.push(...deck.deal({type:LocationType.PlayerDraftHand, player}, missingCards))
    })

    // Cas de la défausse vide : on mélange et on reprend la distribution
    if (moves.length !== missingCardsTotal){
      moves.push(
        this.material(MaterialType.Unit).location(LocationType.Discard).shuffle(),
        ...this.material(MaterialType.Unit).location(LocationType.Discard).moveItems({type:LocationType.Deck}),
        this.startPlayerTurn(RuleId.Deal, this.game.players[0])
      )
    } else {
      moves.push(
        this.startSimultaneousRule(RuleId.Draft)
      )
    }

    return moves
    
  }

  getPlayerMoves() {
    return []
  }
}
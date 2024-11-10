import { MaterialMove, PlayerTurnRule} from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { RuleId } from '../RuleId'

export class Deal extends PlayerTurnRule {

  onRuleStart(): MaterialMove[] {
    const deck = this.material(MaterialType.Unit).location(LocationType.Deck).deck()

    return [
      ...this.game.players.flatMap(player => 
        deck.deal({type:LocationType.PlayerDraftHand, player}, 5)
      ), 
      this.startSimultaneousRule(RuleId.Draft)
    ]
    
  }

  getPlayerMoves() {
    return []
  }
}
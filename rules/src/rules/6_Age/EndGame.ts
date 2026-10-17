import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { EndScoreHelper } from '../helpers/EndScoreHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'

/**
 * End of the game (rulebook p.8): every Monarch adds the Legend points of their built buildings, and of their relics
 */
export class EndGame extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    for (const player of this.game.players) {
      const points = new EndScoreHelper(this.game, player).points
      if (points) moves.push(...new ScoreHelper(this.game, player).gainOrLoseScore(points))
    }
    moves.push(this.endGame())
    return moves
  }
}

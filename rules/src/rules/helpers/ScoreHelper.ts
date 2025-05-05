import { MaterialGame, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'

export class ScoreHelper extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  get scoreToken() {
    return this.material(MaterialType.ScoreToken).location(LocationType.PlayerScore).player(this.player)
  }

  get score() {
    return this.scoreToken.getItem()!.location.x!
  }

  gainOrLoseScore(amount: number): MaterialMove[] {
    if (!amount) return []
    return this.scoreToken.moveItems({
      type: LocationType.PlayerScore,
      player: this.player,
      x: this.score + amount
    })
  }
}

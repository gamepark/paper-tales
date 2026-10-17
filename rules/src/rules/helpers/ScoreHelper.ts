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

  /** The score never goes below 0: the track starts at 0, and a loss of points stops there */
  gainOrLoseScore(amount: number): MaterialMove[] {
    const next = Math.max(0, this.score + amount)
    if (next === this.score) return []
    return this.scoreToken.moveItems({
      type: LocationType.PlayerScore,
      player: this.player,
      x: next
    })
  }
}

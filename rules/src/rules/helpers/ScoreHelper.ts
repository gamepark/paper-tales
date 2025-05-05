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

  getScoreMaterial(player: number) {
    return this.material(MaterialType.ScoreToken).location(LocationType.PlayerScore).player(player)
  }

  getScore(player: number) {
    return this.getScoreMaterial(player).getItem()!.location.x!
  }

  gainOrLoseScore(player: number, amount: number): MaterialMove[] {
    if (!amount) return []
    return this.getScoreMaterial(player).moveItems({
      type: LocationType.PlayerScore,
      player,
      x: this.getScore(player) + amount
    })
  }
}

import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { CustomMoveType } from '../CustomMoveType'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { WarHelper } from '../helpers/WarHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class War extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players
    const war = new WarHelper(this.game)
    // Read from the revealed kingdoms only: the same on every client
    this.memorize(Memory.WarStrengths, Object.fromEntries(players.map((player) => [player, war.getPlayerPower(player)])))

    players.forEach((player) => {
      this.forget(Memory.PlayedCardsDuringDeployment, player)
      const gains = war.getWarGains(player)

      moves.push(this.customMove(CustomMoveType.WarOutcome, player))

      // All the gold in one gain: two gains computed on the same purse would be counted on the coins before the first one
      if (gains.gold) moves.push(...this.material(MaterialType.Gold).money(golds).addMoney(gains.gold, { type: LocationType.PlayerGoldStock, player }))

      moves.push(...new ScoreHelper(this.game, player).gainOrLoseScore(gains.score))
    })

    // Every Monarch reads the outcome of the wars before the income (see WarSummary)
    moves.push(this.startSimultaneousRule(RuleId.WarSummary))
    return moves
  }
}

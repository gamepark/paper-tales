import { isEndPlayerTurn, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { BASE_INCOME, Income } from '../rules/4_Income/Income'
import { BuildHelper } from '../rules/helpers/BuildHelper'
import { RuleId } from '../rules/RuleId'

const { Blue, Red, Green } = PlayerColor

const newRules = (players: PlayerColor[]) => {
  const game = new PaperTalesSetup().setup({ players: players.map((id) => ({ id })) }) as MaterialGame
  for (const item of game.items[MaterialType.Unit]!) if (item.location.type !== LocationType.Deck) item.location = { type: LocationType.Deck }
  return new PaperTalesRules(game)
}

const run = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = rules.play(rules.randomize(move))
  while (queue.length > 0) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

describe('The summary of the wars', () => {
  it('follows the wars and waits for every Monarch, who can only move on', () => {
    const rules = newRules([Blue, Red, Green])
    run(rules, rules.startRule(RuleId.War))
    expect(rules.game.rule?.id).toBe(RuleId.WarSummary)
    for (const player of [Blue, Red, Green]) {
      expect(rules.isTurnToPlay(player)).toBe(true)
      expect(rules.getLegalMoves(player)).toHaveLength(1)
      expect(isEndPlayerTurn(rules.getLegalMoves(player)[0])).toBe(true)
    }
  })

  it('brings the income, then the construction, once all of them have read it', () => {
    const rules = newRules([Blue, Red])
    run(rules, rules.startRule(RuleId.War))
    const gold = new BuildHelper(rules.game, Blue).gold
    const income = BASE_INCOME + new Income(rules.game).getPlayerIncome(Blue)
    run(rules, rules.getLegalMoves(Blue)[0])
    expect(rules.game.rule?.id).toBe(RuleId.WarSummary)
    expect(new BuildHelper(rules.game, Blue).gold).toBe(gold)
    run(rules, rules.getLegalMoves(Red)[0])
    expect(rules.game.rule?.id).toBe(RuleId.Build)
    expect(new BuildHelper(rules.game, Blue).gold).toBe(gold + income)
  })
})

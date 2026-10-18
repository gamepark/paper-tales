import { isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PaperTalesBot } from '../PaperTalesBot'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { RuleId } from '../rules/RuleId'

const newGame = (count: number) => new PaperTalesSetup().setup({ players: Array.from({ length: count }, (_, i) => ({ id: (i + 1) as PlayerColor })) }) as MaterialGame

const play = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = [move]
  while (queue.length > 0) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

const isSameMove = (a: MaterialMove, b: MaterialMove) => JSON.stringify(a) === JSON.stringify(b)

/** Every active Monarch is a bot: plays one move of a random active Monarch */
const botMove = (rules: PaperTalesRules): MaterialMove => {
  const active = rules.players.filter((player) => rules.isTurnToPlay(player))
  const player = active[Math.floor(Math.random() * active.length)]
  const moves = new PaperTalesBot(player).run(rules.game)
  expect(moves.length, `the bot ${player} has no move (rule ${rules.game.rule?.id})`).toBe(1)
  return moves[0]
}

describe('PaperTalesBot', () => {
  it('never moves a unit already in its kingdom during the deployment', () => {
    for (const count of [2, 4, 7]) {
      const rules = new PaperTalesRules(newGame(count))
      let deployments = 0
      while (!rules.isOver()) {
        if (rules.game.rule?.id === RuleId.PlaceUnitOnBoard) {
          for (const player of rules.players.filter((player) => rules.isTurnToPlay(player))) {
            const units = rules.material(MaterialType.Unit)
            for (const move of new PaperTalesBot(player).getLegalMoves(rules.game)) {
              if (!isMoveItemType(MaterialType.Unit)(move)) continue
              expect(units.getItem(move.itemIndex).location.type).not.toBe(LocationType.PlayerUnitBoard)
            }
          }
          deployments++
        }
        play(rules, botMove(rules))
      }
      expect(deployments).toBeGreaterThan(0)
    }
  })

  it('ends every deployment in a move per card of its hand, and the game', () => {
    for (const count of [2, 3, 5, 7]) {
      const rules = new PaperTalesRules(newGame(count))
      let actions = 0
      // The moves left to each Monarch in the deployment: one per card of their hand, and the end of their turn
      let movesLeft: Map<number, number> | undefined
      while (!rules.isOver()) {
        const move = botMove(rules)
        if (rules.game.rule?.id === RuleId.PlaceUnitOnBoard) {
          movesLeft ??= new Map(
            rules.players.map((player) => [player, rules.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(player).length + 1])
          )
          const player = rules.players.find((player) => new PaperTalesBot(player).getLegalMoves(rules.game).some((legal) => isSameMove(legal, move)))!
          movesLeft.set(player, movesLeft.get(player)! - 1)
          expect(movesLeft.get(player), `the deployment of ${player} ends`).toBeGreaterThanOrEqual(0)
        } else {
          movesLeft = undefined
        }
        play(rules, move)
        expect(++actions, 'the game ends').toBeLessThan(2000)
      }
    }
  })
})

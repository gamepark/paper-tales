import { MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { expect, it } from 'vitest'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'

const play = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = rules.play(rules.randomize(move))
  while (queue.length > 0) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

/**
 * Random games on the rules alone: every turn, an active Monarch plays one of their legal moves at random. A game must
 * reach its end, with never an active Monarch left without a move.
 */
it.each([2, 4, 7])('random %i-player games reach the end', (count) => {
  for (let g = 0; g < 10; g++) {
    const game = new PaperTalesSetup().setup({ players: Array.from({ length: count }, (_, i) => ({ id: (i + 1) as PlayerColor })) }) as MaterialGame
    const rules = new PaperTalesRules(game)
    let steps = 0
    while (game.rule && steps++ < 3000) {
      const active = rules.players.filter((player) => rules.isTurnToPlay(player))
      const choices = active.map((player) => rules.getLegalMoves(player)).filter((moves) => moves.length)
      expect(choices.length, `an active Monarch has no move (rule ${game.rule.id})`).toBe(active.length)
      const moves = choices[Math.floor(Math.random() * choices.length)]
      play(rules, moves[Math.floor(Math.random() * moves.length)])
    }
    expect(game.rule).toBeUndefined()
  }
}, 600000)

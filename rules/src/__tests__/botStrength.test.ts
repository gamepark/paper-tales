import { MaterialGame, MaterialMove, RandomBot } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { PaperTalesBot } from '../PaperTalesBot'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'

/** The bot before the heuristics: a random legal move among the ones that end a turn */
class RandomPaperTalesBot extends PaperTalesBot {
  override run(game: MaterialGame): MaterialMove[] {
    return RandomBot.prototype.run.call(this, game) as MaterialMove[]
  }
}

type BotKind = 'heuristic' | 'random'
const createBot = (kind: BotKind, player: number) => (kind === 'heuristic' ? new PaperTalesBot(player) : new RandomPaperTalesBot(player))

const play = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = [move]
  while (queue.length > 0) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

/** The time the heuristic bot took to choose each move */
const times: number[] = []
const percentile = (p: number) => [...times].sort((a, b) => a - b)[Math.floor((times.length - 1) * p)].toFixed(0)

/** Plays a whole game between the bots, each seat with its kind of bot, and gives the scores by seat */
const playGame = (kinds: BotKind[]): number[] => {
  const players = kinds.map((_, i) => ({ id: (i + 1) as PlayerColor }))
  const rules = new PaperTalesRules(new PaperTalesSetup().setup({ players }) as MaterialGame)
  const bots = new Map(rules.players.map((player, i) => [player, createBot(kinds[i], player)]))
  for (let actions = 0; !rules.isOver(); actions++) {
    expect(actions, 'the game ends').toBeLessThan(3000)
    const player = rules.players.find((player) => rules.isTurnToPlay(player))!
    const start = performance.now()
    const moves = bots.get(player)!.run(rules.game)
    const time = performance.now() - start
    if (kinds[rules.players.indexOf(player)] === 'heuristic') times.push(time)
    expect(moves.length, `the bot ${player} has a move (rule ${rules.game.rule?.id})`).toBe(1)
    play(rules, moves[0])
  }
  return rules.players.map((player) => rules.getScore(player))
}

describe('PaperTalesBot strength', () => {
  it.each([2, 3, 4])('beats the random bot most of the time at %i players', (count) => {
    const games = 12
    let wins = 0
    let gap = 0
    for (let game = 0; game < games; game++) {
      // The heuristic bot changes seat from one game to the next
      const seat = game % count
      const kinds = Array.from({ length: count }, (_, i): BotKind => (i === seat ? 'heuristic' : 'random'))
      const scores = playGame(kinds)
      const best = Math.max(...scores.filter((_, i) => i !== seat))
      if (scores[seat] > best) wins++
      gap += scores[seat] - best
    }
    console.info(`${count} players: the heuristic bot wins ${wins}/${games}, ${(gap / games).toFixed(1)} points ahead of the best random bot on average, moves in ${percentile(0.5)}ms (median), ${percentile(0.99)}ms (99%), ${percentile(1)}ms (max)`)
    expect(wins / games).toBeGreaterThanOrEqual(0.75)
  }, 300_000)
})

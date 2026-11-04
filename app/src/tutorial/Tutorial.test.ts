// @vitest-environment node
import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { applyAutomaticMoves, isEndPlayerTurn, isMoveItemType, MaterialMove, playAction } from '@gamepark/rules-api'
import { wrapRulesWithTutorial } from '@gamepark/react-game/dist/components/tutorial/TutorialRulesWrapper'
import { describe, expect, it, vi } from 'vitest'
import { Tutorial } from './Tutorial'

// The whole framework reads the browser when it is imported: only the tutorial is needed here
vi.mock('@gamepark/react-game', () => import('@gamepark/react-game/dist/components/tutorial/MaterialTutorial'))

const me = 1
const tutorial = new Tutorial()
wrapRulesWithTutorial(tutorial, PaperTalesRules)

const newTutorial = () => {
  const [game] = tutorial.setupTutorial()
  const rules = new PaperTalesRules(game)
  applyAutomaticMoves(rules)
  return rules
}

const units = (rules: PaperTalesRules) => rules.material(MaterialType.Unit)
const myHandIds = (rules: PaperTalesRules, location: LocationType) => units(rules).location(location).player(me).getItems<Unit>().map((item) => item.id)

/** Plays the scripted part as the player and the bots do, and returns the rules once the script is over */
const playScript = (onMyMove: (rules: PaperTalesRules, moves: MaterialMove[]) => void = () => {}) => {
  const rules = newTutorial()
  for (let turns = 0; rules.game.tutorial!.step < tutorial.steps.length; turns++) {
    expect(turns, 'the script never ends').toBeLessThan(500)
    const opponentMove = tutorial.getNextMove(rules)
    if (opponentMove) {
      const player = rules.game.players.find((player) => rules.isLegalMove(player, opponentMove))
      expect(player, `no opponent can play at step ${rules.game.tutorial!.step}`).toBeDefined()
      playAction(rules, opponentMove, player!)
      continue
    }
    const moves = rules.getLegalMoves(me)
    expect(moves.length, `nothing to play at step ${rules.game.tutorial!.step} (rule ${rules.game.rule?.id})`).toBeGreaterThan(0)
    onMyMove(rules, moves)
    // A move of the game when the step asks for one, else the button of the popup (Next is the first one)
    const gameMoves = moves.filter((move) => isMoveItemType(MaterialType.Unit)(move) || isMoveItemType(MaterialType.Building)(move) || isEndPlayerTurn(move))
    playAction(rules, gameMoves.length ? gameMoves[Math.floor(Math.random() * gameMoves.length)] : moves[0], me)
  }
  return rules
}

describe('Tutorial', () => {
  it('deals the scenario cards and random ones, none of the other copies', () => {
    for (let i = 0; i < 20; i++) {
      const rules = newTutorial()
      expect(rules.game.rule?.id).toBe(RuleId.Draft)
      for (const player of rules.game.players) expect(units(rules).location(LocationType.PlayerDraftHand).player(player).length).toBe(5)
      const dealt = units(rules).location(LocationType.PlayerDraftHand).getItems<Unit>().map((item) => item.id)
      for (const unit of [Unit.ForestSpirit, Unit.Farmer, Unit.Hunter, Unit.Blacksmith]) expect(dealt.filter((id) => id === unit)).toHaveLength(1)
      expect(dealt).not.toContain(Unit.MysticalHealer)
      expect(myHandIds(rules, LocationType.PlayerDraftHand)).toContain(Unit.ForestSpirit)
      expect(rules.material(MaterialType.Unit).location(LocationType.Deck).length).toBe(81 - 15)
    }
  })

  it('is played to its end whatever the cards dealt, and the game goes on with the second turn', () => {
    for (let i = 0; i < 40; i++) {
      const rules = playScript()
      expect(rules.remind(Memory.Time)).toBe(2)
      expect(rules.game.rule?.id).toBe(RuleId.Draft)
      for (const player of rules.game.players) {
        // The new deal completes the hands: every Monarch recruits again
        expect(units(rules).location(LocationType.PlayerDraftHand).player(player).length).toBe(5)
        expect(rules.isTurnToPlay(player)).toBe(true)
        expect(rules.getLegalMoves(player).length).toBeGreaterThan(0)
      }
    }
  })

  it('gives me what its texts say', () => {
    for (let i = 0; i < 20; i++) {
      let goldAtBuild: number | undefined
      let level2: Building[] = []
      const rules = playScript((rules, moves) => {
        if (rules.game.rule?.id !== RuleId.Build || goldAtBuild !== undefined) return
        const builds = moves.filter(isMoveItemType(MaterialType.Building))
        if (!builds.length) return
        goldAtBuild = new BuildHelper(rules.game, me).gold
        level2 = builds.map((move) => rules.material(MaterialType.Building).getItem<Building>(move.itemIndex).id).sort()
      })
      // No gold left after the Forest Spirit, then the income: 2, and 1 of the Blacksmith
      expect(goldAtBuild).toBe(3)
      expect(level2).toEqual([Building.Tavern, Building.Barracks, Building.Town].sort())
      const kingdom = units(rules).location(LocationType.PlayerUnitBoard).player(me).getItems<Unit>()
      const rowOf = (unit: Unit) => kingdom.find((item) => item.id === unit)!.location.y
      expect(rowOf(Unit.ForestSpirit)).toBe(0)
      expect(rowOf(Unit.Hunter)).toBe(0)
      expect(rowOf(Unit.Farmer)).toBe(1)
      expect(rowOf(Unit.Blacksmith)).toBe(1)
      // Every Unit has its Age token, and the card kept is still in hand with the 4 new ones: the deal completes up to 5
      expect(rules.material(MaterialType.Age).location(LocationType.OnCard).player(me).length).toBe(4)
      expect(myHandIds(rules, LocationType.PlayerUnitHand)).toHaveLength(1)
    }
  })
})

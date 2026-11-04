import { MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Artifact } from '../material/Artifact'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Unit } from '../material/Unit'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { Memory } from '../rules/Memory'
import { RuleId } from '../rules/RuleId'

describe('Two Monarchs who draw at the start of the deployment effects', () => {
  it('draw different cards: the Court Jester does not take the card drawn by the Shapeshifter', () => {
    const game = new PaperTalesSetup().setup({ players: [{ id: 1 }, { id: 2 }, { id: 3 }] }) as MaterialGame
    const items = game.items[MaterialType.Unit]!
    items.forEach((item, x) => (item.location = { type: LocationType.Deck, x }))

    const shapeshifter = items.findIndex((item) => item.id === Unit.Shapeshifter)
    const jester = items.findIndex((_, index) => index !== shapeshifter)
    items[jester].id = Unit.CourtJester
    items[shapeshifter].location = { type: LocationType.PlayerUnitBoard, player: 1, x: 0, y: 0 }
    items[jester].location = { type: LocationType.PlayerUnitBoard, player: 2, x: 0, y: 0 }

    // The top of the deck: a unit that stays for the Shapeshifter, then an artifact for the Court Jester
    const [drawn, artifact] = items.flatMap((_, index) => (index === shapeshifter || index === jester ? [] : [index]))
    items[drawn].id = Unit.Archer
    items[drawn].location.x = items.length + 1
    items[artifact].id = Artifact.HornOfPlenty
    items[artifact].location.x = items.length

    const rules = new PaperTalesRules(game)
    rules.memorize(Memory.PlayedCardsDuringDeployment, [shapeshifter], 1)
    rules.memorize(Memory.PlayedCardsDuringDeployment, [jester], 2)
    rules.memorize(Memory.PlayedCardsDuringDeployment, [], 3)

    const queue: MaterialMove[] = [rules.startSimultaneousRule(RuleId.DeployEffects)]
    let gained: number[] = []
    while (queue.length && rules.game.rule?.id !== RuleId.War) {
      queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
      if (rules.game.rule?.id !== RuleId.War) gained = rules.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, 2) ?? []
    }

    expect(items[drawn].location).toMatchObject({ type: LocationType.PlayerUnitBoard, player: 1, x: 0, y: 0 })
    expect(items[shapeshifter].location.type).toBe(LocationType.Discard)
    expect(items[artifact].location).toMatchObject({ type: LocationType.PlayerArtifacts, player: 2 })
    // The artifact counts among the cards gained this turn, until the wars forget them
    expect(gained).toContain(artifact)
  })
})

import { Material, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'

type MaterialProvider = { material(type: MaterialType): Material }

/**
 * The Age tokens on a unit card, in a single place: created without id so that they always merge into one pile on the
 * card, and all removed with the card (death, discard of the Shapeshifter or of a card taken back).
 */
export class AgeTokens {
  constructor(private readonly rules: MaterialProvider) {}

  on(unitIndex: number): Material {
    return this.rules.material(MaterialType.Age).location(LocationType.OnCard).parent(unitIndex)
  }

  count(unitIndex: number): number {
    return this.on(unitIndex).getQuantity()
  }

  add(unitIndex: number, player: number, quantity = 1): MaterialMove {
    return this.rules.material(MaterialType.Age).createItem({ location: { type: LocationType.OnCard, parent: unitIndex, player }, quantity })
  }

  remove(unitIndex: number): MaterialMove[] {
    return this.on(unitIndex).deleteItems()
  }
}

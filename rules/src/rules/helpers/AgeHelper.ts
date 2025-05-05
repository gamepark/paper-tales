import { Material, MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
import sum from 'lodash/sum'
import { AgeEffect, isAgeEffect, isMysticEffect, isSpecialDyingCondition } from '../../material/effects/6_AgeEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { Memory } from '../Memory'

export class AgeHelper extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  howManyAgeTokenOnIndex(unitIndex: number): number {
    return this.getAgeTokenOnIndex(unitIndex).getQuantity()
  }

  getAgeTokenOnIndex(targetIndex: number): Material {
    return this.material(MaterialType.Age).location(LocationType.OnCard).parent(targetIndex)
  }

  get agingUnits() {
    return this.units.filter((item) => !this.dyingUnits.getItems().includes(item))
  }

  get ageTokensOnDyingUnits(): number {
    return sum(
      this.material(MaterialType.Unit)
        .location(LocationType.PlayerUnitBoard)
        .player(this.player)
        .filter((unit: MaterialItem, index: number) => this.isUnitDying(unit, index))
        .getIndexes()
        .map((unit) => this.howManyAgeTokenOnIndex(unit))
    )
  }

  isUnitDying(unit: MaterialItem, index: number): boolean {
    const effects = this.getUnitAgeEffects(unit)
    const specialDyingEffect = effects.find(isSpecialDyingCondition)
    const unitsSavedByMysticEffect = this.remind<number[]>(Memory.UnitSavedWithMystic, this.player)

    const ageTokensOnDyingUnits = this.ageTokensOnDyingUnits
    if (unitsSavedByMysticEffect.includes(index)) return false
    if (specialDyingEffect === undefined) return ageTokensOnDyingUnits >= 1
    if (specialDyingEffect.dyingFromAmount === 0) return false
    return ageTokensOnDyingUnits >= specialDyingEffect.dyingFromAmount
  }

  get dyingUnits() {
    return this.units.filter((_, index) => this.howManyAgeTokenOnIndex(index) > 0)
  }

  // Effects

  get unitsWithAgeEffects(): Material {
    return this.material(MaterialType.Unit)
      .location(LocationType.PlayerUnitBoard)
      .player(this.player)
      .filter((unit) => {
        const effects = unitCardCaracteristics[unit.id as Unit].effect ?? []
        return effects.some((eff) => isAgeEffect(eff))
      })
  }

  get mysticalEffectsCount(): number {
    return this.unitsWithAgeEffects.filter((item) => {
      const id: Unit | undefined = item.id
      if (!id) return false
      return (unitCardCaracteristics[id].effect ?? []).some((eff) => isMysticEffect(eff))
    }).length
  }

  getUnitAgeEffects(unit: MaterialItem): AgeEffect[] {
    const unitId: Unit | undefined = unit.id
    if (!unitId) return []
    return (unitCardCaracteristics[unitId].effect ?? []).filter(isAgeEffect)

    /**this.material(MaterialType.Unit)
      .location(LocationType.PlayerUnitBoard)
      .player(this.player)
      .getItems()
      .forEach((item) => {
        const effect: Effect[] | undefined = unitCardCaracteristics[item.id].effect
        if (effect !== undefined) {
          effect.forEach((eff) => {
            isAgeEffect(eff) && ageEffectToReturn.push(eff)
          })
        }
      })

    return ageEffectToReturn*/
    // FIXME: why age effects are return from all units ?
  }

  get units() {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(this.player)
  }
}

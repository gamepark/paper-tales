import { Material, MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
import { sum } from 'es-toolkit/compat'
import { Card } from '../../material/Artifact'
import { cardEffects } from '../../material/CardCaracteristics'
import { AgeEffect, isAgeEffect, isMysticEffect, isSpecialDyingCondition } from '../../material/effects/6_AgeEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { Memory } from '../Memory'
import { AgeTokens } from './AgeTokens'
import { KingdomHelper } from './KingdomHelper'

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
    return new AgeTokens(this).on(targetIndex)
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
    const unitsSavedByMysticEffect = this.remind<number[] | undefined>(Memory.UnitSavedWithMystic, this.player) ?? []

    const ageTokensOnUnit = this.howManyAgeTokenOnIndex(index)
    if (unitsSavedByMysticEffect.includes(index)) return false
    if (specialDyingEffect === undefined) return ageTokensOnUnit >= 1
    if (specialDyingEffect.dyingFromAmount === 0) return false
    return ageTokensOnUnit >= specialDyingEffect.dyingFromAmount
  }

  get dyingUnits() {
    return this.units.filter((unit, index) => this.isUnitDying(unit, index))
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

  /** The units that can save one of their kingdom (the Mystical Healer), and the Medallion of Life */
  get mysticalEffectsCount(): number {
    return new KingdomHelper(this.game, this.player).cards.filter<Card>((item) => cardEffects(item.id).some(isMysticEffect)).length
  }

  getUnitAgeEffects(unit: MaterialItem): AgeEffect[] {
    const unitId: Unit | undefined = unit.id
    if (!unitId) return []
    return (unitCardCaracteristics[unitId].effect ?? []).filter(isAgeEffect)
  }

  get units() {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(this.player)
  }
}

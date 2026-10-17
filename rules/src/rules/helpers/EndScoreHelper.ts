import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { sum } from 'es-toolkit/compat'
import { Building } from '../../material/Building'
import { buildingCardCaracteristics } from '../../material/BuildingCaracteristics'
import { isRelicEffect } from '../../material/effects/7_EndGameEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { AgeHelper } from './AgeHelper'

/**
 * The Legend points added at the end of the game (rulebook p.8), computed from the table: the rule that adds them and
 * the scoring screen that details them read the same numbers.
 */
export class EndScoreHelper extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  /** The built buildings, by their face: 1 point at level 1, 3 at level 2 for the base buildings */
  get buildingsPoints(): number {
    return sum(
      this.material(MaterialType.Building)
        .location(LocationType.PlayerBuildingBoard)
        .player(this.player)
        .getItems<Building>()
        .map((building) => (building.location.rotation ? buildingCardCaracteristics[building.id].points2 : buildingCardCaracteristics[building.id].points1))
    )
  }

  /** The relics: points for each Age token on them */
  get relicsPoints(): number {
    const ageHelper = new AgeHelper(this.game, this.player)
    const units = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(this.player)
    return sum(
      units.entries.flatMap(([index, item]) =>
        (unitCardCaracteristics[item.id as Unit]?.effect ?? []).filter(isRelicEffect).map((effect) => ageHelper.howManyAgeTokenOnIndex(index) * effect.amount)
      )
    )
  }

  get points(): number {
    return this.buildingsPoints + this.relicsPoints
  }
}

import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { sum, sumBy } from 'es-toolkit/compat'
import { Artifact } from '../../material/Artifact'
import { artifactCharacteristics } from '../../material/ArtifactCharacteristics'
import { Building } from '../../material/Building'
import { buildingCardCharacteristics } from '../../material/BuildingCharacteristics'
import { isRelicEffect } from '../../material/effects/7_EndGameEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCharacteristics } from '../../material/UnitCharacteristics'
import { AgeHelper } from './AgeHelper'
import { KingdomHelper } from './KingdomHelper'

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
        .map((building) => (building.location.rotation ? buildingCardCharacteristics[building.id].points2 : buildingCardCharacteristics[building.id].points1))
    )
  }

  /** The relics: points for each Age token on them */
  get relicsPoints(): number {
    const ageHelper = new AgeHelper(this.game, this.player)
    const units = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(this.player)
    return sum(
      units.entries.flatMap(([index, item]) =>
        (unitCardCharacteristics[item.id as Unit]?.effect ?? []).filter(isRelicEffect).map((effect) => ageHelper.howManyAgeTokenOnIndex(index) * effect.amount)
      )
    )
  }

  /** The Legendary Artifacts in play: the points printed on each (rulebook p.11) */
  get artifactsPoints(): number {
    return sumBy(new KingdomHelper(this.game, this.player).artifacts.getItems<Artifact>(), (artifact) => artifactCharacteristics[artifact.id].points)
  }

  get points(): number {
    return this.buildingsPoints + this.relicsPoints + this.artifactsPoints
  }
}

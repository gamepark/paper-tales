import { MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
import { buildingCardCaracteristics } from '../../material/BuildingCaracteristics'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Resources } from '../../material/Resources'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { BuildHelper } from './BuildHelper'

export class ResourcesHelper extends MaterialRulesPart {
  readonly buildHelper: BuildHelper = new BuildHelper(this.game, this.player)

  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  get units() {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(this.player)
  }

  getAgeOnUnit(unit: MaterialItem): number {
    const index = this.material(MaterialType.Unit)
      .location(LocationType.PlayerUnitBoard)
      .player(this.player)
      .filter((item) => item.location.x === unit.location.x && item.location.y === unit.location.y)
      .getIndex()
    return this.material(MaterialType.Age).location(LocationType.OnCard).parent(index).length
  }

  get resources() {
    return this.buildingResources.concat(this.unitResources)
  }

  get unitResources() {
    return this.units.getItems().flatMap((unit) => this.getUnitResource(unit))
  }

  get buildingResources() {
    const resources: Resources[] = []

    const buildings = this.buildHelper.builtBuildings.getItems()
    for (const building of buildings) {
      const level = this.buildHelper.getLevel(building)
      const characteristics = buildingCardCaracteristics[building.id]
      if (characteristics.resources1 !== undefined) resources.push(...characteristics.resources1)
      if (level === 2 && characteristics.resources2 !== undefined) resources.push(...characteristics.resources2)
    }

    return resources
  }

  getResource(resource: Resources) {
    return this.resources.filter((r) => r === resource).length
  }

  getUnitResource(unit: MaterialItem): Resources[] {
    // Si l'Id est inaccessible, on renvoie 0
    if (unit.id === undefined) {
      return []
    }

    const resourceObject = unitCardCaracteristics[unit.id].resources

    if (resourceObject !== undefined) {
      if (resourceObject.condition !== undefined) {
        if (resourceObject.condition.onLane !== undefined) {
          return unit.location.y === resourceObject.condition.onLane && resourceObject.type
        } else if (resourceObject.condition.perAgeToken !== undefined) {
          return [...Array(this.getAgeOnUnit(unit)).keys()].flatMap((_) => resourceObject.type[0])
        } else if (resourceObject.condition.ifAgeToken !== undefined) {
          return this.getAgeOnUnit(unit) > 0 ? resourceObject.type : []
        }
      } else {
        return resourceObject.type
      }
    }

    return []
  }
}

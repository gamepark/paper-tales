import { MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
import { Card } from '../../material/Artifact'
import { Building } from '../../material/Building'
import { buildingCardCaracteristics } from '../../material/BuildingCaracteristics'
import { cardResources } from '../../material/CardCaracteristics'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Resources } from '../../material/Resources'
import { ResourceProduction } from '../../material/UnitCaracteristics'
import { AgeTokens } from './AgeTokens'
import { BuildHelper } from './BuildHelper'

export class ResourcesHelper extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  get resources() {
    return this.buildingResources.concat(this.cardsResources)
  }

  /** The resources of the units and of the Legendary Artifacts in play */
  get cardsResources() {
    return this.material(MaterialType.Unit)
      .location((location) => location.type === LocationType.PlayerUnitBoard || location.type === LocationType.PlayerArtifacts)
      .player(this.player)
      .entries.flatMap(([index, card]) => this.getCardResources(card, index))
  }

  get buildingResources() {
    const resources: Resources[] = []

    const buildHelper = new BuildHelper(this.game, this.player)
    const buildings = buildHelper.builtBuildings.getItems<Building>()
    for (const building of buildings) {
      const level = buildHelper.getLevel(building)
      const characteristics = buildingCardCaracteristics[building.id]
      if (characteristics.resources1 !== undefined) resources.push(...characteristics.resources1)
      if (level === 2 && characteristics.resources2 !== undefined) resources.push(...characteristics.resources2)
    }

    return resources
  }

  getResource(resource: Resources) {
    return this.resources.filter((r) => r === resource).length
  }

  /** What a card produces, line by line (a hidden card produces nothing) */
  getCardResources(card: MaterialItem, index: number): Resources[] {
    return cardResources(card.id as Card | undefined).flatMap((production) => this.getProduction(production, card, index))
  }

  private getProduction({ type, condition }: ResourceProduction, card: MaterialItem, index: number): Resources[] {
    if (condition?.onLane !== undefined) return card.location.y === condition.onLane ? type : []
    if (condition?.perAgeToken) return Array<Resources>(new AgeTokens(this).count(index)).fill(type[0])
    if (condition?.ifAgeToken) return new AgeTokens(this).count(index) > 0 ? type : []
    return type
  }
}

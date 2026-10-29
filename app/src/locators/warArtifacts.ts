import { Artifact, isArtifact, isUnit } from '@gamepark/paper-tales/material/Artifact'
import { artifactCaracteristics } from '@gamepark/paper-tales/material/ArtifactCaracteristics'
import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { Effect, EffectType } from '@gamepark/paper-tales/material/effects/Effect'
import { isWarType } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { MaterialContext } from '@gamepark/react-game'

/** What the war effects of a kingdom count: the resources produced, and the gold earned at the income (the Ogre) */
const warNeeds = (context: MaterialContext, player?: number) => {
  const effects: Effect[] = []
  for (const unit of context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getItems()) {
    if (isUnit(unit.id)) effects.push(...(unitCardCaracteristics[unit.id as Unit].effect ?? []))
  }
  for (const building of context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(player).getItems<Building>()) {
    const pattern = buildingCardCaracteristics[building.id]
    effects.push(...((building.location.rotation ? pattern.effect2 : pattern.effect1) ?? []))
  }
  const resources = new Set<Resources>()
  let income = false
  for (const effect of effects.filter(isWarType)) {
    const counted = [
      ...('perResource' in effect && effect.perResource !== undefined ? [effect.perResource].flat() : []),
      ...('ifResource' in effect && effect.ifResource ? effect.ifResource : [])
    ]
    counted.forEach((resource) => resources.add(resource))
    if (effect.type === EffectType.AddWarPower && effect.perGoldOnIncomePhase) income = true
  }
  return { resources, income }
}

/**
 * An Artifact shown in the neighbours view: one that acts on the wars itself (the Shield of Power, the Sword of Glory,
 * the War Chest), or that gives what a war effect of its kingdom counts: a resource (the Barracks, the units stronger
 * with a resource), or gold at the income (the Bottomless Purse for the Ogre)
 */
export const isWarArtifact = (context: MaterialContext, card: number | undefined, player?: number) => {
  if (!isArtifact(card)) return false
  const pattern = artifactCaracteristics[card as Artifact]
  if ((pattern.effect ?? []).some(isWarType)) return true
  const needs = warNeeds(context, player)
  if ((pattern.resources ?? []).some((production) => production.type.some((resource) => needs.resources.has(resource)))) return true
  return needs.income && (pattern.effect ?? []).some((effect) => effect.type === EffectType.Income)
}

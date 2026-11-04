import { Artifact, isArtifact, isUnit } from '@gamepark/paper-tales/material/Artifact'
import { artifactCharacteristics } from '@gamepark/paper-tales/material/ArtifactCharacteristics'
import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCharacteristics } from '@gamepark/paper-tales/material/BuildingCharacteristics'
import { Effect, EffectType } from '@gamepark/paper-tales/material/effects/Effect'
import { isWarType } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { unitCardCharacteristics } from '@gamepark/paper-tales/material/UnitCharacteristics'
import { DeployEffectsHelper } from '@gamepark/paper-tales/rules/helpers/DeployEffectsHelper'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext } from '@gamepark/react-game'

/** What the war effects of a kingdom count: the resources produced, and the gold earned at the income (the Ogre) */
const warNeeds = (context: MaterialContext, player?: number) => {
  const effects: Effect[] = []
  for (const unit of context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getItems()) {
    if (isUnit(unit.id)) effects.push(...(unitCardCharacteristics[unit.id].effect ?? []))
  }
  for (const building of context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(player).getItems<Building>()) {
    const pattern = buildingCardCharacteristics[building.id]
    effects.push(...((building.location.rotation ? pattern.effect2 : pattern.effect1) ?? []))
  }
  const resources = new Set<Resources>()
  let income = false
  for (const effect of effects.filter(isWarType)) {
    const counted = [
      ...('perResource' in effect && effect.perResource !== undefined ? [effect.perResource] : []),
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
  const pattern = artifactCharacteristics[card as Artifact]
  if ((pattern.effect ?? []).some(isWarType)) return true
  const needs = warNeeds(context, player)
  if ((pattern.resources ?? []).some((production) => production.type.some((resource) => needs.resources.has(resource)))) return true
  return needs.income && (pattern.effect ?? []).some((effect) => effect.type === EffectType.Income)
}

/** From the reveal to the wars, what a kingdom gains this turn is seen, whether it matters to the wars or not */
const rulesBeforeWars = [RuleId.RevealBoards, RuleId.PayDeployedUnits, RuleId.DeployEffects]

/** A card of a Monarch drawing with the Court Jester: on its way to their Artifacts, or drawn there before it is discarded */
const isDrawnCard = (context: MaterialContext, index: number, card: number | undefined, player: number) => {
  if (context.rules.game.rule?.id !== RuleId.DeployEffects) return false
  if (new DeployEffectsHelper(context.rules.game).getCurrentEffect(player)?.effect.type !== EffectType.DrawArtifact) return false
  return !isArtifact(card) || context.rules.material(MaterialType.Unit).getItem(index).location.type !== LocationType.PlayerArtifacts
}

/** A card among the Artifacts of a Monarch that the neighbours view shows */
export const isShownArtifact = (context: MaterialContext, index: number, card: number | undefined, player?: number) => {
  if (isWarArtifact(context, card, player)) return true
  if (player === undefined || !rulesBeforeWars.includes(context.rules.game.rule?.id as RuleId)) return false
  const gained = context.rules.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
  return gained.includes(index) || isDrawnCard(context, index, card, player)
}

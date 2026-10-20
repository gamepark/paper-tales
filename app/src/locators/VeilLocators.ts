import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { ItemContext, LocationContext, LocationDescription, Locator, MaterialContext, ParentFace } from '@gamepark/react-game'
import { isMoveItemType, Location } from '@gamepark/rules-api'
import { fightsFromBackRow } from '../material/fightsFromBackRow'
import { isWarView } from './TableLayout'

/**
 * A veil darkens a card: a location laid on the card (the framework draws it on the face, so that it follows the card when
 * it is zoomed or turned over), its darkness decided from the rules. The card is read in full colour while it is hovered.
 */
const veilCss = (darkness: number, seconds: number) => css`
  pointer-events: none;
  background: rgba(40, 32, 24, ${darkness});
  transition: opacity ${seconds}s;

  /* The hover of a card is read on the item display around it: item display > card > hover wrapper > face > veil */
  *:hover > * > * > * > & {
    opacity: 0;
  }
`

/** The veil lies on the face that is seen */
const seenFace = (context: MaterialContext, type: MaterialType, location: Location) => {
  const item = context.rules.material(type).getItem(location.parent!)
  return item && context.material[type]?.isFlipped(item, context) ? ParentFace.Back : ParentFace.Front
}

/**
 * The discard is face down like the deck (rulebook p.3): darkened to tell them apart. In the neighbours view, the back row
 * is shaded: only the front row fights (p.6).
 */
class UnitVeilLocator extends Locator {
  parentItemType = MaterialType.Unit
  positionOnParent = { x: 50, y: 50 }
  locationDescription = new UnitVeilDescription()

  // The framework asks the locations of each unit it draws, in the context of that unit
  getLocations(context: ItemContext): Partial<Location>[] {
    const item = context.rules.material(MaterialType.Unit).getItem(context.index)
    if (!item) return []
    const veiled =
      item.location.type === LocationType.Discard ||
      (isWarView(context) && item.location.type === LocationType.PlayerUnitBoard && item.location.y === 1 && !fightsFromBackRow(item))
    return veiled ? [{ type: LocationType.UnitVeil, parent: context.index }] : []
  }

  getParentFace(location: Location, context: MaterialContext) {
    return seenFace(context, MaterialType.Unit, location)
  }
}

class UnitVeilDescription extends LocationDescription {
  width = 10
  height = 14
  borderRadius = 0.5

  getExtraCss(location: Location, context: LocationContext) {
    const inDiscard = context.rules.material(MaterialType.Unit).getItem(location.parent!)?.location.type === LocationType.Discard
    return inDiscard ? discardVeilCss : backRowVeilCss
  }
}

const discardVeilCss = css`
  pointer-events: none;
  background: rgba(40, 32, 24, 0.4);
`
const backRowVeilCss = veilCss(0.45, 0.3)

/**
 * A building that cannot be built now is darkened: not built yet, and not buildable during my construction (the resources,
 * the gold and the land, rulebook p.7). Every building carries its veil, so that it fades out when the building gets built.
 */
class BuildingVeilLocator extends Locator {
  parentItemType = MaterialType.Building
  positionOnParent = { x: 50, y: 50 }
  locationDescription = new BuildingVeilDescription()

  // The framework asks the locations of each building it draws, in the context of that building
  getLocations(context: ItemContext): Partial<Location>[] {
    return [{ type: LocationType.BuildingVeil, parent: context.index }]
  }

  getParentFace(location: Location, context: MaterialContext) {
    return seenFace(context, MaterialType.Building, location)
  }
}

class BuildingVeilDescription extends LocationDescription {
  width = 14
  height = 10
  borderRadius = 0.5

  getExtraCss(location: Location, context: LocationContext) {
    const building = context.rules.material(MaterialType.Building).getItem(location.parent!)
    const dimmed = building?.location.type === LocationType.PlayerBuildingHand && !canBuildNow(context, location.parent!)
    return [buildingVeilCss, !dimmed && clearCss]
  }
}

/** During my construction, a legal move builds this building */
const canBuildNow = (context: MaterialContext, index: number) => {
  if (context.rules.game.rule?.id !== RuleId.Build || context.player === undefined) return false
  return context.rules.getLegalMoves(context.player).some((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === index)
}

const buildingVeilCss = veilCss(0.62, 0.6)
const clearCss = css`
  opacity: 0;
`

export const unitVeilLocator = new UnitVeilLocator()
export const buildingVeilLocator = new BuildingVeilLocator()

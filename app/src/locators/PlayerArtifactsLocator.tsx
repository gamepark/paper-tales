import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import {
  getArtifactCoordinates,
  getArtifactsZone,
  getHoverShift,
  getKingdomScale,
  getWarArtifactCoordinates,
  getPlayerPositionDependencies,
  hasArtifacts,
  isBuildingsDisplayed,
  isKingdomDisplayed,
  isWarView,
  scaleTransform
} from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'
import { isWarArtifact } from './warArtifacts'

/**
 * The Legendary Artifacts of a Monarch (rulebook p.11): apart from the units, next to the buildings, in the order they
 * were put into play; face down until revealed. Shown with the buildings of the displayed area, and in the neighbours
 * view the ones that matter to the wars (see isWarArtifact), in a column at the right of the buildings of their kingdom.
 */
class PlayerArtifactsLocator extends Locator {
  getPositionDependencies(location: Location, context: MaterialContext) {
    return { ...getPlayerPositionDependencies(context), artifacts: this.countArtifacts(context, location.player) }
  }

  private countArtifacts(context: MaterialContext, player?: number) {
    return context.rules.material(MaterialType.Unit).location(LocationType.PlayerArtifacts).player(player).length
  }

  getCoordinates(_location: Location, context: MaterialContext) {
    const zone = getArtifactsZone(context)
    return { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 }
  }

  /** The Artifacts of a Monarch that matter to the wars, in the order they were put into play */
  private warArtifacts(context: MaterialContext, player?: number) {
    return context.rules
      .material(MaterialType.Unit)
      .location(LocationType.PlayerArtifacts)
      .player(player)
      .filter((item) => isWarArtifact(context, item.id as number, player))
      .sort((item) => item.location.x ?? 0)
      .getIndexes()
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    if (isWarView(context)) {
      const indexes = this.warArtifacts(context, item.location.player)
      return getWarArtifactCoordinates(context, item.location.player, Math.max(0, indexes.indexOf(context.index)), indexes.length)
    }
    return getArtifactCoordinates(context, item.location.x ?? 0, this.countArtifacts(context, item.location.player))
  }

  hide(item: MaterialItem, context: ItemContext) {
    if (isWarView(context)) return !isKingdomDisplayed(context, item.location.player) || !isWarArtifact(context, item.id, item.location.player)
    return !isBuildingsDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext) {
    return placeAtPanelWhenHidden(this, item, context, () => [...super.placeItem(item, context), ...scaleTransform(this.getScale(item, context))])
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    const { x, y } = this.getItemCoordinates(item, context)
    const scale = this.getScale(item, context)
    const zoom = 2.6
    const shift = getHoverShift({ x, y, width: unitCardDescription.width * scale, height: unitCardDescription.height * scale, zoom })
    return ['translateZ(30em)', `scale(${zoom})`, ...shift]
  }

  private getScale(item: MaterialItem, context: ItemContext) {
    return isWarView(context) ? getKingdomScale(context, item.location.player) : getArtifactsZone(context).scale
  }

  getLocations(context: MaterialContext) {
    if (!hasArtifacts(context)) return []
    return context.rules.players.filter((player) => isBuildingsDisplayed(context, player)).map((player) => ({ type: LocationType.PlayerArtifacts, player }))
  }

  locationDescription = new PlayerArtifactsDescription()
}

class PlayerArtifactsDescription extends DropAreaDescription {
  getLocationSize(_location: Location, context: MaterialContext) {
    const { width, height } = getArtifactsZone(context)
    return { width, height }
  }

  borderRadius = unitCardDescription.borderRadius

  extraCss = zoneCss
}

const zoneCss = css`
  background-color: rgba(255, 255, 255, 0.12);
`

export const playerArtifactsLocator = new PlayerArtifactsLocator()

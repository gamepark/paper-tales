import { ItemContext, Locator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { getPanelTransform } from './TableLayout'

/**
 * The placement of an item of a Monarch's area: where the locator puts it when the area is displayed, small on the
 * Monarch's panel when the locator hides it (see getPanelTransform). Every locator of a Monarch's area places its items
 * through it, so that every move from or to a hidden area goes through the panel.
 */
export const placeAtPanelWhenHidden = (locator: Locator, item: MaterialItem, context: ItemContext, place: () => string[]): string[] =>
  (locator.hide(item, context) && getPanelTransform(context, item.location.player)) || place()

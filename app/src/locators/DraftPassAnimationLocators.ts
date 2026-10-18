import { ItemContext, Locator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'
import { getPanelCenter, HIDDEN_HAND_SCALE } from './TableLayout'

/**
 * Animation-only locators, used as the start and end frames when my hand is passed to my neighbour (see
 * PaperTalesAnimations): both are built with the same list of transforms (position, turn, face, size), so that the
 * browser goes from one to the other step by step. A frame built by the framework from the fan (turned, face up,
 * full size) and the panel (not turned, face down, small) would not have the same list, and the card would jump.
 */
const frame = (position: string[], turn: string, faceDown: boolean, scale: number) => [
  ...position,
  turn,
  `rotateY(${faceDown ? 180 : 0}deg)`,
  `scale(${scale})`
]

/** The card in my fan, face up: where the hand locator lays it */
class FanCardLocator extends Locator {
  placeItem(_item: MaterialItem, context: ItemContext): string[] {
    // The waypoint is given a location only: the card is the animated item itself
    const card = context.rules.material(context.type).getItem(context.index)!
    const transforms = playerDraftHandLocator.placeItem(card, context)
    const turn = transforms.find((transform) => transform.startsWith('rotateZ')) ?? 'rotateZ(0deg)'
    return frame(
      transforms.filter((transform) => !transform.startsWith('rotateZ')),
      turn,
      false,
      1
    )
  }
}

/** The card on the panel of the Monarch who receives my hand: small and face down */
class ReceiverPanelLocator extends Locator {
  placeItem(item: MaterialItem, context: ItemContext): string[] {
    const center = getPanelCenter(context, item.location.player!)
    if (!center) return []
    return frame([`translate3d(${center.x}em, ${center.y}em, ${center.z}em)`], 'rotateZ(0deg)', true, HIDDEN_HAND_SCALE)
  }
}

export const fanCardLocator = new FanCardLocator()
export const receiverPanelLocator = new ReceiverPanelLocator()

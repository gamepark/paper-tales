import { ItemContext, Locator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'
import { getPanelCenter, HIDDEN_HAND_SCALE } from './TableLayout'

/**
 * Animation-only frames, used as the start and end frames when a hand is passed between my fan and a panel (see
 * PaperTalesAnimations): all are built with the same list of transforms (position, turn, face, size), so that the
 * browser goes from one to the other step by step. A frame built by the framework from the fan (turned, face up, full
 * size) and the panel (not turned, face down, small) would not have the same list, and the card would jump.
 */
const frame = (position: string[], turn: string, faceDown: boolean, scale: number) => [
  ...position,
  turn,
  `rotateY(${faceDown ? 180 : 0}deg)`,
  `scale(${scale})`
]

/** A card in my fan, face up: where the hand locator lays it in the state of the context */
export const fanCardFrame = (card: MaterialItem, context: ItemContext): string[] => {
  const transforms = playerDraftHandLocator.placeItem(card, context)
  const turn = transforms.find((transform) => transform.startsWith('rotateZ')) ?? 'rotateZ(0deg)'
  return frame(
    transforms.filter((transform) => !transform.startsWith('rotateZ')),
    turn,
    false,
    1
  )
}

/** The card in my fan, before it leaves it */
class FanCardLocator extends Locator {
  placeItem(_item: MaterialItem, context: ItemContext): string[] {
    // The waypoint is given a location only: the card is the animated item itself
    return fanCardFrame(context.rules.material(context.type).getItem(context.index)!, context)
  }
}

/** A card on the panel of a Monarch (the player of the location): small and face down */
class PanelCardLocator extends Locator {
  placeItem(item: MaterialItem, context: ItemContext): string[] {
    const center = getPanelCenter(context, item.location.player!)
    if (!center) return []
    return frame([`translate3d(${center.x}em, ${center.y}em, ${center.z}em)`], 'rotateZ(0deg)', true, HIDDEN_HAND_SCALE)
  }
}

/** A frame computed beforehand, e.g. in the state after the move */
export class FrameLocator extends Locator {
  constructor(private readonly transforms: string[]) {
    super()
  }

  placeItem(): string[] {
    return this.transforms
  }
}

export const fanCardLocator = new FanCardLocator()
export const panelCardLocator = new PanelCardLocator()

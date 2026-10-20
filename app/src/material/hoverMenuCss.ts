import { css } from '@emotion/react'

/**
 * The framework draws the menu of an item (ItemMenuWrapper) 15 em above it, as the next sibling of the item display.
 * A zoomed card is lifted above that height (20 em) so that it hides the buttons of its neighbours; this lifts its own buttons
 * above it again, so that on a hovered card only its own buttons show. `translate` composes with the button's transform.
 * Its buttons only: while a card has no menu, the element that follows it is the next card of the page (the cards are
 * laid in the page by index, wherever they are on the table), which jumped over all the others.
 */
export const hoveredItemMenuAboveCss = css`
  *:hover:has(> &) + * > button {
    translate: 0 0 25em;
  }
`

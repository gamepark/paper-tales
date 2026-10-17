import { css } from '@emotion/react'

/**
 * The framework draws the menu of an item (ItemMenuWrapper) 15 em above it, as the next sibling of the item display.
 * A zoomed card is lifted above that height (20 em) so that it hides the buttons of its neighbours; this lifts its own buttons
 * above it again, so that on a hovered card only its own buttons show. `translate` composes with the button's transform.
 */
export const hoveredItemMenuAboveCss = css`
  *:hover:has(> &) + * > * {
    translate: 0 0 25em;
  }
`

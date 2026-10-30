import { css } from '@emotion/react'
import { XYCoordinates } from '@gamepark/rules-api'
import { FC, HTMLAttributes } from 'react'
import { tablePosition } from '../locators/TableLayout'
import { appearCss } from '../theme/tableTheme'

/**
 * Lays its content on the table at the given coordinates. The position is in table em, so it is set on an outer
 * wrapper that keeps the table font size: the styles given to the anchor (font size included) apply to the inner one.
 * It fades in when it comes onto the table, like everything that comes with a change of view.
 * The outer wrapper is never hit: its box stays at the coordinates while the content is often translated aside
 * (centred on them), and that empty box, above the cards, would take their hover. The content is hit, unless its own
 * styles say otherwise (:where keeps this rule weaker than any of them).
 */
export const TableAnchor: FC<{ position: XYCoordinates } & HTMLAttributes<HTMLDivElement>> = ({ position, children, ...props }) => (
  <div css={[anchorCss, appearCss]} style={tablePosition(position)}>
    <div {...props}>{children}</div>
  </div>
)

const anchorCss = css`
  position: absolute;
  transform: translateZ(10em);
  pointer-events: none;

  /* "*" first: Emotion would glue a leading pseudo-class onto the anchor's own class */
  *:where(& > *) {
    pointer-events: auto;
  }
`

import { css } from '@emotion/react'
import { XYCoordinates } from '@gamepark/rules-api'
import { FC, HTMLAttributes } from 'react'
import { tablePosition } from '../locators/TableLayout'
import { appearCss } from '../theme/tableTheme'

/**
 * Lays its content on the table at the given coordinates. The position is in table em, so it is set on an outer
 * wrapper that keeps the table font size: the styles given to the anchor (font size included) apply to the inner one.
 * It fades in when it comes onto the table, like everything that comes with a change of view.
 */
export const TableAnchor: FC<{ position: XYCoordinates } & HTMLAttributes<HTMLDivElement>> = ({ position, children, ...props }) => (
  <div css={[anchorCss, appearCss]} style={tablePosition(position)}>
    <div {...props}>{children}</div>
  </div>
)

const anchorCss = css`
  position: absolute;
  transform: translateZ(10em);
`

import { css } from '@emotion/react'
import { FC } from 'react'
import { tagPaperCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

export type TableRect = { x: number; y: number; width: number; height: number }

/**
 * A band of ink-coloured paper laid across something that does not count yet: a building not built, the back row of a
 * kingdom that does not fight. Centred on the given rectangle (table em), tilted, sized by `scale` (a scaled kingdom
 * has a smaller band).
 */
export const Sash: FC<{ rect: TableRect; label: string; scale?: number; angle?: number }> = ({ rect, label, scale = 1, angle = -14 }) => (
  <TableAnchor position={{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }} css={anchorCss}>
    <span css={[tagPaperCss, sashCss]} style={{ fontSize: `${scale}em`, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>
      {label}
    </span>
  </TableAnchor>
)

const anchorCss = css`
  pointer-events: none;
`

const sashCss = css`
  position: absolute;
  padding: 0.3em 1.1em 0.18em;
`

import { css } from '@emotion/react'
import { FC } from 'react'
import legend from '../images/icons/legend.webp'

/**
 * The silhouette of the official Legend point scroll (icons/legend.webp, 65 × 60 px), traced in the pixels of the
 * image: the roll at the top left, the sheet, the roll at the bottom that runs out to the right.
 */
const silhouette = 'M 11 3 H 46 Q 51 3 51 8 V 46 H 57 Q 61 46 61 50 V 54 Q 61 60 55 60 H 23 Q 16 60 16 53 V 19 H 11 A 8 8 0 0 1 11 3 Z'

/** The image drawn 40 units wide in the 54-unit box of the paper icons */
const scale = 40 / 65

/**
 * The Legend point scroll printed on the cards, outlined like the paper icons beside it (PaperIcons): the same box,
 * the dark line 6 units wide, the white cut fringe 2.6 units wide, round joins. The outline is drawn as a path under
 * the image, so it is as smooth as their strokes.
 */
export const LegendScrollIcon: FC = () => (
  <svg viewBox="-3 -3 54 54" css={iconCss} aria-hidden>
    <g transform={`translate(4 5.5) scale(${scale})`}>
      <path d={silhouette} fill="#2e2a26" stroke="#2e2a26" strokeWidth={6 / scale} strokeLinejoin="round" />
      <path d={silhouette} fill="#fffdf8" stroke="#fffdf8" strokeWidth={2.6 / scale} strokeLinejoin="round" />
      <image href={legend} width="65" height="60" />
    </g>
  </svg>
)

const iconCss = css`
  width: 1.7em;
  height: 1.7em;
  overflow: visible;
  pointer-events: none;
`

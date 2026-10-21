import { css, keyframes } from '@emotion/react'

/**
 * The look of everything drawn on the table besides the material: cut paper, like the art of the game. Labels and
 * buttons are slips of paper with torn edges and an offset shadow, as if laid on the table. Colour tells the role:
 * cream for what is read, rust for what is done, dark ink for who (tags, war). Font: Baloo 2 (the rounded heavy
 * capitals of the rulebook titles).
 */
export const parchment = '#f1e6cc'
export const parchmentDark = '#e2d2ac'
export const brown = '#5a3414'
export const wood = '#7b4a24'
export const ochre = '#e9b534'

export const paper = '#f6ece6'
export const paperMuted = '#e2d6cd'
export const cutLine = '#4a4540'
export const rust = '#b5481f'
export const rustDeep = '#8f3816'
export const paperFont = "'Baloo 2', 'Mulish', sans-serif"

/**
 * A torn edge, as a clip-path polygon: a deterministic jitter, so that the paper tears the same way at every render.
 * Depths are in % of the box, so the tear scales with the slip.
 */
const tornPolygon = (seed: number, depth: number, side: number, steps = 18, sideSteps = 4) => {
  let state = seed
  const random = () => (state = (state * 9301 + 49297) % 233280) / 233280
  const points: string[] = []
  // The corner points sit at the bottom of the tear, so that the edge never rises toward a corner
  const top = (x: number, corner = false) => `${x.toFixed(1)}% ${(corner ? depth : random() * depth).toFixed(1)}%`
  const bottom = (x: number, corner = false) => `${x.toFixed(1)}% ${(100 - (corner ? depth : random() * depth)).toFixed(1)}%`
  for (let i = 0; i <= steps; i++) points.push(top((i / steps) * 100, i === 0 || i === steps))
  // The sides start inside the edges: a side point on a corner would stick out of the torn top or bottom edge as a spike
  for (let i = 1; i < sideSteps; i++) points.push(`${(100 - random() * side).toFixed(1)}% ${((i / sideSteps) * 100).toFixed(1)}%`)
  for (let i = steps; i >= 0; i--) points.push(bottom((i / steps) * 100, i === 0 || i === steps))
  for (let i = sideSteps - 1; i > 0; i--) points.push(`${(random() * side).toFixed(1)}% ${((i / sideSteps) * 100).toFixed(1)}%`)
  return `polygon(${points.join(',')})`
}

export const tornClip = tornPolygon(7, 9, 2.5)
/** Shallower tears, for the large sheets (player panels) and the paper glued on them */
export const sheetTornClip = tornPolygon(7, 4, 1.2)
/** The cover of the story book: a long sheet, torn very shallow */
export const coverTornClip = tornPolygon(7, 1.3, 0.6, 44)
/** The cover of a side panel, as tall as the screen: its free side is torn all along, like the top and bottom edges */
export const panelTornClip = tornPolygon(7, 1.3, 1.4, 24, 40)
/** A light sheet glued in the story book (the rows of the help) */
export const bookSheetClip = tornPolygon(7, 2.2, 0.8)
export const patchTornClip = tornPolygon(31, 4, 1.5)

/** A disc of paper torn by hand: a circle with an irregular rim */
export const tornDiscClip = (() => {
  let state = 11
  const random = () => (state = (state * 9301 + 49297) % 233280) / 233280
  const points: string[] = []
  const steps = 26
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const radius = 45.5 + random() * 4.5
    points.push(`${(50 + radius * Math.cos(angle)).toFixed(1)}% ${(50 + radius * Math.sin(angle)).toFixed(1)}%`)
  }
  return `polygon(${points.join(',')})`
})()

/**
 * A slip of torn paper. The paper is drawn by ::before, behind the content, so that the drop shadow of the element
 * follows the torn shape (a filter on the clipped element itself would be clipped too).
 */
export const paperCss = (background: string, color: string) => css`
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  padding: 0.3em 1.1em 0.2em;
  color: ${color};
  font-family: ${paperFont};
  font-weight: 800;
  letter-spacing: 0.01em;
  white-space: nowrap;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${background};
    clip-path: ${tornClip};
  }

  img {
    height: 1.2em;
    object-fit: contain;
  }
`

/** What is read: phase information, names, the draft direction */
export const ribbonCss = paperCss(paper, cutLine)
export const labelCss = ribbonCss

/** Who: the neighbour tags of the panels */
export const tagPaperCss = paperCss(cutLine, paper)

/** A player's colour, as a strip of coloured paper glued along the bottom of a slip */
export const colorStripCss = (color: string) => css`
  padding-bottom: 0.5em;

  &::after {
    content: '';
    position: absolute;
    left: 0.9em;
    right: 0.9em;
    bottom: 0.3em;
    height: 0.24em;
    border-radius: 0.1em;
    background: ${color};
  }
`

/** Replaces the paper of a slip */
export const paperBackgroundCss = (background: string, color: string) => css`
  color: ${color};

  &::before {
    background: ${background};
  }
`

/** A small paper caption under a pile, the turn counter */
export const captionCss = css`
  ${paperCss(paper, cutLine)};
  box-sizing: border-box;
  width: 100%;
  padding: 0.15em 0.8em 0.05em;
  font-size: 0.8em;
`

/**
 * The framework's buttons (ThemeButton, under PlayMoveButton) paint a rounded background on hover, focus and active:
 * a paper button has no background of its own, in any state. Keyboard focus shows as a dashed ochre outline.
 */
export const paperButtonResetCss = css`
  border: none;
  border-radius: 0;
  background: none;
  cursor: pointer;

  &:hover,
  &:focus,
  &:active,
  &:disabled {
    background: none;
    border: none;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 0.12em dashed ${ochre};
    outline-offset: 0.15em;
  }
`

/** What is done: the buttons laid on the table, rust paper that lifts under the pointer */
export const tableButtonCss = css`
  ${paperCss(rust, paper)};
  ${paperButtonResetCss};
  font-size: 1em;
  transition:
    transform 0.15s,
    filter 0.15s;

  &:hover:not(:disabled) {
    transform: translate(-0.05em, -0.08em);
    filter: drop-shadow(0.24em 0.3em 0 #00000059);
  }

  &:active:not(:disabled) {
    transform: translate(0.08em, 0.1em);
    filter: drop-shadow(0.06em 0.08em 0 #00000059);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`

const appear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

/**
 * How the labels laid on the table come in when the view changes (my kingdom, the neighbours, another player): a short
 * fade. Never on a card: an opacity below 1 flattens its 3D, and a card turning over (an upgrade, a reveal) would show
 * its back face mirrored.
 */
export const appearCss = css`
  animation: ${appear} 0.3s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const roundImageCss = css`
  border-radius: 50%;
`

/**
 * The zoom buttons of the table: square slips of pale paper like the buttons of the views, set on the screen and not on
 * the table, so that they keep their size and place when the table zooms. Laid over the framework's own buttons by the
 * css of GameTableNavigation (see GameDisplay); their size follows the row.
 */
export const zoomButtonCss = css`
  ${tableButtonCss};
  display: grid;
  place-items: center;
  font-size: 1em;
  width: 1.7em;
  height: 1.7em;
  border: none;
  border-radius: 0;
  background: none;
  color: ${cutLine};

  &::before {
    background: ${paperMuted};
  }

  &:disabled {
    color: ${cutLine};
    border-color: transparent;
  }

  &:not(:disabled):focus,
  &:not(:disabled):hover {
    transform: translate(-0.05em, -0.08em);
  }

  &:not(:disabled):active {
    transform: translate(0.08em, 0.1em);
    background: none;
  }

  svg {
    width: 0.8em;
    height: 0.8em;
  }
`

import { css } from '@emotion/react'
import { FC, ReactNode, SVGAttributes } from 'react'

/**
 * The icons of the game, drawn as cut paper like its art: flat sheets of colour, a white cut fringe and a dark outline
 * around them, so that they read on any card and on the dark discs of the menu buttons. Each drawing is centred in its
 * box.
 */
const PaperIcon: FC<{ children: ReactNode } & SVGAttributes<SVGSVGElement>> = ({ children, ...props }) => (
  <svg viewBox="-3 -3 54 54" css={iconCss} aria-hidden {...props}>
    {/* The same shapes twice: a wide dark outline under, then the shapes with their white fringe */}
    <g stroke="#2e2a26" strokeWidth={6} strokeLinejoin="round">
      {children}
    </g>
    <g stroke="#fffdf8" strokeWidth={2.6} strokeLinejoin="round" paintOrder="stroke">
      {children}
    </g>
  </svg>
)

const iconCss = css`
  width: 1.7em;
  height: 1.7em;
  overflow: visible;
  pointer-events: none;
`

/** Keep a card: a card sealed with a check */
export const KeepIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <g transform="translate(-2 0)">
      <rect x="9" y="5" width="24" height="33" rx="3" transform="rotate(-8 21 21)" fill="#f6ece6" />
      <rect x="11.5" y="9" width="19" height="7" rx="1" transform="rotate(-8 21 21)" fill="#b5481f" />
      <rect x="12" y="19" width="18" height="13" rx="1.5" transform="rotate(-8 21 21)" fill="#d9c8b8" />
      <circle cx="33" cy="34" r="9.5" fill="#9b2e4d" />
      <path d="M28.5 34.2l3.2 3.2 6-6.4" fill="none" />
    </g>
  </PaperIcon>
)

/** Discard a card: a card torn in two */
export const DiscardIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <g transform="translate(0.5 -0.5)">
      <path d="M6 9 L22 6 L23 14 L20 18 L24 23 L21 28 L25 34 L24 41 L9 43 Z" fill="#f6ece6" transform="rotate(-9 16 24)" />
      <path d="M8.5 11.5 L20.5 9.3 L21 15 L10 17 Z" fill="#b5481f" transform="rotate(-9 16 24)" />
      <path d="M27 7 L41 9 L39 44 L28 42 L29 35 L25.5 29 L29 24 L25 19 L28 14 Z" fill="#f6ece6" transform="rotate(10 33 25)" />
      <path d="M28 10 L39 11.5 L38.6 17 L27.6 15.6 Z" fill="#b5481f" transform="rotate(10 33 25)" />
    </g>
  </PaperIcon>
)

/** Build: a hammer, a wooden handle and an iron head, bold enough to read at the size of a menu button */
export const BuildIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <g transform="translate(-1.3 -2.7)">
      <path d="M8.5 40.5 L11.5 43.5 L30.5 24.5 L27.5 21.5 Z" fill="#a0754a" />
      <path d="M28.2 9.8 L42.2 23.8 L35.8 30.2 L21.8 16.2 Z" fill="#8f8981" />
      <path d="M28.2 9.8 L42.2 23.8 L40.2 25.8 L26.2 11.8 Z" fill="#c4beb5" />
    </g>
  </PaperIcon>
)

/** Save a unit from dying: an Age token before a shield */
export const SaveIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <path d="M24 4 L41 9 L41 22 C41 33 33 40 24 44 C15 40 7 33 7 22 L7 9 Z" fill="#9b2e4d" />
    <circle cx="24" cy="23" r="11" fill="#3e7d8a" />
    <path d="M27.5 15.5 A8.5 8.5 0 1 0 31.5 28 A7 7 0 1 1 27.5 15.5 Z" fill="#f6ece6" />
  </PaperIcon>
)

/** My kingdom: a paper crown */
export const CrownIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <path d="M6 15 L15 24 L24 10 L33 24 L42 15 L38 38 L10 38 Z" fill="#e9b534" />
    <rect x="10" y="33" width="28" height="7" rx="1.5" fill="#c99419" />
    <circle cx="24" cy="26" r="3.6" fill="#b5481f" />
    <circle cx="15.5" cy="29" r="2.6" fill="#9b2e4d" />
    <circle cx="32.5" cy="29" r="2.6" fill="#9b2e4d" />
  </PaperIcon>
)

/** A sword pointing up, its hilt at the bottom, centred on (24, 24): rotated to cross it with another */
const Sword: FC<{ angle: number }> = ({ angle }) => (
  <g transform={`rotate(${angle} 24 24)`}>
    <path d="M22 3 L24 0 L26 3 L26 33 L22 33 Z" fill="#dfe3e6" />
    <path d="M24 0 L26 3 L26 33 L24 33 Z" fill="#b9c0c6" />
    <rect x="15.5" y="32.5" width="17" height="3.6" rx="1.4" fill="#e9b534" />
    <rect x="22.4" y="36" width="3.2" height="6.5" rx="1" fill="#7a4b2a" />
    <circle cx="24" cy="44.5" r="2.6" fill="#e9b534" />
  </g>
)

/** My neighbours: the war, as a coat of arms, a crimson shield with a golden rim and two crossed swords on it */
export const NeighboursIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <path d="M24 3 L42 9 L42 23 C42 34.5 34 41.5 24 46 C14 41.5 6 34.5 6 23 L6 9 Z" fill="#e9b534" />
    <path d="M24 6.5 L38.8 11.4 L38.8 23 C38.8 32.6 32.2 38.6 24 42.4 C15.8 38.6 9.2 32.6 9.2 23 L9.2 11.4 Z" fill="#8a2240" />
    <path d="M24 6.5 L9.2 11.4 L9.2 23 C9.2 32.6 15.8 38.6 24 42.4 Z" fill="#b23c5e" />
    {/* the swords, drawn smaller (their outline thins with them) and crossed over the field */}
    <g transform="translate(24 24.5) scale(0.58) translate(-24 -24)">
      <Sword angle={-40} />
      <Sword angle={40} />
    </g>
  </PaperIcon>
)

/** Legend points: the golden scroll printed in the corner of the buildings */
export const LegendIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <path d="M14 8 H36 Q40 8 40 12 V38 H18 Q14 38 14 34 Z" fill="#e9b534" />
    <path d="M14 8 Q8 8 8 13 Q8 17 14 17 Z" fill="#c99419" />
    <path d="M18 38 Q14 38 14 34 V32 H40 V38 Q40 43 35 43 H22 Q18 43 18 38 Z" fill="#d6a72a" />
    <path d="M20 15 H34 M20 21 H34 M20 27 H30" fill="none" strokeLinecap="round" />
  </PaperIcon>
)

/** Place an Age token: the moon token, and an arrow onto it */
export const AgeIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <g transform="translate(0 1.5)">
      <circle cx="24" cy="29" r="14" fill="#3e7d8a" />
      <path d="M28 19.5 A10.5 10.5 0 1 0 33.5 35 A8.6 8.6 0 1 1 28 19.5 Z" fill="#f6ece6" />
      <path d="M24 2 L24 11 M19 7 L24 12 L29 7" fill="none" strokeLinecap="round" />
    </g>
  </PaperIcon>
)

/** Apply again the "when revealed" effects of a unit (the Shadow): a card turned over, and a looping arrow around it */
export const ReactivateIcon: FC<SVGAttributes<SVGSVGElement>> = (props) => (
  <PaperIcon {...props}>
    <rect x="15" y="12" width="18" height="25" rx="2.5" transform="rotate(-8 24 24)" fill="#f6ece6" />
    <rect x="17.5" y="15" width="13" height="5" rx="1" transform="rotate(-8 24 24)" fill="#9b2e4d" />
    <path d="M9 26 A15 15 0 0 1 36 12" fill="none" strokeLinecap="round" />
    <path d="M31 8 L37.5 11.5 L33 17.5" fill="none" strokeLinecap="round" />
    <path d="M39 22 A15 15 0 0 1 12 36" fill="none" strokeLinecap="round" />
    <path d="M17 40 L10.5 36.5 L15 30.5" fill="none" strokeLinecap="round" />
  </PaperIcon>
)

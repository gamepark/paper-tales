import { css } from '@emotion/react'
import { ItemButtonProps, ItemMenuButton } from '@gamepark/react-game'
import { FC, HTMLAttributes, ReactNode } from 'react'
import { cutLine, paper, paperFont, tornClip, tornDiscClip } from '../theme/tableTheme'

type PaperMenuButtonProps = ItemButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    children: ReactNode
    /** Building level printed in a corner badge, like on the building cards */
    level?: number
  }

/**
 * The menu buttons of the cards, in cut paper: a dark ink disc with a cream ring and an offset shadow, holding a paper
 * icon, and its label on a torn slip of paper. The label is drawn here, among the children of the button, rather than
 * given to the framework, whose label has a look of its own.
 */
export const PaperMenuButton: FC<PaperMenuButtonProps> = ({ children, level, label, labelPosition = 'right', ...props }) => (
  <ItemMenuButton css={discCss} {...props}>
    {children}
    {label && <span css={[labelCss, labelPosition === 'left' ? labelLeftCss : labelRightCss]}>{label}</span>}
    {level !== undefined && <LevelBadge level={level} />}
  </ItemMenuButton>
)

/** Where a menu button stands, from the centre of its card */
export type MenuPosition = { radius: number; angle: number }

/** The level of a building, in a corner badge like on the building cards */
export const LevelBadge: FC<{ level: number }> = ({ level }) => (
  <span css={levelCss} data-level>
    {level}
  </span>
)

const discCss = css`
  width: 2.6em;
  height: 2.6em;
  border: none;
  border-radius: 0;
  background: none;
  isolation: isolate;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);
  transition:
    margin-top 0.15s,
    filter 0.15s;

  /* The disc of torn paper, drawn behind the icon so that the shadow follows its rim */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paper};
    clip-path: ${tornDiscClip};
  }

  /* The icon fills the disc */
  > svg {
    width: 2.05em;
    height: 2.05em;
  }

  &:hover:not(:disabled) {
    margin-top: -0.12em;
    filter: drop-shadow(0.22em 0.3em 0 #00000059);
  }
`

/** The label, on a torn slip of paper tucked behind the disc */
const labelCss = css`
  position: absolute;
  top: 50%;
  white-space: nowrap;
  z-index: -2;
  isolation: isolate;
  background: none;
  color: ${cutLine};
  font-family: ${paperFont};
  font-weight: 800;
  font-size: 0.85em;
  padding: 0.2em 0.6em 0.1em 1em;
  filter: drop-shadow(0.12em 0.16em 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paper};
    clip-path: ${tornClip};
  }
`

const labelRightCss = css`
  right: 0.2em;
  transform: translate(100%, -50%) translateZ(-0.1em);
`

const labelLeftCss = css`
  left: 0.2em;
  padding: 0.2em 1em 0.1em 0.6em;
  transform: translate(-100%, -50%) translateZ(-0.1em);
`

const levelCss = css`
  position: absolute;
  right: -0.3em;
  bottom: -0.25em;
  width: 1.1em;
  height: 1.1em;
  display: grid;
  place-items: center;
  border-radius: 0.2em;
  border: 0.1em solid ${paper};
  background: #5a3414;
  color: ${paper};
  font-family: ${paperFont};
  font-weight: 800;
  font-size: 0.8em;
  line-height: 1;
`

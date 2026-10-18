import { css } from '@emotion/react'
import { PlayMoveButton } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { cutLine, paper, paperButtonResetCss, paperFont, rust, tornClip, tornDiscClip } from '../../../theme/tableTheme'
import { LevelBadge } from '../../PaperMenuButton'

/**
 * An action in a help page, drawn like the button on the card so that the player recognises it: the icon on a disc of
 * torn paper, the words on a torn slip tucked behind it, both lifting under the pointer
 */
export const HelpActionButton: FC<{ move: MaterialMove; icon: ReactNode; level?: number; onPlay?: () => void; children: ReactNode }> = ({
  move,
  icon,
  level,
  onPlay,
  children
}) => (
  <PlayMoveButton css={buttonCss} move={move} onPlay={onPlay}>
    <span css={discCss}>
      {icon}
      {level !== undefined && <LevelBadge level={level} />}
    </span>
    <span css={labelCss}>{children}</span>
  </PlayMoveButton>
)

const shadow = (x: number, y: number) => `drop-shadow(${x}em ${y}em 0 #00000059)`

/**
 * A dialog gives its buttons the look of the dialog buttons of the theme (a rust slip whose text turns paper on hover):
 * this button is drawn by its disc and its slip, so that look is undone, in every state
 */
const buttonCss = css`
  ${paperButtonResetCss};
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  width: auto;
  margin: 0;
  padding: 0;
  font: inherit;
  color: ${cutLine};
  filter: none;
  transition: transform 0.15s;

  &::before,
  &::after {
    content: none;
  }

  &:hover,
  &:focus {
    color: ${cutLine};
    filter: none;
  }

  &:hover:not(:disabled) {
    transform: translate(-0.04em, -0.1em);
  }

  &:active:not(:disabled) {
    transform: translate(0.04em, 0.06em);
  }
`

const discCss = css`
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  width: 2.5em;
  height: 2.5em;
  /* On the paper of the page, the disc of paper is drawn with an ink rim */
  filter: drop-shadow(0 0 0.05em ${cutLine}) drop-shadow(0 0 0.05em ${cutLine}) ${shadow(0.14, 0.18)};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paper};
    clip-path: ${tornDiscClip};
  }

  > svg {
    width: 2em;
    height: 2em;
  }
`

const labelCss = css`
  position: relative;
  z-index: -1;
  margin-left: -0.7em;
  padding: 0.2em 0.8em 0.1em 1.1em;
  /* What is done is rust, as the buttons laid on the table: it stands out from the paper of the page */
  color: ${paper};
  font-family: ${paperFont};
  font-weight: 800;
  white-space: nowrap;
  filter: ${shadow(0.12, 0.16)};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${rust};
    clip-path: ${tornClip};
  }
`

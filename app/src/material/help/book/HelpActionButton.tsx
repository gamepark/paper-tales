import { css } from '@emotion/react'
import { PlayMoveButton } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { tableButtonCss } from '../../../theme/tableTheme'
import { LevelBadge } from '../../PaperMenuButton'

/**
 * An action in a help page: the rust slip of the table buttons, with the icon and the words of the button on the card,
 * so that the player recognises it
 */
export const HelpActionButton: FC<{ move: MaterialMove; icon: ReactNode; level?: number; onPlay?: () => void; children: ReactNode }> = ({
  move,
  icon,
  level,
  onPlay,
  children
}) => (
  <PlayMoveButton css={[tableButtonCss, buttonCss]} move={move} onPlay={onPlay}>
    <span css={iconCss}>
      {icon}
      {level !== undefined && <LevelBadge level={level} />}
    </span>
    {children}
  </PlayMoveButton>
)

const buttonCss = css`
  padding-left: 0.7em;
`

const iconCss = css`
  position: relative;
  display: inline-grid;
  font-size: 0.8em;

  > svg {
    width: 1.9em;
    height: 1.9em;
  }
`

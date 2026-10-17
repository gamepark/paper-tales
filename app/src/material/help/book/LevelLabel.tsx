import { css } from '@emotion/react'
import { FC } from 'react'
import building1 from '../../../images/icons/printed-building-1.webp'
import building2 from '../../../images/icons/printed-building-2.webp'
import { PrintedIcon } from './HelpIcons'

const levelIcons = [building1, building2]

/** The level an effect or a production belongs to: the icon printed on the card, and its name */
export const LevelLabel: FC<{ level: number; label: string }> = ({ level, label }) => (
  <span css={levelLabelCss}>
    <PrintedIcon src={levelIcons[level]} />
    {label}
  </span>
)

const levelLabelCss = css`
  margin-right: 0.25em;
  color: #6b6058;
  font-weight: 700;
  white-space: nowrap;
`

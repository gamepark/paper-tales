import { css } from '@emotion/react'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { FC } from 'react'
import crystal from '../../../images/icons/crystal.webp'
import food from '../../../images/icons/food.webp'
import wood from '../../../images/icons/wood.webp'
import scoreIcon from '../../../images/score/scoreIcon.png'
import ageToken from '../../../images/tokens/Age.jpg'
import gold from '../../../images/tokens/Gold1.jpg'
import { crimson } from '../../../theme/book'

/** The official icons of the game (archive « Portage numérique », 04 icons), inline in the help texts */
const resourceIcons: Partial<Record<Resources, string>> = {
  [Resources.Wood]: wood,
  [Resources.Food]: food,
  [Resources.Diamond]: crystal
}

export const ResourceIcon: FC<{ resource: Resources }> = ({ resource }) =>
  resource === Resources.Gold ? <CoinIcon /> : <img css={resourceCss} src={resourceIcons[resource]} alt="" />

export const CoinIcon: FC = () => <img css={roundCss} src={gold} alt="" />
export const AgeIcon: FC = () => <img css={roundCss} src={ageToken} alt="" />
export const LegendIcon: FC = () => <img css={iconCss} src={scoreIcon} alt="" />

/** The strength shield printed on the cards, with its value */
export const StrengthIcon: FC<{ value: number | string }> = ({ value }) => <span css={shieldCss}>{value}</span>

const iconCss = css`
  display: inline-block;
  height: 1.25em;
  vertical-align: -0.22em;
`

const resourceCss = css`
  ${iconCss};
  width: 1.3em;
  height: 1.3em;
  object-fit: contain;
`

const roundCss = css`
  ${iconCss};
  width: 1.2em;
  height: 1.2em;
  border-radius: 50%;
`

const shieldCss = css`
  display: inline-grid;
  place-items: center;
  width: 1.15em;
  height: 1.3em;
  padding-bottom: 0.15em;
  vertical-align: -0.25em;
  color: #fff;
  background: ${crimson};
  clip-path: polygon(0 0, 100% 0, 100% 62%, 50% 100%, 0 62%);
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.95em;
  line-height: 1;
`

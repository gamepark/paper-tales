import { css } from '@emotion/react'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { FC } from 'react'
import crystal from '../../../images/icons/crystal.webp'
import food from '../../../images/icons/food.webp'
import strength from '../../../images/icons/strength.webp'
import wood from '../../../images/icons/wood.webp'
import scoreIcon from '../../../images/score/scoreIcon.png'
import ageToken from '../../../images/tokens/Age.jpg'
import gold from '../../../images/tokens/Gold1.jpg'

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

/** An icon cut from the printed cards (deploy, Age token added, building level 1 or 2…) */
export const PrintedIcon: FC<{ src: string }> = ({ src }) => <img css={resourceCss} src={src} alt="" />

/** The Legend scroll of the cards, with its value written on it */
export const LegendValueIcon: FC<{ value: number }> = ({ value }) => (
  <span css={[valueOnIconCss, legendValueCss]} style={{ backgroundImage: `url(${scoreIcon})` }}>
    {value}
  </span>
)

/** The gold coin of the cards, with its value written on it */
export const GoldValueIcon: FC<{ value: number }> = ({ value }) => <span css={[valueOnIconCss, goldValueCss]}>{value}</span>

const valueOnIconCss = css`
  display: inline-grid;
  place-items: center;
  height: 1.3em;
  vertical-align: middle;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.95em;
  line-height: 1;
`

const legendValueCss = css`
  min-width: 1.1em;
  padding: 0 0.15em 0.05em 0.3em;
  background: center / contain no-repeat;
  color: #5a3414;
`

const goldValueCss = css`
  width: 1.3em;
  border-radius: 50%;
  background: radial-gradient(circle, #f7d34a 55%, #e9b534 58%, #c98f16 100%);
  color: #4a3410;
`

const iconCss = css`
  display: inline-block;
  height: 1.25em;
  vertical-align: middle;
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

/** The official strength shield (04 icons/bouclier_rouge), its value written on it as on the cards */
const shieldCss = css`
  display: inline-grid;
  place-items: center;
  width: 1.12em;
  height: 1.3em;
  padding-bottom: 0.12em;
  vertical-align: middle;
  color: #fff;
  background: url(${strength}) center / contain no-repeat;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.95em;
  line-height: 1;
`

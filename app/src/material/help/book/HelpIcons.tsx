import { css } from '@emotion/react'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { FC, ReactNode } from 'react'
import ageToken from '../../../images/icons/age-token.webp'
import crystal from '../../../images/icons/crystal.webp'
import food from '../../../images/icons/food.webp'
import gold from '../../../images/icons/gold-token.webp'
import strength from '../../../images/icons/strength.webp'
import wood from '../../../images/icons/wood.webp'
import scoreIcon from '../../../images/score/scoreIcon.png'

/**
 * Every icon in a help text sits in the same square box, centred on the middle of the line; the image keeps its own
 * ratio inside the box (official icons of the archive « Portage numérique »).
 */
const IconBox: FC<{ size?: number; children: ReactNode }> = ({ size = 1.35, children }) => (
  <span css={boxCss} style={{ width: `${size}em`, height: `${size}em` }}>
    {children}
  </span>
)

const IconImage: FC<{ src: string; size?: number }> = ({ src, size }) => (
  <IconBox size={size}>
    <img css={imageCss} src={src} alt="" />
  </IconBox>
)

const resourceIcons: Partial<Record<Resources, string>> = {
  [Resources.Wood]: wood,
  [Resources.Food]: food,
  [Resources.Diamond]: crystal
}

export const ResourceIcon: FC<{ resource: Resources }> = ({ resource }) =>
  resource === Resources.Gold ? <CoinIcon /> : <IconImage src={resourceIcons[resource]!} />

export const CoinIcon: FC = () => <IconImage src={gold} />
export const AgeIcon: FC = () => <IconImage src={ageToken} />
export const LegendIcon: FC = () => <IconImage src={scoreIcon} />

/** An icon cut from the printed cards (reveal, Age token added, building level 1 or 2…), a bit larger as on the cards */
export const PrintedIcon: FC<{ src: string }> = ({ src }) => <IconImage src={src} size={1.5} />

/** The strength shield printed on the cards, with its value written on it */
export const StrengthIcon: FC<{ value: number | string }> = ({ value }) => (
  <IconBox>
    <img css={imageCss} src={strength} alt="" />
    <span css={[valueCss, shieldValueCss]}>{value}</span>
  </IconBox>
)

/** The Legend scroll of the cards, with its value written on it */
export const LegendValueIcon: FC<{ value: number }> = ({ value }) => (
  <IconBox>
    <img css={imageCss} src={scoreIcon} alt="" />
    <span css={[valueCss, legendValueCss]}>{value}</span>
  </IconBox>
)

/** The gold coin of the cards, with its value written on it */
export const GoldValueIcon: FC<{ value: number }> = ({ value }) => (
  <IconBox>
    <img css={imageCss} src={gold} alt="" />
    <span css={[valueCss, goldValueCss]}>{value}</span>
  </IconBox>
)

const boxCss = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  vertical-align: middle;
  /* vertical-align: middle sits on the x-height of the font: Mulish puts it lower than the middle of its letters */
  translate: 0 var(--icon-shift, 0);
  margin: -0.2em 0.05em;
`

/**
 * The box decides the size, the image keeps its ratio inside. The framework sizes the images of the help texts
 * (`p img { height: 1em; top: 0.1em }`, more specific): `&&` raises the specificity above it.
 */
const imageCss = css`
  && {
    display: block;
    position: static;
    width: 100%;
    height: 100%;
  }
  max-width: none;
  max-height: none;
  object-fit: contain;
`

const valueCss = css`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  line-height: 1;
`

const shieldValueCss = css`
  padding-bottom: 0.12em;
  color: #fff;
  font-size: 0.72em;
`

const legendValueCss = css`
  padding-left: 0.1em;
  color: #5a3414;
  font-size: 0.7em;
`

const goldValueCss = css`
  color: #4a3410;
  font-size: 0.72em;
`

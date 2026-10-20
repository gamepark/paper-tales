import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { useRules } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { FC } from 'react'
import gold from '../../images/tokens/Gold1.jpg'
import { getArtifactCost } from '../artifactCost'

/** The coin of the cost, in the style of the coin printed on the units; it fills its box, its number is in em of 1 cm */
export const CostCoin: FC<{ cost: number }> = ({ cost }) => (
  <div css={coinCss}>
    <span css={valueCss}>{cost}</span>
  </div>
)

/** The coin of a Legendary Artifact of my hand on the table (see ArtifactCostLocator) */
export const ArtifactCost: FC<{ location: Location }> = ({ location }) => {
  const rules = useRules<PaperTalesRules>()!
  const cost = getArtifactCost(rules, location.parent!)
  return cost === undefined ? null : <CostCoin cost={cost} />
}

const coinCss = css`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: url(${gold}) center / cover;
  box-shadow: 0 0.08em 0.15em #00000080;
`

const valueCss = css`
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.2em;
  line-height: 1;
  color: #3a2a12;
  /* The coin image has a number of its own: a disc of its gold hides it */
  padding: 0.1em 0.25em 0;
  border-radius: 50%;
  background: #f2c53d;
`

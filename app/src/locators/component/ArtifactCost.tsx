import { css } from '@emotion/react'
import { Artifact } from '@gamepark/paper-tales/material/Artifact'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { DeployCostHelper } from '@gamepark/paper-tales/rules/helpers/DeployCostHelper'
import { useRules } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { FC } from 'react'
import gold from '../../images/tokens/Gold1.jpg'

/** The coin over the seal of a Legendary Artifact of my hand, with what it would cost me now (see ArtifactCostLocator) */
export const ArtifactCost: FC<{ location: Location }> = ({ location }) => {
  const rules = useRules<PaperTalesRules>()!
  const artifact = rules.material(MaterialType.Unit).getItem<Artifact>(location.parent!)
  const owner = artifact.location.player
  if (owner === undefined || artifact.id === undefined) return null
  const cost = new DeployCostHelper(rules.game, owner).costOf(artifact.id)
  return (
    <div css={coinCss}>
      <span css={valueCss}>{cost}</span>
    </div>
  )
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

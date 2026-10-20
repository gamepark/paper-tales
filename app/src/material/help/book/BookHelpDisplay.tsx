import { css } from '@emotion/react'
import { DefaultHelpDisplay, MaterialHelpDisplayProps, useMaterialDescription, usePlayerId, useRules } from '@gamepark/react-game'
import { isArtifact } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { artifactCostLocations, artifactCostPosition, getArtifactCost } from '../../../locators/artifactCost'
import { CostCoin } from '../../../locators/component/ArtifactCost'
import { FC } from 'react'
import ageToken from '../../../images/tokens/Age.jpg'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { bookEm, pageFold, pageTurnCss } from '../../../theme/book'
import { paper } from '../../../theme/tableTheme'

/**
 * The left page of the story book: the item laid slightly askew, with its Age tokens, and the fold of the book as the
 * right edge of the page, so that it follows the width of the item (validated mockup docs/mockups/help-book.html).
 */
export const BookHelpDisplay: FC<MaterialHelpDisplayProps & { scale?: number; ageTokens?: boolean }> = ({ scale = 0.79, ageTokens = true, ...props }) => {
  const rules = useRules<PaperTalesRules>()
  const tokens = ageTokens && rules && props.itemIndex !== undefined ? new AgeTokens(rules).count(props.itemIndex) : 0
  const me = usePlayerId()
  // A Legendary Artifact of my hand shows its cost of the moment, as on the table (see ArtifactCostLocator)
  const inMyHand = isArtifact(props.item.id) && props.item.location?.player === me && artifactCostLocations.includes(props.item.location?.type as LocationType)
  const cost = inMyHand && rules && props.itemIndex !== undefined ? getArtifactCost(rules, props.itemIndex) : undefined
  return (
    <div css={pageCss}>
      <div key={props.itemIndex} css={[itemCss, pageTurnCss]} style={{ fontSize: `${scale / 2.13}em` }}>
        <DefaultHelpDisplay {...props} />
        {tokens > 0 && <img css={ageCss} src={ageToken} alt="" />}
        {cost !== undefined && (
          <div css={costCss}>
            <CostCoin cost={cost} />
          </div>
        )}
      </div>
    </div>
  )
}

/** The coin of the cost on the card drawn by the framework, at the place it has on the table (1 cm of the card: 75 / 14 em) */
const costCss = css`
  position: absolute;
  left: ${artifactCostPosition.x}%;
  top: ${artifactCostPosition.y}%;
  font-size: ${75 / 14}em;
  width: ${artifactCostPosition.size}em;
  height: ${artifactCostPosition.size}em;
  transform: translate(-50%, -50%) translateZ(1em);
`

/** The width of a token or a coin on its page, in em of the page */
const TOKEN_WIDTH = 14

/** The left page for a token, a coin or the turn counter: the item alone, drawn at the same width whatever its size */
export const TokenBookHelpDisplay: FC<MaterialHelpDisplayProps> = (props) => {
  const description = useMaterialDescription(props.itemType)
  const { width, height } = description?.getSize(props.item.id) ?? { width: 1, height: 1 }
  // The framework draws the item at min(75 / height, 75 / width, 10) em: bring it back to TOKEN_WIDTH
  const drawn = Math.min(75 / height, 75 / width, 10) * Math.max(width, height)
  return <BookHelpDisplay {...props} scale={(2.13 * TOKEN_WIDTH) / drawn} ageTokens={false} />
}

const pageCss = css`
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  font-size: ${bookEm(1)};
  padding: 2.4em 3.2em 3.4em 2.6em;
  background: linear-gradient(90deg, ${paper} calc(100% - 2.6em), ${pageFold} 100%);
  border-right: 1px solid #4a454040;
  border-radius: ${bookEm(0.2)} 0 0 ${bookEm(0.2)};
`

const itemCss = css`
  position: relative;
  rotate: -2.5deg;
`

const ageCss = css`
  position: absolute;
  width: 18.7%;
  right: 9.3%;
  top: 12.5%;
  border-radius: 50%;
  box-shadow: 0 0.2em 0.45em #0007;
  transform: rotate(8deg) translateZ(1em);
`

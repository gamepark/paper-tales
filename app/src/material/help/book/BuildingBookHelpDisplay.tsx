import { css } from '@emotion/react'
import { DefaultHelpDisplay, MaterialHelpDisplayProps } from '@gamepark/react-game'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { FC } from 'react'
import { bookEm, pageFold, pageTurnCss } from '../../../theme/book'
import { paper } from '../../../theme/tableTheme'

/**
 * The left page of the story book for a building: both faces, level 1 above, level 2 below, slightly askew (validated
 * mockup docs/mockups/help-book.html, Tavern). The fold is the right edge of the page.
 */
export const BuildingBookHelpDisplay: FC<MaterialHelpDisplayProps> = (props) => {
  // A built building shows the face the player has; the other one is faded
  const built = props.item.location?.type === LocationType.PlayerBuildingBoard
  const level2 = !!props.item.location?.rotation
  const face = (level2: boolean) => ({ ...props, item: { ...props.item, location: { ...props.item.location!, rotation: level2 } } })
  return (
    <div css={pageCss}>
      <div key={props.itemIndex} css={[facesCss, pageTurnCss]}>
        <div css={[faceCss, level1Css, built && level2 && fadedCss]}>
          <DefaultHelpDisplay {...face(false)} />
        </div>
        <div css={[faceCss, level2Css, built && !level2 && fadedCss]}>
          <DefaultHelpDisplay {...face(true)} />
        </div>
      </div>
    </div>
  )
}

const pageCss = css`
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  font-size: ${bookEm(1)};
  margin: -1.41em 0 -1.41em -1.41em;
  padding: 2.4em 3.2em 3.4em 2.6em;
  background: linear-gradient(90deg, ${paper} calc(100% - 2.6em), ${pageFold} 100%);
  border-right: 1px solid #4a454040;
`

/** Both faces in a column, the level 2 one shifted to the right, overlapping a little like in the mockup */
const facesCss = css`
  display: grid;
  gap: 0.4em;
`

/** The framework draws the card at 75 / 14 em: a quarter of it fits the page */
const faceCss = css`
  font-size: 0.235em;
`

const level1Css = css`
  rotate: -2.5deg;
`

const level2Css = css`
  margin: -1.4em 0 0 3.2em;
  rotate: 2.5deg;
`

const fadedCss = css`
  opacity: 0.35;
  filter: grayscale(0.6);
`

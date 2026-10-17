import { css } from '@emotion/react'
import { DefaultHelpDisplay, MaterialHelpDisplayProps, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import ageToken from '../../../images/tokens/Age.jpg'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { bookEm, pageFold } from '../../../theme/book'
import { paper } from '../../../theme/tableTheme'

/**
 * The left page of the story book: the item laid slightly askew, with its Age tokens, and the fold of the book as the
 * right edge of the page, so that it follows the width of the item (validated mockup docs/mockups/help-book.html).
 */
export const BookHelpDisplay: FC<MaterialHelpDisplayProps & { scale?: number }> = ({ scale = 0.79, ...props }) => {
  const rules = useRules<PaperTalesRules>()
  const ageTokens = rules && props.itemIndex !== undefined ? new AgeTokens(rules).count(props.itemIndex) : 0
  return (
    <div css={pageCss}>
      <div css={itemCss} style={{ fontSize: `${scale / 2.13}em` }}>
        <DefaultHelpDisplay {...props} />
        {ageTokens > 0 && <img css={ageCss} src={ageToken} alt="" />}
      </div>
    </div>
  )
}

/** The framework lays the item and the help in a row padded 3em 1em 3em 3em: the page covers that padding */
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

const itemCss = css`
  position: relative;
  transform: rotate(-2.5deg);
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

import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { bookBodyFont, pageTurnCss } from '../../../theme/book'
import { cutLine, rust, tornClip } from '../../../theme/tableTheme'

/** The right page of the story book: the name, the printed text, the facts, then the timeline and the live box */
export const BookPage: FC<{ name: ReactNode; lede?: ReactNode; facts?: ReactNode; children: ReactNode }> = ({ name, lede, facts, children }) => (
  <div css={[pageCss, pageTurnCss]}>
    <h3 css={nameCss}>{name}</h3>
    {lede}
    {facts}
    {children}
  </div>
)

const pageCss = css`
  --icon-shift: -0.15em;
  display: flex;
  flex-direction: column;
  /* Fills the page column (a flex column) without overflowing it: a min-height of 100% plus the padding of the column
     would leave a tiny scroll when the left page is the taller one */
  flex: 1 0 auto;
  font-family: ${bookBodyFont};
  font-weight: 500;
  line-height: 1.45;
  color: ${cutLine};
`

const nameCss = css`
  margin: 0;
  padding-right: 2.4em;
  font-family: 'Baloo 2', sans-serif;
  --icon-shift: 0;
  font-weight: 800;
  font-size: 2.1em;
  line-height: 1;

  &::after {
    content: '';
    display: block;
    width: 3.2em;
    height: 0.32em;
    margin-top: 0.3em;
    background: ${rust};
    clip-path: ${tornClip};
  }
`

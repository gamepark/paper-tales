import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { bookBodyFont } from '../../../theme/book'
import { cutLine, rust, tornClip } from '../../../theme/tableTheme'

/** The right page of the story book: the name, the printed text, the facts, then the timeline and the live box */
export const BookPage: FC<{ name: ReactNode; lede?: ReactNode; facts?: ReactNode; children: ReactNode }> = ({ name, lede, facts, children }) => (
  <div css={pageCss}>
    <h3 css={nameCss}>{name}</h3>
    {lede && <p css={ledeCss}>{lede}</p>}
    {facts && <p css={factsCss}>{facts}</p>}
    {children}
  </div>
)

const pageCss = css`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  font-family: ${bookBodyFont};
  font-weight: 500;
  line-height: 1.45;
  color: ${cutLine};
`

const nameCss = css`
  margin: 0;
  padding-right: 2.4em;
  font-family: 'Baloo 2', sans-serif;
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

const ledeCss = css`
  max-width: 34em;
  margin: 0.55em 0 0.15em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1.22em;
  line-height: 1.3;
  color: #4f4741;
`

const factsCss = css`
  margin: 0 0 0.6em;
  color: #7a6f67;
  font-weight: 700;
  font-size: 0.95em;
`

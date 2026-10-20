import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { bookBodyFont, pageTurnCss } from '../../../theme/book'
import { cutLine, paper, rust, tornClip } from '../../../theme/tableTheme'

/**
 * The right page of the story book: the name, the printed text, the facts, then the timeline and the live box. The
 * actions stand at the foot of the page, where they stay when the player turns the pages: the book keeps its height
 * and the actions stick to the bottom of the page while the text scrolls above them.
 */
export const BookPage: FC<{ name: ReactNode; lede?: ReactNode; facts?: ReactNode; actions?: ReactNode; children: ReactNode }> = ({
  name,
  lede,
  facts,
  actions,
  children
}) => (
  <div css={[pageCss, pageTurnCss]}>
    <h3 css={nameCss}>{name}</h3>
    {lede}
    {facts}
    <div css={bodyCss}>{children}</div>
    {actions && <div css={actionsCss}>{actions}</div>}
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

/** Fills the page, so that the live box can sit at its bottom (margin-top: auto) */
const bodyCss = css`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
`

/** On the paper of the page, so that the text scrolls under it; the padding of the page goes on below it */
const actionsCss = css`
  position: sticky;
  bottom: -3.2em;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6em 1em;
  /* The room of the fade above, so that at the end of the scroll it fades nothing of the text (the live box) */
  margin: 1.6em -0.6em -3.2em;
  padding: 0.9em 0.6em 3.2em;
  background: ${paper};

  /* The text that scrolls under the actions fades out instead of being cut */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    height: 1.6em;
    background: linear-gradient(transparent, ${paper});
    pointer-events: none;
  }
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

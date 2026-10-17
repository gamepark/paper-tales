import { css } from '@emotion/react'
import { pageFold } from './book'
import { cutLine, paper, tableButtonCss } from './tableTheme'

/** Width of the left page of the last page of the book, in em of the mockup (validated mockup, direction B) */
const leftPage = 21

/**
 * The end of the game is the last page of the story book: « Fin », the winner and the way back on the left page, the
 * score on the right page, the fold between them. The column of the framework (header, buttons, table) becomes a grid
 * of two pages, each part placed through its own theme option.
 */
export const resultContentCss = css`
  display: grid;
  grid-template-columns: ${leftPage}em 1fr;
  grid-template-rows: auto auto;
  align-content: center;
  row-gap: 1em;
  column-gap: 2.8em;
  margin: 0;
  padding: 2.1em 3.4em 3.2em 0;
  text-align: left;
  background: linear-gradient(90deg, ${paper} calc(${leftPage}em - 2.6em), ${pageFold} ${leftPage}em, ${paper} calc(${leftPage}em + 2.6em));
`

/** The result: « Fin », the winner, the text (see scoring/ResultPage.tsx) */
export const resultHeaderCss = css`
  grid-column: 1;
  grid-row: 1;
  align-self: end;
  margin: 0 0 0.9em;
  font-size: 1em;
`

/** The way back to Game Park, as the rust slips of the table */
export const resultButtonsCss = css`
  grid-column: 1;
  grid-row: 2;
  justify-content: center;

  > * {
    ${tableButtonCss};
    text-decoration: none;
  }
`

/** The score, on the right page */
export const resultTableCss = css`
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  color: ${cutLine};
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1.1em;

  > div {
    border-left: 0;
    background-color: transparent;
    text-align: center;
  }
`

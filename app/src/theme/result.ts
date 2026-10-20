import { css } from '@emotion/react'
import { coverMargin, pageFold } from './book'
import { cutLine, paper } from './tableTheme'

/**
 * Width of the left page of the last page of the book, from its edge to the fold, in em of the mockup (validated mockup,
 * direction B)
 */
const leftPage = 21
/** The outer margin of the left page, and the space left on each side of the fold */
const pageMargin = 2.2
const foldMargin = { left: 1.2, right: 2.8 }

/**
 * The result dialog sets its own padding over theme.dialog.container: the pages fill the cover again, as in the other
 * windows, so that the fold runs from the top of the book to its bottom.
 */
export const resultContainerCss = css`
  padding: ${coverMargin.side} ${coverMargin.side} ${coverMargin.bottom};
`

/**
 * The end of the game is the last page of the story book: « Fin », the winner and the way back on the left page, the
 * score on the right page, the fold between them. The column of the framework (header, buttons, table) becomes a grid
 * of two pages, each part placed through its own theme option. The left page has 4 rows: the result in the free
 * height, then the end of the tutorial and the rematch, which the grid lays in the next free rows of the left page
 * since they have no theme option, and the way back at the foot of the page, whatever the height of the score.
 */
export const resultContentCss = css`
  display: grid;
  grid-template-columns: ${leftPage - pageMargin - foldMargin.left}em 1fr;
  grid-template-rows: 1fr auto auto auto;
  column-gap: ${foldMargin.left + foldMargin.right}em;
  margin: 0;
  padding: 2.1em 3.4em 2.4em ${pageMargin}em;
  border-radius: 0.2em;
  text-align: center;
  background: linear-gradient(90deg, ${paper} calc(${leftPage}em - 2.6em), ${pageFold} ${leftPage}em, ${paper} calc(${leftPage}em + 2.6em));
`

/** The result: « Fin », the winner, the text (see scoring/ResultPage.tsx), in the middle of the free height */
export const resultHeaderCss = css`
  grid-column: 1;
  grid-row: 1;
  align-self: center;
  margin: 0 0 1em;
  font-size: 1em;
`

/** The way back to Game Park (and in a competitive game, play again and the ranking) at the foot of the page, one under
 * the other: the buttons of the dialogs, without their own margins */
export const resultButtonsCss = css`
  grid-column: 1;
  grid-row: -2;
  flex-direction: column;
  align-items: center;
  gap: 0.9em;
  margin-top: 1.2em;

  > * {
    margin: 0;
    font-size: 1.1em;
  }
`

/** The score, on the right page, along all the height of the left one */
export const resultTableCss = css`
  grid-column: 2;
  grid-row: 1 / -1;
  align-self: center;
  color: ${cutLine};
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1.1em;

  /* The cells stretch to the height of their row (the icons make it tall): their content is centred in it */
  > div {
    display: grid;
    align-content: center;
    border-left: 0;
    background-color: transparent;
    text-align: center;
  }
`

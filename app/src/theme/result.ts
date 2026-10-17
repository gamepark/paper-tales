import { css } from '@emotion/react'
import { pageFold } from './book'
import { cutLine, paper, tableButtonCss } from './tableTheme'

/** Width of the left page of the last page of the book, in em of the mockup (validated mockup, direction B) */
const leftPage = 21

/**
 * The end of the game is the last page of the story book: « Fin », the winner and the way back on the left page, the
 * score on the right page, the fold between them. The framework lays the result in a column (title, buttons, score
 * grid): the content becomes a grid of two pages.
 */
export const resultContainerCss = css`
  && > div {
    display: grid;
    grid-template-columns: ${leftPage}em 1fr;
    grid-template-rows: auto auto;
    align-content: center;
    row-gap: 1em;
    column-gap: 2.8em;
    margin: 0;
    padding: 2.1em 3.4em 3.2em 0;
    text-align: left;
    background: linear-gradient(
      90deg,
      ${paper} calc(${leftPage}em - 2.6em),
      ${pageFold} ${leftPage}em,
      ${paper} calc(${leftPage}em + 2.6em)
    );
  }

  && > div > * {
    grid-column: 1;
  }

  /* the result: « Fin », the winner, the text */
  && > div > h2 {
    grid-row: 1;
    align-self: end;
    margin: 0 0 0.9em;
    font-size: 1em;

    > span {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.9em;
      text-align: center;
    }

    [data-book-only] {
      display: grid;
    }

    [data-book-text] {
      font-family: 'Baloo 2', sans-serif;
      font-weight: 800;
      font-size: 1.35em;
      line-height: 1.2;
    }
  }

  /* the way back to Game Park, as the rust slips of the table */
  && > div > h2 + div {
    grid-row: 2;
    justify-content: center;

    > * {
      ${tableButtonCss};
      text-decoration: none;
    }
  }

  /* the score, on the right page */
  && > div > h2 + div + div {
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
  }
`

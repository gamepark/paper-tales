import { css, keyframes } from '@emotion/react'
import { coverTornClip, cutLine, paper, paperFont, paperMuted, rustDeep } from './tableTheme'

/**
 * The windows of the framework are the pages of the story book (validated mockup docs/mockups/help-book.html): a rust
 * cover torn very shallow, cream pages stacked on it. Cover and pages are drawn by pseudo-elements behind the content,
 * so that any dialog (help, confirmation, rules) gets the book without knowing it.
 */
export const pageFold = '#d9cabe'
export const bookBodyFont = "'Mulish', sans-serif"
export const crimson = '#9b2e4d'

/**
 * The mockup is drawn at 15px for 1em on a 1100px wide book; the dialog of the framework is about 8.2px for 1em on a
 * 1280px wide window. bookEm converts an em of the mockup to an em of the dialog.
 */
export const bookEm = (mockupEm: number) => `${+(mockupEm * 2.13).toFixed(2)}em`

/** The margin of the cover around the pages */
export const coverMargin = { side: bookEm(0.55), bottom: bookEm(0.9) }

export const bookContainerCss = css`
  padding: ${coverMargin.side} ${coverMargin.side} ${coverMargin.bottom};
  background: none;
  border-radius: 0;
  box-shadow: none;
  color: ${cutLine};
  isolation: isolate;
  filter: drop-shadow(${bookEm(0.16)} ${bookEm(0.2)} 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -2;
    background: ${rustDeep};
    clip-path: ${coverTornClip};
  }

  &::after {
    content: '';
    position: absolute;
    inset: ${coverMargin.side} ${coverMargin.side} ${coverMargin.bottom};
    z-index: -1;
    background: ${paper};
    border-radius: ${bookEm(0.2)};
    box-shadow:
      0 ${bookEm(0.18)} 0 ${paperMuted},
      0 ${bookEm(0.34)} 0 #cdbfb3;
  }

  h2 {
    font-family: ${paperFont};
    font-weight: 800;
  }
`

/** The row of a help dialog (item display, then help): the two pages touch, fill the book and carry their own margins */
export const bookHelpLayoutCss = css`
  /* The framework sets the padding of the help on this row, not on the window: the cover margin goes here */
  padding: ${coverMargin.side} ${coverMargin.side} ${coverMargin.bottom};
  gap: 0;
  align-items: stretch;
  /* A book keeps its size from page to page, so that the actions at the foot of the page stay where they are when the
     player turns the pages: the height of the framework's window with page arrows (85dvh, not stretched by its column),
     the same without them. A taller page scrolls instead */
  flex: none;
  height: 85dvh;
  box-sizing: border-box;
`

/** The right page: the help column of the framework becomes a page whose em is the em of the mockup, the fold on its left edge */
export const bookContentCss = css`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 2.1em 3.4em 3.2em 3em;
  /* Rounded on its outer side, like the left page on its own */
  border-radius: 0 ${bookEm(0.2)} ${bookEm(0.2)} 0;
  font-size: ${bookEm(1)};
  color: ${cutLine};
  background: linear-gradient(90deg, ${pageFold} 0, ${paper} 2.6em);
`

const pageTurn = keyframes`
  from {
    opacity: 0;
    transform: translateX(1.2em);
  }
`

/** A page that comes in when the corner of the book turns to another item */
export const pageTurnCss = css`
  animation: ${pageTurn} 0.3s ease-out;
`

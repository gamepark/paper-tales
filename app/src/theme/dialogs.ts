import { css } from '@emotion/react'
import { crimson, pageFold } from './book'
import { teal } from './journal'
import { cutLine, ochre, paper, paperMuted, rust, tableButtonCss } from './tableTheme'

/**
 * The message dialogs of the framework (give up, eject a player, full screen, bug report, failures, time stats): a
 * single page of the book, centred, three stars above the title, the buttons as the rust slips of the table (validated
 * mockup docs/mockups/theme.html, B). Each part goes through its theme hook: message, title, text, fields, buttons,
 * dangerButtons.
 */

/** The cover of a small page: thinner than the book of the help, and the page gets real margins. The bottom keeps the
 * stacked sheets of the page inside the cover. */
const cover = { side: '0.45em', bottom: '0.95em' }

export const dialogMessageCss = css`
  width: min(30em, 92dvw);
  padding: calc(${cover.side} + 1.5em) calc(${cover.side} + 2.2em) calc(${cover.bottom} + 1.7em);
  text-align: center;

  &::after {
    inset: ${cover.side} ${cover.side} ${cover.bottom};
    background: linear-gradient(90deg, ${pageFold} 0, ${paper} 1.2em);
    box-shadow:
      0 0.18em 0 ${paperMuted},
      0 0.36em 0 #cdbfb3;
  }
`

export const dialogTitleCss = css`
  margin: 0 0 0.7em;
  padding: 0;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.6em;
  line-height: 1.1;
  text-align: center;

  &::before {
    content: '✦ ✦ ✦';
    display: block;
    margin-bottom: 0.45em;
    color: ${rust};
    font-size: 0.55em;
    letter-spacing: 0.45em;
  }
`

export const dialogTextCss = css`
  margin: 0 0 1em;
  padding: 0;
  text-align: center;
  font-family: 'Mulish', sans-serif;
  font-weight: 500;
  font-size: 0.95em;
  line-height: 1.45;
  color: #5c534c;
`

/** After theme.menu.button in the framework: the leader and the full width of a menu entry are undone here */
export const dialogButtonCss = css`
  ${tableButtonCss};
  width: auto;
  margin: 1.1em 0.5em 0;
  padding: 0.4em 1.3em 0.3em;
  font-size: 1em;

  &::after {
    content: none;
  }

  /* A button that cannot be pressed yet: dull paper, flat on the page */
  &:disabled {
    opacity: 1;
    color: #4a454080;
    filter: none;

    &::before {
      background: ${paperMuted};
    }
  }
`

/** What calls for care (give up, eject): the same slip, in the crimson of the bookmarks */
export const dialogDangerButtonCss = css`
  &::before {
    background: ${crimson};
  }
`

/** The fields of the bug report: the white boxes of the rulebook, bordered in teal, like the message bar of the journal */
export const dialogFieldsCss = css`
  display: block;
  width: 100%;
  margin: 0 0 0.9em;
  padding: 0.6em 0.9em;
  border: 2px solid ${teal};
  border-radius: 0.6em;
  background: #fff;
  color: ${cutLine};
  font-family: 'Mulish', sans-serif;
  font-weight: 600;
  font-size: 0.95em;
  text-align: left;

  &::placeholder {
    color: #4a454099;
    opacity: 1;
  }

  &:focus-visible {
    outline: 0.12em dashed ${ochre};
    outline-offset: 0.15em;
  }

  option {
    background: #fff;
    color: ${cutLine};
  }
`

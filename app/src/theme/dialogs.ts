import { css } from '@emotion/react'
import { crimson } from './book'
import { teal } from './journal'
import { cutLine, ochre, rust, tableButtonCss } from './tableTheme'

/**
 * The message dialogs of the framework (give up, eject a player, full screen, bug report, failures): a single page of
 * the book, centred, three stars above the title, the buttons as the rust slips of the table (validated mockup
 * docs/mockups/theme.html, B). Each part goes through its theme hook: title, text, buttons, dangerButtons.
 */
export const dialogTitleCss = css`
  padding: 0.4em 0 0.3em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.45em;
  text-align: center;

  &::before {
    content: '✦ ✦ ✦';
    display: block;
    margin-bottom: 0.4em;
    color: ${rust};
    font-size: 0.6em;
    letter-spacing: 0.4em;
  }
`

export const dialogTextCss = css`
  padding: 0 0 0.6em;
  text-align: center;
  font-family: 'Mulish', sans-serif;
  font-weight: 500;
`

/** After theme.menu.button in the framework: the leader and the full width of a menu entry are undone here */
export const dialogButtonCss = css`
  ${tableButtonCss};
  width: auto;
  margin: 0.2em 0.4em;
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
      background: #d9cdc2;
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
  margin: 0.4em 0;
  padding: 0.5em 0.8em;
  border: 2px solid ${teal};
  border-radius: 0.6em;
  background: #fff;
  color: ${cutLine};
  font-family: 'Mulish', sans-serif;
  font-weight: 600;
  font-size: 0.9em;

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

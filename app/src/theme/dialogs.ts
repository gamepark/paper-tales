import { css } from '@emotion/react'
import { crimson } from './book'
import { rust, tableButtonCss } from './tableTheme'

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

export const dialogButtonCss = css`
  ${tableButtonCss};
  margin: 0.2em 0.4em;
  font-size: 1em;
`

/** What calls for care (give up, eject): the same slip, in the crimson of the bookmarks */
export const dialogDangerButtonCss = css`
  &::before {
    background: ${crimson};
  }
`

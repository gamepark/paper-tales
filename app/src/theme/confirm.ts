import { css } from '@emotion/react'
import { rust } from './tableTheme'
import { dialogButtonCss } from './menu'

/**
 * The dialogs made of a title, a few lines and buttons (give up, eject a player, full screen…): a single page of the
 * book, centred, three stars above the title, the buttons as rust slips (validated mockup docs/mockups/theme.html, B).
 * The help and result dialogs lay their content in their own column, so these direct children never match them.
 */
export const confirmDialogCss = css`
  > h2 {
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
  }

  > p {
    padding: 0 0 0.6em;
    text-align: center;
    font-family: 'Mulish', sans-serif;
    font-weight: 500;
  }

  /* The bookmark that closes the window and the page corners are buttons of the dialog too: left as they are */
  > button:not([data-bookmark]):not([data-page-corner]),
  > div > button:not([data-page-corner]) {
    ${dialogButtonCss};
  }
`

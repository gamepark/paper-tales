import { css } from '@emotion/react'
import { GameTheme } from '@gamepark/react-game'
import { tableButtonCss } from './tableTheme'

/**
 * The game theme of the framework: the buttons of the header (end the deployment, pass the construction) are the
 * rust paper slips of the table.
 */
export const theme: Partial<GameTheme> = {
  header: {
    buttons: css`
      ${tableButtonCss};
      font-size: 0.9em;
      margin: 0 0.2em;
      padding: 0.25em 0.9em 0.1em;
      text-decoration: none;
    `
  }
}

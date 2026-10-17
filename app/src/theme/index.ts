import { css } from '@emotion/react'
import { GameTheme } from '@gamepark/react-game'
import { bookContainerCss, bookContentCss } from './book'
import { BookmarkCloseButton } from './BookmarkCloseButton'
import { PageCornerNavigation } from './PageCornerNavigation'
import { resultContainerCss } from './result'
import { cutLine, paper, tableButtonCss } from './tableTheme'

/**
 * The game theme of the framework. The table is cut paper; the windows are the pages of the story book: a rust cover,
 * a bookmark to close, dog-eared corners to turn the pages. Buttons stay the rust paper slips of the table.
 */
export const theme: Partial<GameTheme> = {
  dialog: {
    backgroundColor: paper,
    color: cutLine,
    container: bookContainerCss,
    content: bookContentCss,
    closeButton: BookmarkCloseButton,
    navigation: PageCornerNavigation
  },
  result: {
    border: '#4a454055',
    icon: '#b5481f',
    container: resultContainerCss
  },
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

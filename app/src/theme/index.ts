import { css } from '@emotion/react'
import { GameTheme } from '@gamepark/react-game'
import { bookContainerCss, bookContentCss, bookHelpLayoutCss } from './book'
import { BookmarkCloseButton } from './BookmarkCloseButton'
import { dialogButtonCss, dialogDangerButtonCss, dialogFieldsCss, dialogMessageCss, dialogTextCss, dialogTitleCss } from './dialogs'
import { chatBarCss, historyEntryCss, tabCss, tabSelectedCss } from './journal'
import { journalPanelCss, mainButtonCss, menuEntryCss, menuPanelCss, popButtonCss } from './menu'
import { PageCornerNavigation } from './PageCornerNavigation'
import { resultButtonsCss, resultContentCss, resultHeaderCss, resultTableCss } from './result'
import { cutLine, paper, tableButtonCss } from './tableTheme'

/**
 * The game theme of the framework. The table is cut paper; the windows are the pages of the story book: a rust cover,
 * a bookmark to close, dog-eared corners to turn the pages. The menu is a table of contents, the journal a notebook,
 * the floating buttons bookmarks. Buttons stay the rust paper slips of the table.
 */
export const theme: Partial<GameTheme> = {
  dialog: {
    backgroundColor: paper,
    color: cutLine,
    container: bookContainerCss,
    helpLayout: bookHelpLayoutCss,
    content: bookContentCss,
    closeButton: BookmarkCloseButton,
    navigation: PageCornerNavigation,
    title: dialogTitleCss,
    text: dialogTextCss,
    buttons: dialogButtonCss,
    dangerButtons: dialogDangerButtonCss,
    fields: dialogFieldsCss,
    message: dialogMessageCss
  },
  menu: {
    panel: menuPanelCss,
    button: menuEntryCss,
    mainButton: mainButtonCss,
    popButton: popButtonCss
  },
  journal: {
    panel: journalPanelCss,
    tab: tabCss,
    tabSelected: tabSelectedCss,
    historyEntry: historyEntryCss,
    chatBar: chatBarCss
  },
  result: {
    border: '#4a454055',
    icon: '#b5481f',
    content: resultContentCss,
    header: resultHeaderCss,
    buttons: resultButtonsCss,
    table: resultTableCss
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

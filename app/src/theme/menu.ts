import { css } from '@emotion/react'
import { cutLine, paper, paperMuted, rust, rustDeep, tableButtonCss } from './tableTheme'

/** The bookmark hanging from the top edge of the screen (validated mockup docs/mockups/theme.html, direction B) */
const bookmarkClip = 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)'

/**
 * The floating buttons of the framework (menu on the right, journal on the left): bookmarks of rust paper hanging from
 * the top of the page, a little longer under the pointer. The ribbon is drawn by ::before so that its shadow follows
 * its shape.
 */
export const mainButtonCss = css`
  width: 2.5em;
  height: 3.2em;
  align-items: flex-start;
  padding-top: 0.55em;
  border-radius: 0;
  background: none;
  color: ${paper};
  box-shadow: none;
  isolation: isolate;
  filter: drop-shadow(0.1em 0.12em 0 #00000059);
  transition: height 0.15s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${rust};
    clip-path: ${bookmarkClip};
    transition: background 0.15s;
  }

  &:focus,
  &:hover {
    height: 3.6em;
    background: none;

    &::before {
      background: ${rustDeep};
    }
  }

  &:active {
    background: none;
  }

  svg {
    width: 60%;
    height: 50%;
    fill: ${paper};
    color: ${paper};
  }
`

/** The buttons that pop out beside the menu (undo, full screen, result): smaller bookmarks of pale paper */
export const popButtonCss = css`
  ${mainButtonCss};
  height: 2.9em;
  color: ${rust};

  &::before {
    background: ${paper};
  }

  &:focus,
  &:hover {
    height: 3.2em;

    &::before {
      background: ${paperMuted};
    }
  }

  svg {
    fill: ${rust};
    color: ${rust};
  }
`

/**
 * The side panels of the framework, the menu and the journal: a page of the story book, bound on its outer edge. The
 * menu is laid out as a table of contents: each entry on its own line, a dotted leader, the icon where the page number
 * would be. The journal (told from the menu by its tabs, without a title) keeps the page bare: its parts are themed
 * one by one (tabs, entries).
 */
export const panelCss = css`
  background: ${paper};
  color: ${cutLine};
  box-shadow:
    0 0.18em 0 ${paperMuted},
    0 0.34em 0 #cdbfb3;

  &:has(> h2) {
    && {
      padding: 1.6em 1.8em 1.7em;
    }
    width: 23em;
    border-left: 0.4em solid ${rustDeep};
    border-bottom: 0.4em solid ${rustDeep};
    border-radius: 0 0 0 0.3em;

    > h2 {
      align-self: center;
      margin: 0 0 0.7em;
      font-family: 'Baloo 2', sans-serif;
      font-weight: 800;
      font-size: 1.5em;
      color: ${cutLine};
    }

    /* Not the rust slips of the dialogs: plain lines of a table of contents */
    > button {
      display: flex;
      align-items: baseline;
      justify-content: flex-start;
      gap: 0.4em;
      width: 100%;
      margin: 0;
      padding: 0.38em 0;
      border: 0;
      border-radius: 0;
      background: none;
      color: ${cutLine};
      font-family: 'Baloo 2', sans-serif;
      font-weight: 600;
      font-size: 1.08em;
      letter-spacing: 0;
      text-align: left;
      white-space: normal;
      filter: none;
      transform: none;
      cursor: pointer;

      &::before {
        content: none;
      }

      &::after {
        content: '';
        order: 2;
        flex: 1;
        border-bottom: 2px dotted #4a454066;
        transform: translateY(-0.25em);
      }

      > svg {
        order: 3;
        flex: none;
        width: 1.4em;
        margin: 0;
        color: ${rust};
        fill: ${rust};
      }

      &:focus,
      &:hover {
        background: none;
        color: ${rust};
      }

      &:disabled {
        color: ${cutLine};
        opacity: 0.45;
        cursor: default;
      }
    }
  }

  &:not(:has(> h2)) {
    border-right: 0.4em solid ${rustDeep};
    border-bottom: 0.4em solid ${rustDeep};
    border-radius: 0 0 0.3em 0;

    /* The red margin line of the notebook */
    &::before {
      content: '';
      position: absolute;
      top: 3em;
      bottom: 0;
      left: 1.4em;
      width: 1.5px;
      background: #b5481f66;
      pointer-events: none;
    }

    /* The strip the index tabs stand on */
    > div:first-of-type {
      align-items: flex-end;
      padding-bottom: 0;
      background: ${rustDeep};
    }
  }
`

/** The buttons of the dialogs the menu opens (give up, eject, full screen…): the rust slips of the table */
export const dialogButtonCss = css`
  ${tableButtonCss};
  margin: 0.2em 0.4em;
  font-size: 1em;
`

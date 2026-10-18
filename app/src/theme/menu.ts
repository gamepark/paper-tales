import { css } from '@emotion/react'
import { coverTornClip, cutLine, paper, paperMuted, rust, rustDeep } from './tableTheme'

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

/** The cover of a side panel: as thin as the one of the small pages, torn on its free edges only */
const cover = { side: '0.5em', bottom: '0.95em' }

/**
 * A side panel of the framework (the menu, the journal) as a page of the story book bound on the edge of the screen:
 * the rust cover torn on its free edges (it runs past the screen on the others), the cream page set on it. Both
 * panels share this; each adds its own padding and page.
 */
const panelCss = (bound: 'left' | 'right') => css`
  background: none;
  color: ${cutLine};
  border: 0;
  border-radius: 0;
  box-shadow: none;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: ${bound === 'right' ? '-2em -2em 0 0' : '-2em 0 0 -2em'};
    z-index: -2;
    background: ${rustDeep};
    clip-path: ${coverTornClip};
  }

  &::after {
    content: '';
    position: absolute;
    inset: ${bound === 'right' ? `${cover.side} 0 ${cover.bottom} ${cover.side}` : `${cover.side} ${cover.side} ${cover.bottom} 0`};
    z-index: -1;
    background: ${paper};
    border-radius: ${bound === 'right' ? '0 0 0 0.2em' : '0 0 0.2em 0'};
    box-shadow:
      0 0.18em 0 ${paperMuted},
      0 0.36em 0 #cdbfb3;
  }
`

/**
 * The menu: a table of contents. Each entry on its own line, a dotted leader, the icon where the page number would be
 * (the entries themselves are {@link menuEntryCss}, through theme.menu.button).
 */
export const menuPanelCss = css`
  ${panelCss('right')};
  width: 23em;
  padding: calc(${cover.side} + 1.4em) 1.8em calc(${cover.bottom} + 1.5em) calc(${cover.side} + 1.8em);

  > h2 {
    align-self: center;
    margin: 0 0 0.7em;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 800;
    font-size: 1.5em;
    color: ${cutLine};
  }
`

/** The journal: a page of the rulebook, with its chevron pattern (validated mockup docs/mockups/journal3.html) */
export const journalPanelCss = css`
  ${panelCss('left')};
  padding: ${cover.side} ${cover.side} ${cover.bottom} 0;

  &::after {
    background-color: #f4efe7;
    background-image:
      linear-gradient(135deg, #ffffff66 25%, transparent 25%),
      linear-gradient(225deg, #ffffff66 25%, transparent 25%),
      linear-gradient(45deg, #e6dfd466 25%, transparent 25%),
      linear-gradient(315deg, #e6dfd466 25%, transparent 25%);
    background-size: 3em 3em;
  }

  > div:first-of-type {
    padding-top: 0.7em;
    padding-bottom: 0.4em;
  }
`

/**
 * An entry of the menu: a line of the table of contents, the label, a dotted leader, the icon where the page number
 * would be. Through theme.menu.button; the buttons of the dialogs have their own hook, theme.dialog.buttons.
 */
export const menuEntryCss = css`
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
  text-align: left;
  cursor: pointer;

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
`

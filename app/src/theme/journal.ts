import { css } from '@emotion/react'
import { cutLine } from './tableTheme'

/** The teal of the rulebook boxes and arrows */
export const teal = '#2a7f86'

/**
 * The tabs of the journal (chat, history): the arrow banners of the rulebook, teal for the open one, faded paper for
 * the other (validated mockup docs/mockups/journal3.html).
 */
export const tabCss = css`
  flex: 0 0 auto;
  height: auto;
  margin: 0 0.1em;
  padding: 0.35em 1.7em 0.25em 1em;
  border: 0;
  border-radius: 0.2em 0 0 0.2em;
  background: #b9ad9f;
  color: #ffffffe6;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.8em;
  clip-path: polygon(0 0, calc(100% - 0.8em) 0, 100% 50%, calc(100% - 0.8em) 100%, 0 100%);
  cursor: pointer;
`

export const tabSelectedCss = css`
  background: ${teal};
  color: #fff;
`

/** One event of the journal: a line of the rulebook page. The Monarch, when there is one, is drawn by the entry itself */
export const historyEntryCss = css`
  color: ${cutLine};
  /* Each line on a light slip of the page paper, a little apart from the next one, so that it reads at a glance */
  margin: 0.25em 0.7em 0 0.6em;
  width: auto;
  padding: 0.3em 0.6em 0.3em 0.4em;
  border-radius: 0.3em;
  background: #ffffff8c;
  box-shadow: 0 0.04em 0.08em #4a454026;
  font-family: 'Mulish', sans-serif;
  font-weight: 500;
  font-size: 1.5em;
  line-height: 1.35;
`

/** Where a message is typed: the white box of the rulebook, bordered in teal */
export const chatBarCss = css`
  align-items: center;
  gap: 0.5em;
  margin: 0.6em 1em 0.8em 1.1em;
  width: auto;
  padding: 0.35em 0.5em 0.35em 0.9em;
  border: 2px solid ${teal};
  border-radius: 0.6em;
  background: #fff;

  > input {
    padding: 0.1em 0;
    border-radius: 0;
    background: none;
    color: ${cutLine};
    font-family: 'Mulish', sans-serif;
    font-weight: 600;

    &::placeholder {
      color: #4a454099;
    }
  }

  > button {
    color: ${teal};
    font-size: 1.2em;
  }
`

import { css } from '@emotion/react'
import { cutLine, paper, paperMuted, rust } from './tableTheme'

/**
 * The tabs of the journal (chat, history): index tabs cut in paper, standing on the strip at the top of the page; the
 * open one is of the same paper as the page and a little taller (validated mockup docs/mockups/theme.html, B).
 */
export const tabCss = css`
  flex: 0 0 auto;
  height: auto;
  margin: 0.3em 0.1em 0;
  padding: 0.4em 1.3em 0.3em;
  border: 0;
  border-radius: 0;
  background: ${paperMuted};
  color: #4a4540b3;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.8em;
  clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%);

  > div {
    transform: translateY(0.05em);
  }
`

export const tabSelectedCss = css`
  margin-top: 0;
  padding-bottom: 0.5em;
  background: ${paper};
  color: ${cutLine};
`

/** One line of the notebook: no dark box, a ruled line under each entry, the ink of the book */
export const historyEntryCss = css`
  background: none;
  color: ${cutLine};
  border-radius: 0;
  border-bottom: 1.5px solid #4a454026;
  padding: 0.3em 0.5em 0.3em 1.4em;
  font-family: 'Mulish', sans-serif;
  font-weight: 500;
  font-size: 1.5em;
  line-height: 1.3;
`

/** The last line of the notebook, where the discussion is written: a rule of ink above, the pen in rust */
export const chatBarCss = css`
  align-items: center;
  gap: 0.6em;
  margin: 0 1em 0.6em 2.2em;
  width: auto;
  padding: 0.55em 0 0;
  border-top: 2px solid ${cutLine};
  background: none;

  > input {
    padding: 0.2em 0;
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
    color: ${rust};
    font-size: 1.25em;
  }
`

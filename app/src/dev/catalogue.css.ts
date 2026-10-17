import { css } from '@emotion/react'
import { cutLine, paperMuted, rust, tornClip } from '../theme/tableTheme'

/** Styles of the cards catalogue (development only): a list of cards, each with its image and everything the code knows about it */
export const dialogCss = css`
  width: 92vw;
  height: 88vh;
  font-size: 2em;
`

export const headerCss = css`
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.8em 1.2em 0.4em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.95em;

  > h2 {
    margin: 0 auto 0 0;
    font-size: 1.4em;
  }
`

export const toggleCss = css`
  display: inline-flex;
  padding: 0.1em;
  border-radius: 0.4em;
  background: ${paperMuted};

  > button {
    border: 0;
    padding: 0.15em 0.7em;
    border-radius: 0.3em;
    background: none;
    font: inherit;
    font-weight: 700;
    color: ${cutLine};
    cursor: pointer;

    &[data-active='true'] {
      background: ${rust};
      color: #fff6ef;
    }
  }
`

export const summaryCss = css`
  margin: 0 1.2em 0.4em;
  font-size: 0.8em;

  &[data-ok='true'] {
    color: #2a7a4a;
  }

  &[data-ok='false'] {
    color: ${rust};
  }
`

export const listCss = css`
  height: calc(100% - 4.4em);
  overflow-y: auto;
  padding: 0 1.2em 1em;
  display: grid;
  gap: 0.6em;
  font-size: 0.75em;
`

export const entryCss = css`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8em;
  padding: 0.6em 0.8em;
  background: #fffaf6;
  border-radius: 0.3em;
  box-shadow: 0 0.1em 0 ${paperMuted};

  &[data-issues='true'] {
    outline: 0.12em solid ${rust};
  }
`

export const imagesCss = css`
  display: flex;
  flex-direction: column;
  gap: 0.4em;

  &[data-row] {
    flex-direction: row;
  }

  > img {
    display: block;
    height: 12em;
    border-radius: 0.3em;
    box-shadow: 0 0.15em 0.4em #0004;
  }
`

export const titleCss = css`
  display: flex;
  align-items: baseline;
  gap: 0.6em;
  margin: 0 0 0.3em;
  font-family: 'Baloo 2', sans-serif;

  > b {
    font-size: 1.3em;
    font-weight: 800;
  }

  > code {
    font-size: 0.85em;
    color: #7a6f67;
  }
`

export const tagsCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin-bottom: 0.4em;

  > span {
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    padding: 0.15em 0.7em 0.1em;
    font-family: 'Baloo 2', sans-serif;
    font-weight: 700;
    white-space: nowrap;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background: ${paperMuted};
      clip-path: ${tornClip};
    }
  }
`

export const linesCss = css`
  display: grid;
  gap: 0.25em;
  margin: 0;
  padding: 0;
  list-style: none;

  > li {
    display: grid;
    grid-template-columns: 2em 1fr;
    align-items: center;
    gap: 0.5em;
  }
`

export const phaseIconCss = css`
  width: 2em;
`

export const printedCss = css`
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  --icon-shift: 0;
`

export const codeCss = css`
  display: block;
  font-family: monospace;
  font-size: 0.8em;
  color: #7a6f67;
`

export const issueCss = css`
  display: block;
  font-weight: 700;
  color: ${rust};
`

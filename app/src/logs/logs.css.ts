import { css } from '@emotion/react'
import { rust } from '../theme/tableTheme'

/**
 * The heading of a turn: the open book of the turn counter and its number, in rust (mockup docs/mockups/journal3.html),
 * 1.3 times the size of the lines (1.5em, see historyEntryCss)
 */
export const turnLogCss = css`
  padding-top: 0.5em;
  /* A heading, not a line: no slip of paper behind it */
  &&& {
    background: none;
    box-shadow: none;
  }

  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.95em;
  color: ${rust};
`

export const turnBookCss = css`
  height: 1.9em;
  margin-right: 0.5em;
  vertical-align: middle;
`

/** A phase of the turn: the arrow banner of the rulebook, with the icon of the phase */
export const phaseLogCss = css`
  padding-top: 0.5em;
  /* A heading, not a line: no slip of paper behind it */
  &&& {
    background: none;
    box-shadow: none;
  }

`

export const phaseBannerCss = (color: string) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  padding: 0.15em 1em 0.1em 0.4em;
  border-radius: 0.15em 0 0 0.15em;
  background: ${color};
  color: #fff;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.95em;
  clip-path: polygon(0 0, calc(100% - 0.7em) 0, 100% 50%, calc(100% - 0.7em) 100%, 0 100%);

  > img {
    height: 1.5em;
  }
`

/** An aside under a banner: the strengths before the wars */
export const asideCss = css`
  display: block;
  margin-top: 0.3em;
  font-style: italic;
  color: #6b6058;
  font-size: 0.92em;
`

/** The Monarch an event concerns: their avatar ringed with their colour, their name in their colour */
export const whoCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  vertical-align: middle;
`

/**
 * The avatar on a disc of the Monarch's colour, its head over the rim: the avatar draws its own disc (a light grey rim,
 * a blue background) with the head above it, so that disc is painted in the Monarch's colour (a CSS fill wins over the
 * fill attribute of the SVG)
 */
export const whoAvatarCss = (color: string) => css`
  position: relative;
  flex: none;
  width: 2.1em;
  height: 2.1em;
  box-shadow: none;

  svg [fill='#E6E6E6'],
  svg [fill='#65C9FF'] {
    fill: ${color};
  }
`

export const whoNameCss = (color: string) => css`
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  color: ${color};
`

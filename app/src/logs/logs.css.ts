import { css } from '@emotion/react'
import { rust } from '../theme/tableTheme'

/** The heading of a turn: the open book of the turn counter and its number, in rust (mockup docs/mockups/journal3.html) */
export const turnLogCss = css`
  padding-top: 0.5em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.3em;
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

export const whoAvatarCss = (color: string) => css`
  position: relative;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  overflow: hidden;
  box-shadow:
    0 0 0 0.16em ${color},
    0 0.1em 0.15em #0005;
`

export const whoNameCss = (color: string) => css`
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  color: ${color};
`

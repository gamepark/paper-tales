import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'

/** A line header: the icon, then the name of the line beside it in a small caption */
export const ScoringHeader: FC<{ icon: ReactNode; strong?: boolean; muted?: boolean; children: ReactNode }> = ({ icon, strong, muted, children }) => (
  <span css={[headerCss, strong && totalCss, muted && mutedCss]}>
    <span css={iconCss}>{icon}</span>
    <span>{children}</span>
  </span>
)

const headerCss = css`
  display: flex;
  justify-content: flex-start;
  text-align: left;
  align-items: center;
  gap: 0.5em;
`

const iconCss = css`
  display: inline-grid;
  place-items: center;
  width: 1.8em;
  height: 1.8em;
  flex-shrink: 0;

  svg {
    width: 1.8em;
    height: 1.8em;
  }
`

const totalCss = css`
  font-weight: 800;
`

const mutedCss = css`
  font-style: italic;
  opacity: 0.75;
`

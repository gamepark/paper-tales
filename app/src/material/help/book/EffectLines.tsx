import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'

/** The printed effects of one phase, one per line, in the font of the cards */
export const EffectLines: FC<{ lines: ReactNode[] }> = ({ lines }) => (
  <>
    {lines.map((line, index) => (
      <span key={index} css={effectLineCss}>
        {line}
      </span>
    ))}
  </>
)

const effectLineCss = css`
  display: block;
  font-family: 'Baloo 2', sans-serif;
  --icon-shift: 0;
  font-weight: 600;
  font-size: 1.05em;
  line-height: 1.3;
`

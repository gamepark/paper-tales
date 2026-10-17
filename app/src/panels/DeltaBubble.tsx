import { css, keyframes } from '@emotion/react'
import { FC } from 'react'
import { cutLine, paper, paperCss, rust } from '../theme/tableTheme'
import { ValueDelta } from './useValueDelta'

/**
 * A gain or a loss, on a little slip of paper that rises from the counter then fades: rust for a gain, ink for a loss
 */
export const DeltaBubble: FC<{ delta: ValueDelta | null }> = ({ delta }) => {
  if (!delta) return null
  const gain = delta.amount > 0
  return (
    <span key={delta.id} css={[gain ? gainCss : lossCss, bubbleCss]}>
      {gain ? `+${delta.amount}` : delta.amount}
    </span>
  )
}

const rise = keyframes`
  0% { opacity: 0; transform: translate(-50%, 0.3em) scale(0.6); }
  15% { opacity: 1; transform: translate(-50%, -0.2em) scale(1.15); }
  30% { transform: translate(-50%, -0.35em) scale(1); }
  80% { opacity: 1; transform: translate(-50%, -0.6em); }
  100% { opacity: 0; transform: translate(-50%, -0.9em); }
`

const gainCss = paperCss(rust, paper)
const lossCss = paperCss(cutLine, paper)

const bubbleCss = css`
  position: absolute;
  left: 50%;
  bottom: 70%;
  z-index: 3;
  padding: 0.12em 0.5em 0.02em;
  font-size: 1.1em;
  pointer-events: none;
  animation: ${rise} 1.8s ease-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translate(-50%, -0.4em);
  }
`

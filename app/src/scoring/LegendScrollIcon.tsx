import { css } from '@emotion/react'
import { FC, useId } from 'react'
import legend from '../images/icons/legend.webp'

/**
 * The Legend point scroll printed on the cards, outlined exactly like the paper icons beside it (PaperIcons): the
 * same 54-unit box, a white cut fringe 1.3 units wide around the drawing, then the dark line out to 3 units. The
 * outline grows from the shape of the image, so it stays round like the strokes of the other icons.
 */
export const LegendScrollIcon: FC = () => {
  // useId gives :r0:-like ids, which a url() reference does not accept
  const filterId = useId().replace(/:/g, '')
  return (
    <svg viewBox="-3 -3 54 54" css={iconCss} aria-hidden>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="outer" />
          <feFlood floodColor="#2e2a26" />
          <feComposite in2="outer" operator="in" result="line" />
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="inner" />
          <feFlood floodColor="#fffdf8" />
          <feComposite in2="inner" operator="in" result="fringe" />
          <feMerge>
            <feMergeNode in="line" />
            <feMergeNode in="fringe" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <image href={legend} x="6" y="5" width="36" height="38" preserveAspectRatio="xMidYMid meet" filter={`url(#${filterId})`} />
    </svg>
  )
}

const iconCss = css`
  width: 1.7em;
  height: 1.7em;
  overflow: visible;
  pointer-events: none;
`

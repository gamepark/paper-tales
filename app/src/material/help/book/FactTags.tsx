import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { paperMuted, tornClip } from '../../../theme/tableTheme'

/** A fact printed on a card: a label, an icon, a value */
export type FactTag = { label: ReactNode; icon?: ReactNode; value?: ReactNode; /** How the value is computed, in small italics after it */ note?: ReactNode }

/** The facts printed on a card, each on its own torn tag: an icon and a value */
export const FactTags: FC<{ tags: FactTag[] }> = ({ tags }) => (
  <div css={rowCss}>
    {tags.map((tag, index) => (
      <span key={index} css={tagCss}>
        <span css={labelCss}>{tag.label}</span>
        {tag.icon}
        {tag.value !== undefined && <span>{tag.value}</span>}
        {tag.note && <span css={noteCss}>{tag.note}</span>}
      </span>
    ))}
  </div>
)

const rowCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 0.2em 0 0.8em;
`

const labelCss = css`
  font-weight: 600;
  color: #6b6058;
`

const noteCss = css`
  font-family: 'Mulish', sans-serif;
  font-style: italic;
  font-weight: 500;
  font-size: 0.85em;
  color: #6b6058;
`

const tagCss = css`
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.25em 0.9em 0.2em;
  font-family: 'Baloo 2', sans-serif;
  --icon-shift: 0;
  font-weight: 800;
  font-size: 0.95em;
  line-height: 1.25;
  white-space: nowrap;
  filter: drop-shadow(0.12em 0.15em 0 #00000040);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paperMuted};
    clip-path: ${tornClip};
  }
`

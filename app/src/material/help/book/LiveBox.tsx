import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { bookSheetClip, cutLine, ochre, paper } from '../../../theme/tableTheme'

/** The dark sheet at the bottom of the right page: what concerns the player now */
export const LiveBox: FC<{ title: ReactNode; lines: ReactNode[]; children?: ReactNode }> = ({ title, lines, children }) => (
  <div css={liveCss}>
    <h4 css={titleCss}>{title}</h4>
    <ul css={listCss}>
      {lines.map((line, index) => (
        <li key={index}>
          <span>{line}</span>
        </li>
      ))}
    </ul>
    {children && <div css={actionCss}>{children}</div>}
  </div>
)

const liveCss = css`
  position: relative;
  isolation: isolate;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);
  margin-top: auto;
  padding: 0.9em 1.4em 0.85em;
  color: ${paper};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${cutLine};
    clip-path: ${bookSheetClip};
  }
`

const titleCss = css`
  margin: 0 0 0.3em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.08em;
  color: ${ochre};
`

const listCss = css`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.25em;

  > li {
    display: flex;
    gap: 0.6em;
    align-items: baseline;

    &::before {
      content: '';
      flex: none;
      width: 0.45em;
      height: 0.45em;
      border-radius: 50%;
      background: ${ochre};
      transform: translateY(-0.1em);
    }
  }
`

const actionCss = css`
  margin-top: 0.7em;
`

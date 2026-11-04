import { css, Interpolation, Theme } from '@emotion/react'
import { FC, ReactNode } from 'react'
import gold from '../images/icons/gold-token.webp'
import legend from '../images/icons/legend.webp'
import { cutLine, paper, paperFont, receiptTornClip, rustDeep } from '../theme/tableTheme'
import { beatCss } from './warPace'

/** A line of a receipt: what it is for, and the Legend points and the gold it brings */
export type ReceiptLine = { label: ReactNode; score?: number; gold?: number }

type ReceiptProps = {
  title: ReactNode
  lines: ReceiptLine[]
  /** The total, under a dashed line: shown when there are several lines */
  total?: ReceiptLine
  /** When the lines come in, one after the other, in seconds from the moment the receipt comes in: at once when none */
  lineDelays?: (index: number) => number
  css?: Interpolation<Theme>
}

/**
 * A receipt on a slip of paper torn shallow on every side, like the one of a construction (see BuildPaymentBill): what
 * a Monarch gains, line by line
 */
export const Receipt: FC<ReceiptProps> = ({ title, lines, total, lineDelays, ...props }) => (
  <div css={receiptCss} {...props}>
    <span css={titleCss}>{title}</span>
    {lines.map((line, index) => (
      <Line key={index} line={line} css={lineDelays && beatCss(lineDelays(index))} />
    ))}
    {total && lines.length > 1 && <Line line={total} css={[totalCss, lineDelays && beatCss(lineDelays(lines.length))]} />}
  </div>
)

const Line: FC<{ line: ReceiptLine; css?: Interpolation<Theme> }> = ({ line, ...props }) => (
  <span css={lineCss} {...props}>
    <span css={labelCss}>{line.label}</span>
    <span css={amountsCss}>
      {line.score !== undefined && <Amount value={line.score} icon={legend} />}
      {!!line.gold && <Amount value={line.gold} icon={gold} />}
    </span>
  </span>
)

/** An amount and what it is (a Legend point, a gold coin), centred on each other */
export const Amount: FC<{ value: number; icon: string }> = ({ value, icon }) => (
  <span css={amountCss}>
    {value < 0 ? `−${-value}` : `+${value}`}
    <img src={icon} alt="" />
  </span>
)

const receiptCss = css`
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  box-sizing: border-box;
  width: 15.5em;
  padding: 0.8em 1.1em 0.8em;
  color: ${cutLine};
  font-family: Mulish, ${paperFont};
  font-weight: 500;
  line-height: 1.3;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paper};
    clip-path: ${receiptTornClip};
  }
`

const titleCss = css`
  margin-bottom: 0.15em;
  font-family: ${paperFont};
  font-weight: 800;
  font-size: 1.25em;
  line-height: 1.1;
  color: ${rustDeep};
  overflow-wrap: anywhere;
`

const lineCss = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6em;
`

/** A long word (the name of a player) breaks inside the slip: the amounts stay in it */
const labelCss = css`
  min-width: 0;
  overflow-wrap: anywhere;
`

const totalCss = css`
  margin-top: 0.15em;
  padding-top: 0.35em;
  border-top: 0.12em dashed ${cutLine}66;
`

const amountsCss = css`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
`

/** The digits of Baloo sit high in their line: the number gets a line box of its own size, so that the centres match */
const amountCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.15em;
  white-space: nowrap;
  font-family: ${paperFont};
  font-weight: 800;
  font-size: 1.15em;
  line-height: 1;
  padding-top: 0.12em;

  img {
    height: 1.1em;
    margin-top: -0.12em;
    object-fit: contain;
  }
`

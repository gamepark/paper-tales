import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { bookSheetClip, cutLine, paper, paperMuted } from '../../../theme/tableTheme'
import { LegendIcon } from './HelpIcons'
import { phaseIcons } from './phaseIcons'

/** One step of the turn: the 6 phases, then the end of the game (index 6) */
export type TimelineStep = {
  /** The card acts at this step: the row is on light paper */
  on?: boolean
  text?: ReactNode
  /** What happens to the player now, in rust */
  you?: ReactNode
}

/**
 * The life of the item over a turn (validated mockup docs/mockups/help-book.html): the 6 phases in order with their
 * official icon, the ones where it acts on paper, the current phase marked.
 */
export const PhaseTimeline: FC<{ steps: TimelineStep[]; current?: number }> = ({ steps, current }) => {
  const { t } = useTranslation()
  const names = [
    t('phase.1', 'Recruitment'),
    t('phase.2', 'Deployment'),
    t('phase.3', 'Wars'),
    t('phase.4', 'Income'),
    t('phase.5', 'Construction'),
    t('phase.6', 'Aging'),
    t('phase.end', 'End')
  ]
  return (
    <div css={timelineCss}>
      {steps.map((step, index) => (
        <div key={index} css={[stepCss, step.on && onCss]}>
          <span css={[phaseCss, !step.on && current !== index && offCss]}>{index < 6 ? <img src={phaseIcons[index]} alt="" /> : <LegendIcon />}</span>
          <span css={[nameCss, step.on && nameOnCss]}>
            {names[index]}
            {current === index && <span css={nowCss}>{t('phase.now', 'now')}</span>}
          </span>
          <span css={[textCss, step.on && textOnCss]}>
            {step.text}
            {step.you && <span css={youCss}>{step.you}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

const timelineCss = css`
  position: relative;
  display: grid;
  gap: 0.15em;

  &::before {
    content: '';
    position: absolute;
    left: calc(1.7em - 0.09em);
    top: 0.6em;
    bottom: 0.6em;
    width: 0.18em;
    background: ${paperMuted};
  }
`

const stepCss = css`
  position: relative;
  display: grid;
  grid-template-columns: 3.4em 8.3em 1fr;
  align-items: center;
  min-height: 1.6em;
  padding: 0.05em 0.9em 0.05em 0;
  color: #a59a91;
`

const onCss = css`
  isolation: isolate;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);
  padding: 0.45em 1.1em 0.4em 0;
  margin: 0.12em 0;
  color: ${cutLine};

  /* the sheet already hides the line */
  > span:first-of-type {
    background: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 0 0.2em;
    z-index: -1;
    background: #fffaf6;
    clip-path: ${bookSheetClip};
  }
`

/** The icon sits on paper, so that the line of the timeline never shows through its transparent parts */
const phaseCss = css`
  position: relative;
  justify-self: center;
  display: grid;
  place-items: center;
  width: 2.3em;
  background: ${paper};

  > img {
    width: 100%;
  }
`

/** A phase where the item does nothing: the icon faded as in the mockup, on the paper backing */
const offCss = css`
  > * {
    opacity: 0.32;
  }
`

const nameCss = css`
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 0.92em;
`

const nameOnCss = css`
  font-size: 1.08em;
`

const textCss = css`
  font-size: 0.95em;
`

const textOnCss = css`
  font-size: 1.02em;
`

const nowCss = css`
  display: block;
  width: max-content;
  margin-top: 0.05em;
  padding: 0 0.5em;
  border-radius: 0.2em;
  background: #b5481f;
  color: #fff6ef;
  font-size: 0.74em;
  line-height: 1.5;
  transform: rotate(-2deg);
`

const youCss = css`
  display: block;
  margin-top: 0.15em;
  color: #b5481f;
  font-weight: 800;
  font-size: 0.95em;
`

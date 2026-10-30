import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { currentPhaseIndex } from '../material/help/book/phases'
import { phaseIcons } from '../material/help/book/phaseIcons'

/**
 * The thread of the turn: the icons of its 6 phases, as printed on the rulebook and the cards, each named when hovered.
 * The current phase is at full size, the ones played are paler, the ones to come are grey: where the turn stands, and
 * what comes next. Nothing once the game is over.
 */
export const PhaseIcon: FC = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()
  if (!rules) return null
  const current = currentPhaseIndex(rules)
  if (current >= phaseIcons.length) return null
  return (
    <span css={threadCss}>
      {phaseIcons.map((icon, phase) => (
        <img
          key={phase}
          src={icon}
          alt={t(`phase.${phase + 1}`)}
          title={t(`phase.${phase + 1}`)}
          css={[iconCss, phase < current && playedCss, phase === current && currentCss, phase > current && comingCss]}
        />
      ))}
    </span>
  )
}

// On the axis of the text of the header, which clips what goes beyond its line
const threadCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.08em;
  margin-right: 0.35em;
  vertical-align: middle;
  position: relative;
  top: -0.06em;
`

// Doubled class: the header sizes its images to the text (h1 img). The current icon is as tall as the line.
const iconCss = css`
  && {
    position: static;
    height: 0.75em;
    filter: drop-shadow(0 0 0.06em #000000aa);
  }
`

const currentCss = css`
  && {
    height: 1.15em;
  }
`

const playedCss = css`
  && {
    opacity: 0.6;
  }
`

const comingCss = css`
  && {
    opacity: 0.4;
    filter: grayscale(1) drop-shadow(0 0 0.06em #000000aa);
  }
`

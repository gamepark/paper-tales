import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { currentPhaseIndex } from '../material/help/book/phases'
import { phaseIcons } from '../material/help/book/phaseIcons'

/** The icon of the phase of the turn, as printed on the rulebook and the cards, named when hovered */
export const PhaseIcon: FC = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()
  if (!rules) return null
  const phase = currentPhaseIndex(rules)
  if (phase >= phaseIcons.length) return null
  return <img src={phaseIcons[phase]} alt={t(`phase.${phase + 1}`)} title={t(`phase.${phase + 1}`)} css={iconCss} />
}

// As tall as the line of the header, which clips what goes beyond it, and centred on the text. Doubled class: the
// header sizes its images to the text (h1 img)
const iconCss = css`
  && {
    height: 1.15em;
    margin-right: 0.3em;
    vertical-align: middle;
    top: -0.06em;
    filter: drop-shadow(0 0 0.06em #000000aa);
  }
`

import { css } from '@emotion/react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { PrintedIcon } from '../material/help/book/HelpIcons'
import { phaseIcons } from '../material/help/book/phaseIcons'

/** The 6 phases of a turn, with their icons, in the order of the rulebook */
export const TutorialPhases: FC = () => {
  const { t } = useTranslation()
  return (
    <span css={listCss}>
      {phaseIcons.map((icon, phase) => (
        <span key={phase} css={phaseCss}>
          {phase + 1}. <PrintedIcon src={icon} /> {t(`phase.${phase + 1}`)}
        </span>
      ))}
    </span>
  )
}

const listCss = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4em 1.5em;
  margin-top: 0.6em;
`

const phaseCss = css`
  font-weight: 700;
  white-space: nowrap;
`

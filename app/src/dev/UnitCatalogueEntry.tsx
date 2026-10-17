import { Unit } from '@gamepark/paper-tales/material/Unit'
import { i18n } from 'i18next'
import { FC } from 'react'
import { FactTags } from '../material/help/book/FactTags'
import { PhaseTimeline } from '../material/help/book/PhaseTimeline'
import { PrintedText } from '../material/help/book/PrintedText'
import { unitPrintedContent } from '../material/help/book/unitPrinted'
import { entryCss, imagesCss, issueCss, titleCss } from './catalogue.css'
import { unitImages, unitIssues } from './cardIssues'

/** One unit of the catalogue: its card in the language, and its help page as the player reads it, without the game state */
export const UnitCatalogueEntry: FC<{ unit: Unit; lng: string; i18n: i18n }> = ({ unit, lng, i18n }) => {
  const issues = unitIssues(i18n, lng, unit)
  const { name, lines, facts, steps } = unitPrintedContent(unit, i18n, lng)
  return (
    <div css={entryCss} data-issues={issues.length > 0}>
      <div css={imagesCss}>{unitImages(lng)?.[unit] && <img src={unitImages(lng)![unit]} alt="" />}</div>
      <div>
        <p css={titleCss}>
          <b>{name}</b>
          <code>
            {Unit[unit]} = {unit}
          </code>
        </p>
        <FactTags tags={facts} />
        <PrintedText lines={lines} rule={false} />
        <PhaseTimeline steps={steps} onlyActive lng={lng} />
        {issues.map((issue) => (
          <span key={issue} css={issueCss}>
            {issue}
          </span>
        ))}
      </div>
    </div>
  )
}

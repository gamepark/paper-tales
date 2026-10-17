import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { i18n } from 'i18next'
import { FC } from 'react'
import { buildingPrintedContent } from '../material/help/book/buildingPrinted'
import { FactTags } from '../material/help/book/FactTags'
import { LegendValueIcon } from '../material/help/book/HelpIcons'
import { PhaseTimeline } from '../material/help/book/PhaseTimeline'
import { PrintedText } from '../material/help/book/PrintedText'
import { CatalogueCode } from './CatalogueCode'
import { entryCss, imagesCss, issueCss, titleCss } from './catalogue.css'
import { buildingFaces, buildingIssues } from './cardIssues'

/** One building of the catalogue: both faces in the language, and its help page as the player reads it, without the game state */
export const BuildingCatalogueEntry: FC<{ building: Building; lng: string; i18n: i18n }> = ({ building, lng, i18n }) => {
  const pattern = buildingCardCaracteristics[building]
  const issues = buildingIssues(i18n, lng, building)
  const { name, lines, facts, steps } = buildingPrintedContent(building, i18n, lng)
  return (
    <div css={entryCss} data-issues={issues.length > 0}>
      <div css={imagesCss} data-row>
        {buildingFaces(lng)?.map((images, level) => images[building] && <img key={level} src={images[building]} alt="" />)}
      </div>
      <div>
        <p css={titleCss}>
          <b>{name}</b>
          <code>
            {Building[building]} = {building}
          </code>
        </p>
        <FactTags
          tags={[
            ...facts,
            {
              label: 'Points',
              icon: (
                <>
                  <LegendValueIcon value={pattern.points1} /> <LegendValueIcon value={pattern.points2} />
                </>
              )
            }
          ]}
        />
        <PrintedText lines={lines} rule={false} />
        <PhaseTimeline steps={steps} onlyActive lng={lng} />
        <CatalogueCode effects={[...(pattern.effect1 ?? []), ...(pattern.effect2 ?? [])]} resources={[pattern.resources1, pattern.resources2]} />
        {issues.map((issue) => (
          <span key={issue} css={issueCss}>
            {issue}
          </span>
        ))}
      </div>
    </div>
  )
}

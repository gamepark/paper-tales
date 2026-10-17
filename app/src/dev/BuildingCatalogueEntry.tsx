import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { i18n } from 'i18next'
import { FC, Fragment } from 'react'
import { Trans } from 'react-i18next'
import { effectStep } from '../material/help/book/effectStep'
import { helpIconComponents } from '../material/help/book/helpIconComponents'
import { LegendValueIcon, ResourceIcon } from '../material/help/book/HelpIcons'
import { phaseIcons } from '../material/help/book/phaseIcons'
import { codeCss, entryCss, imagesCss, issueCss, linesCss, phaseIconCss, printedCss, tagsCss, titleCss } from './catalogue.css'
import { describeEffect } from './catalogueChecks'
import { buildingFaces, buildingIssues } from './cardIssues'

const Cost: FC<{ cost: Resources[]; alternate?: Resources[] }> = ({ cost, alternate }) => (
  <>
    {cost.map((resource, index) => (
      <ResourceIcon key={index} resource={resource} />
    ))}
    {alternate && (
      <>
        {' / '}
        {alternate.map((resource, index) => (
          <ResourceIcon key={index} resource={resource} />
        ))}
      </>
    )}
  </>
)

/** One building of the catalogue: both faces in the language, the costs and points, each effect with its level */
export const BuildingCatalogueEntry: FC<{ building: Building; lng: string; i18n: i18n }> = ({ building, lng, i18n }) => {
  const t = i18n.getFixedT(lng)
  const pattern = buildingCardCaracteristics[building]
  const issues = buildingIssues(i18n, lng, building)
  const levels = [
    { level: 1, effects: pattern.effect1, resources: pattern.resources1 },
    { level: 2, effects: pattern.effect2, resources: pattern.resources2 }
  ]
  return (
    <div css={entryCss} data-issues={issues.length > 0}>
      <div css={imagesCss} data-row>
        {buildingFaces(lng)?.map((images, level) => images[building] && <img key={level} src={images[building]} alt="" />)}
      </div>
      <div>
        <p css={titleCss}>
          <b>{t(`building.${building}`)}</b>
          <code>
            {Building[building]} = {building}
          </code>
        </p>
        <div css={tagsCss}>
          <span>
            Coût niveau 1 <Cost cost={pattern.cost1} alternate={pattern.cost1Alternate} />
          </span>
          <span>
            Coût niveau 2 <Cost cost={pattern.cost2} alternate={pattern.cost2Alternate} />
          </span>
          <span>
            Points <LegendValueIcon value={pattern.points1} /> <LegendValueIcon value={pattern.points2} />
          </span>
        </div>
        <ul css={linesCss}>
          {levels.map(({ level, effects, resources }) => (
            <Fragment key={level}>
              {resources && (
                <li key={`resources-${level}`}>
                  <span />
                  <span css={printedCss}>
                    Niveau {level} produit{' '}
                    {resources.map((resource, index) => (
                      <ResourceIcon key={index} resource={resource} />
                    ))}
                  </span>
                </li>
              )}
              {effects?.map((effect, index) => {
                const key = `building.effect.${building}.${level}`
                const step = effectStep(effect)
                return (
                  <li key={`${key}-${index}`}>
                    {step !== undefined && step < 6 ? <img css={phaseIconCss} src={phaseIcons[step]} alt="" /> : <span />}
                    <span>
                      <span css={printedCss}>
                        Niveau {level} : {i18n.exists(key, { lng }) ? <Trans t={t} i18nKey={key} components={helpIconComponents} /> : '—'}
                      </span>
                      <code css={codeCss}>{describeEffect(effect)}</code>
                    </span>
                  </li>
                )
              })}
            </Fragment>
          ))}
        </ul>
        {issues.map((issue) => (
          <span key={issue} css={issueCss}>
            {issue}
          </span>
        ))}
      </div>
    </div>
  )
}

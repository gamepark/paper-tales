import { howManyCardCopies, Unit } from '@gamepark/paper-tales/material/Unit'
import { LaneType, unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { i18n } from 'i18next'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { effectStep } from '../material/help/book/effectStep'
import { helpIconComponents } from '../material/help/book/helpIconComponents'
import { CoinIcon, ResourceIcon, StrengthIcon } from '../material/help/book/HelpIcons'
import { phaseIcons } from '../material/help/book/phaseIcons'
import { unitPrintedName } from '../material/help/unitPrintedName'
import { codeCss, entryCss, imagesCss, issueCss, linesCss, phaseIconCss, printedCss, tagsCss, titleCss } from './catalogue.css'
import { describeEffect } from './catalogueChecks'
import { unitEffectKey, unitImages, unitIssues } from './cardIssues'

/** One unit of the catalogue: its card in the language, what the code knows about it, what the player reads */
export const UnitCatalogueEntry: FC<{ unit: Unit; lng: string; i18n: i18n }> = ({ unit, lng, i18n }) => {
  const t = i18n.getFixedT(lng)
  const pattern = unitCardCaracteristics[unit]
  const effects = pattern.effect ?? []
  const condition = pattern.resources?.condition
  const issues = unitIssues(i18n, lng, unit)
  return (
    <div css={entryCss} data-issues={issues.length > 0}>
      <div css={imagesCss}>{unitImages(lng)?.[unit] && <img src={unitImages(lng)![unit]} alt="" />}</div>
      <div>
        <p css={titleCss}>
          <b>{i18n.exists(`unit.name.${unit}`, { lng }) ? t(`unit.name.${unit}`) : unitPrintedName(unit)}</b>
          <code>
            {Unit[unit]} = {unit}
          </code>
        </p>
        <div css={tagsCss}>
          <span>
            Coût <CoinIcon /> {pattern.cost}
          </span>
          <span>
            Force <StrengthIcon value={pattern.power} />
          </span>
          <span>Exemplaires {howManyCardCopies(unit)}</span>
          {pattern.resources && (
            <span>
              Produit{' '}
              {pattern.resources.type.map((resource, index) => (
                <ResourceIcon key={index} resource={resource} />
              ))}
              {condition?.onLane !== undefined && (condition.onLane === LaneType.FrontLane ? ' à l’Avant' : ' à l’Arrière')}
              {condition?.perAgeToken && ' par jeton Âge'}
              {condition?.ifAgeToken && ' avec un jeton Âge'}
            </span>
          )}
        </div>
        <ul css={linesCss}>
          {effects.map((effect, index) => {
            const key = unitEffectKey(unit, index, effects.length)
            const step = effectStep(effect)
            return (
              <li key={key}>
                {step !== undefined && step < 6 ? <img css={phaseIconCss} src={phaseIcons[step]} alt="" /> : <span />}
                <span>
                  <span css={printedCss}>{i18n.exists(key, { lng }) ? <Trans t={t} i18nKey={key} components={helpIconComponents} /> : '—'}</span>
                  <code css={codeCss}>{describeEffect(effect)}</code>
                </span>
              </li>
            )
          })}
          {i18n.exists(`unit.production.${unit}`, { lng }) && (
            <li>
              <span />
              <span css={printedCss}>
                <Trans t={t} i18nKey={`unit.production.${unit}`} components={helpIconComponents} />
              </span>
            </li>
          )}
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


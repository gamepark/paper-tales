import { css } from '@emotion/react'
import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { i18n as I18n } from 'i18next'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { effectStep } from './effectStep'
import { EffectLines } from './EffectLines'
import { helpIconComponents } from './helpIconComponents'
import { CostOptions } from './Cost'
import { ResourceIcon } from './HelpIcons'
import { LevelLabel } from './LevelLabel'
import { TimelineStep } from './PhaseTimeline'
import { PrintedLine } from './PrintedText'
import { SymbolLegend } from './SymbolLegend'
import { PrintedContent } from './unitPrinted'

/** The translation key of a printed effect of a building: one per level, or one per effect when a level has several */
export const buildingEffectKey = (building: Building, level: number, index: number, count: number) =>
  count > 1 ? `building.effect.${building}.${level + 1}.${index + 1}` : `building.effect.${building}.${level + 1}`

/**
 * The static part of the help of a building, in the given language: the costs of both levels, each printed effect in the
 * line of its phase, the productions of both levels on one scroll line, and the rules of construction on the timeline.
 */
export const buildingPrintedContent = (building: Building, i18n: I18n, lng = i18n.language): PrintedContent => {
  const t = i18n.getFixedT(lng)
  const pattern = buildingCardCaracteristics[building]
  const levelLabel = (level: number) => (
    <LevelLabel level={level} label={t(level ? 'help.building.level.2' : 'help.building.level.1', level ? 'Level 2:' : 'Level 1+:')} />
  )

  const effectTexts: ReactNode[][] = [[], [], [], [], [], [], []]
  const effectKeys: string[][] = [[], [], [], [], [], [], []]
  const lines: PrintedLine[] = []
  // One text per effect, in the line of its phase (the Port has 2 effects at level 1, of 2 phases)
  ;[pattern.effect1 ?? [], pattern.effect2 ?? []].forEach((effects, level) => {
    effects.forEach((effect, index) => {
      const key = buildingEffectKey(building, level, index, effects.length)
      if (!i18n.exists(key, { lng })) return
      const step = effectStep(effect)
      const text = (
        <span key={key}>
          {levelLabel(level)} <Trans t={t} i18nKey={key} components={helpIconComponents} />
        </span>
      )
      if (step === undefined) lines.push({ text })
      else {
        effectTexts[step].push(text)
        effectKeys[step].push(t(key))
      }
    })
  })
  // The productions of both levels on one scroll line, each after the icon of its level
  const productions = [pattern.resources1, pattern.resources2].flatMap((resources, level) => (resources?.length ? [{ level, resources }] : []))
  if (productions.length) {
    lines.push({
      production: true,
      text: (
        <>
          {productions.map(({ level, resources }) => (
            <span key={level} css={productionLevelCss}>
              {levelLabel(level)}
              {/* The level 2 face keeps the production of the level 1 */}
              {level === 1 && productions.length > 1 && <>{t('help.building.production.more', 'also')} </>}
              {resources.map((resource, index) => (
                <ResourceIcon key={index} resource={resource} />
              ))}
            </span>
          ))}
        </>
      )
    })
  }
  const printed = (step: number) =>
    effectTexts[step].length ? (
      <>
        <EffectLines lines={effectTexts[step]} />
        <SymbolLegend texts={effectKeys[step]} />
      </>
    ) : undefined

  // The rule every building follows at a phase, then its printed effects of the phase
  const withPrinted = (step: number, rule: ReactNode) => (
    <>
      {rule}
      {printed(step)}
    </>
  )
  const steps: TimelineStep[] = [
    {},
    {
      on: true,
      text: withPrinted(
        1,
        <span>
          {levelLabel(1)} {t('help.building.slot', 'your Kingdom gets a 5th spot for a Unit, in the Front.')}
        </span>
      )
    },
    { on: effectTexts[2].length > 0, text: printed(2) },
    { on: effectTexts[3].length > 0, text: printed(3) },
    {
      on: true,
      text: withPrinted(
        4,
        t(
          'help.building.rule',
          'One action per turn: build a Building at level 1, build it directly at level 2, or upgrade a level 1 Building. Building costs 2 more gold for each Building you already have; upgrading does not.'
        )
      )
    },
    { on: effectTexts[5].length > 0, text: printed(5) },
    { on: true, text: <Trans t={t} i18nKey="help.building.end" defaults="<pl1/> at level 1, <pl3/> at level 2." components={helpIconComponents} /> }
  ]
  const facts = [
    { label: t('help.building.cost1', 'Level 1 cost'), icon: <CostOptions cost={pattern.cost1} alternate={pattern.cost1Alternate} /> },
    { label: t('help.building.cost2', 'Level 2 cost'), icon: <CostOptions cost={pattern.cost2} alternate={pattern.cost2Alternate} /> }
  ]
  return { name: t(`building.${building}`), lines, facts, steps }
}

const productionLevelCss = css`
  & + & {
    margin-left: 0.8em;
  }
`

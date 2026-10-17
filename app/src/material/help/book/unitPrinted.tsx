import { isChangeWarPower } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { howManyCardCopies, Unit } from '@gamepark/paper-tales/material/Unit'
import { LaneType, ResourcesCondition, unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { i18n as I18n, TFunction } from 'i18next'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { unitPrintedName } from '../unitPrintedName'
import { effectStep } from './effectStep'
import { EffectLines } from './EffectLines'
import { FactTag } from './FactTags'
import { helpIconComponents } from './helpIconComponents'
import { CoinIcon, ResourceIcon, StrengthIcon } from './HelpIcons'
import { TimelineStep } from './PhaseTimeline'
import { PrintedLine } from './PrintedText'
import { SymbolLegend } from './SymbolLegend'

/** What the help of a card says whatever the state of the game: its name, the text printed on it, its facts, its life over the turn */
export type PrintedContent = { name: string; lines: PrintedLine[]; facts: FactTag[]; steps: TimelineStep[] }

/**
 * The static part of the help of a unit, in the given language: the text printed on the card (an effect of a phase goes
 * in the line of its phase, what is permanent stays at the top), the facts of the card, and the steps where it acts.
 */
export const unitPrintedContent = (unit: Unit, i18n: I18n, lng = i18n.language): PrintedContent => {
  const t = i18n.getFixedT(lng)
  const exists = (key: string) => i18n.exists(key, { lng })
  const pattern = unitCardCaracteristics[unit]
  const effects = pattern.effect ?? []
  const acts = new Set(effects.map(effectStep))
  const resources = pattern.resources?.type ?? []

  const effectTexts: ReactNode[][] = [[], [], [], [], [], [], []]
  const effectKeys: string[][] = [[], [], [], [], [], [], []]
  const lines: PrintedLine[] = []
  effects.forEach((effect, index) => {
    const key = effects.length > 1 ? `unit.effect.${unit}.${index + 1}` : `unit.effect.${unit}`
    if (!exists(key)) return
    const text = <Trans key={key} t={t} i18nKey={key} components={helpIconComponents} />
    const step = effectStep(effect)
    if (step === undefined) lines.push({ text })
    else {
      effectTexts[step].push(text)
      effectKeys[step].push(t(key))
    }
  })
  if (exists(`unit.production.${unit}`)) {
    lines.push({ production: true, text: <Trans t={t} i18nKey={`unit.production.${unit}`} components={helpIconComponents} /> })
  } else if (resources.length) {
    const condition = resourceConditionText(pattern.resources?.condition, t)
    lines.push({
      production: true,
      text: (
        <>
          {resources.map((resource, index) => (
            <ResourceIcon key={index} resource={resource} />
          ))}
          {condition && <> {condition}</>}
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

  const steps: TimelineStep[] = [0, 1, 2, 3, 4, 5].map((step) => ({ on: acts.has(step), text: printed(step) }))
  if (acts.has(6)) steps.push({ on: true, text: printed(6) })

  const conditional = effects.some(isChangeWarPower)
  const facts: FactTag[] = [
    { label: t('help.unit.cost', 'Cost'), icon: <CoinIcon />, value: pattern.cost },
    { label: t('help.unit.strength', 'Strength'), icon: <StrengthIcon value={`${pattern.power}${conditional ? '*' : ''}`} /> },
    { label: t('help.unit.copies.label', 'Copies'), value: howManyCardCopies(unit) }
  ]
  const name = exists(`unit.name.${unit}`) ? t(`unit.name.${unit}`) : unitPrintedName(unit)
  return { name, lines, facts, steps }
}

/** The condition printed beside the produced resource (the scroll of the card), if any */
const resourceConditionText = (condition: ResourcesCondition | undefined, t: TFunction): string | undefined => {
  if (!condition) return undefined
  if (condition.perAgeToken) return t('help.unit.resources.per-age', 'per Age token')
  if (condition.ifAgeToken) return t('help.unit.resources.if-age', 'with an Age token')
  if (condition.onLane === LaneType.FrontLane) return t('help.unit.resources.front', 'in the Front')
  if (condition.onLane === LaneType.BackLane) return t('help.unit.resources.back', 'in the Back')
  return undefined
}

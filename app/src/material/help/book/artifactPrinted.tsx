import { Artifact } from '@gamepark/paper-tales/material/Artifact'
import { artifactCaracteristics } from '@gamepark/paper-tales/material/ArtifactCaracteristics'
import { i18n as I18n } from 'i18next'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { effectStep } from './effectStep'
import { EffectLines } from './EffectLines'
import { FactTag } from './FactTags'
import { helpIconComponents } from './helpIconComponents'
import { LegendIcon, ResourceIcon } from './HelpIcons'
import { TimelineStep } from './PhaseTimeline'
import { PrintedLine } from './PrintedText'
import { PrintedContent } from './unitPrinted'
import { SymbolLegend } from './SymbolLegend'

/**
 * The static part of the help of a Legendary Artifact (rulebook p.11): its printed effect in the line of its phase, its
 * resource, the Legend points it earns at the end of the game. It never ages.
 */
export const artifactPrintedContent = (artifact: Artifact, i18n: I18n, lng = i18n.language): PrintedContent => {
  const t = i18n.getFixedT(lng)
  const pattern = artifactCaracteristics[artifact]
  const effects = pattern.effect ?? []
  const effectTexts: ReactNode[][] = [[], [], [], [], [], [], []]
  const effectKeys: string[][] = [[], [], [], [], [], [], []]
  const lines: PrintedLine[] = []
  effects.forEach((effect) => {
    const key = `artifact.effect.${artifact}`
    const text = <Trans key={key} t={t} i18nKey={key} components={helpIconComponents} />
    const step = effectStep(effect)
    if (step === undefined) lines.push({ text })
    else {
      effectTexts[step].push(text)
      effectKeys[step].push(t(key))
    }
  })
  for (const production of pattern.resources ?? []) {
    lines.push({
      production: true,
      text: (
        <>
          {production.type.map((resource, index) => (
            <ResourceIcon key={index} resource={resource} />
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
  const acts = new Set<number | undefined>(effects.map(effectStep))
  const steps: TimelineStep[] = [0, 1, 2, 3, 4, 5].map((step) => ({ on: acts.has(step), text: printed(step) }))
  steps[5] = { on: true, text: t('help.artifact.age', 'Never ages: no Age token on it.') }
  steps.push({
    on: true,
    text: <Trans t={t} i18nKey="help.artifact.end" defaults="<pl/> {points} at the end of the game." values={{ points: pattern.points }} components={helpIconComponents} />
  })
  const facts: FactTag[] = [
    { label: t('help.artifact.cost', 'Cost'), value: t('help.artifact.cost.value', '1 + the artifacts already deployed') },
    { label: t('help.artifact.points', 'End of the game'), icon: <LegendIcon />, value: pattern.points },
    { label: t('help.unit.copies.label', 'Copies'), value: 2 }
  ]
  return { name: t(`artifact.name.${artifact}`), lines, facts, steps }
}

import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { i18n } from 'i18next'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import { frenchBuildingCardDescription } from '../material/FrenchBuildingCardDescription'
import { frenchUnitCardDescription } from '../material/FrenchUnitCardDescription'
import { unitCardDescription } from '../material/UnitCardDescription'
import { buildingEffectKey } from '../material/help/book/buildingPrinted'
import { textIssues } from './catalogueChecks'

/** The card images of each edition, read when asked (the descriptions are not initialised yet when this module loads) */
export const unitImages = (lng: string): Record<Unit, string> | undefined =>
  ({ fr: frenchUnitCardDescription.images, en: unitCardDescription.images })[lng]

/** The two faces of each building, level 1 then level 2, in each edition */
export const buildingFaces = (lng: string): [Record<Building, string>, Record<Building, string>] | undefined =>
  ({
    fr: [frenchBuildingCardDescription.images, frenchBuildingCardDescription.backImages] as [Record<Building, string>, Record<Building, string>],
    en: [buildingCardDescription.images, buildingCardDescription.backImages] as [Record<Building, string>, Record<Building, string>]
  })[lng]

/** The translation key of a printed effect of a unit */
export const unitEffectKey = (unit: Unit, index: number, count: number) => (count > 1 ? `unit.effect.${unit}.${index + 1}` : `unit.effect.${unit}`)

/** The issues of a unit in a language: missing or broken texts, a missing image */
export const unitIssues = (i18n: i18n, lng: string, unit: Unit): string[] => {
  const effects = unitCardCaracteristics[unit].effect ?? []
  const issues = [...textIssues(i18n, lng, `unit.name.${unit}`)]
  effects.forEach((_, index) => issues.push(...textIssues(i18n, lng, unitEffectKey(unit, index, effects.length))))
  if (i18n.exists(`unit.production.${unit}`, { lng })) issues.push(...textIssues(i18n, lng, `unit.production.${unit}`))
  if (!unitImages(lng)?.[unit]) issues.push(`image ${lng} manquante`)
  return issues
}

/** The issues of a building in a language: a missing text for a level that has an effect, a missing face */
export const buildingIssues = (i18n: i18n, lng: string, building: Building): string[] => {
  const pattern = buildingCardCaracteristics[building]
  const issues = i18n.exists(`building.${building}`, { lng }) ? [] : [`clé manquante : building.${building}`]
  ;[pattern.effect1 ?? [], pattern.effect2 ?? []].forEach((effects, level) =>
    effects.forEach((_, index) => issues.push(...textIssues(i18n, lng, buildingEffectKey(building, level, index, effects.length))))
  )
  buildingFaces(lng)?.forEach((images, level) => {
    if (!images[building]) issues.push(`image ${lng} du niveau ${level + 1} manquante`)
  })
  return issues
}

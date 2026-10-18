import { FC } from 'react'
import { Trans } from 'react-i18next'
import { UnitAction, unitActionTexts } from './UnitActions'

/** The words of an action, on its button */
export const UnitActionLabel: FC<{ action: UnitAction }> = ({ action }) => {
  const [key, defaults] = unitActionTexts[action]
  return <Trans i18nKey={key} defaults={defaults} />
}

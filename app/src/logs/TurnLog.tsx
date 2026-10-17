import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { MaterialLogProps } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/** A new turn begins: its number, as a heading of the notebook */
export const TurnLog: FC<MaterialLogProps> = ({ context }) => {
  const { t } = useTranslation()
  const turn = new PaperTalesRules(context.game).remind<number>(Memory.Time)
  return <>{t('log.turn', { defaultValue: 'Turn {turn}', turn })}</>
}

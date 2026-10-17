import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { MaterialLogProps } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import time1 from '../images/time/time1.png'
import time2 from '../images/time/time2.png'
import time3 from '../images/time/time3.png'
import time4 from '../images/time/time4.png'
import { turnBookCss } from './logs.css'

const books = [time1, time2, time3, time4]

/** A new turn begins: the open book of the turn counter and its number */
export const TurnLog: FC<MaterialLogProps> = ({ context }) => {
  const { t } = useTranslation()
  const turn = new PaperTalesRules(context.game).remind<number>(Memory.Time)
  return (
    <>
      <img css={turnBookCss} src={books[turn - 1] ?? books[0]} alt="" />
      {t('log.turn', { defaultValue: 'Turn {turn}', turn })}
    </>
  )
}

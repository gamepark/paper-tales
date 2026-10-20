import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { MaterialLogProps } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import time1 from '../images/time/time1.png'
import time2 from '../images/time/time2.png'
import time3 from '../images/time/time3.png'
import time4 from '../images/time/time4.png'
import { turnBookCss } from './logs.css'

const books = [time1, time2, time3, time4]

/** The heading of a turn: the open book of the turn counter and its number */
const TurnHeading: FC<{ game: MaterialGame }> = ({ game }) => {
  const { t } = useTranslation()
  const turn = new PaperTalesRules(game).remind<number>(Memory.Time)
  return (
    <>
      <img css={turnBookCss} src={books[turn - 1] ?? books[0]} alt="" />
      {t('log.turn', { defaultValue: 'Turn {turn}', turn })}
    </>
  )
}

/** A new turn begins, read on the game of the move: the turn counter has already moved */
export const TurnLog: FC<MaterialLogProps> = ({ context }) => <TurnHeading game={context.game} />

/** The first turn begins with the game: its heading is a line of the setup */
export const FirstTurnLog: FC<{ game: MaterialGame }> = ({ game }) => <TurnHeading game={game} />

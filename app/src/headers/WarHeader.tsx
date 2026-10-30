import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { getWarPlayers, isWarView } from '../locators/TableLayout'
import { useWarBeat, WarBeat } from '../table/warPace'

/**
 * Wars (rulebook p.6), resolved at once, told beat by beat on the neighbours view (see warPace)
 */
export const WarHeader = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  if (!isWarView(context)) {
    if (context.rules.players.length === 2) return <>{t('header.war.two-players', 'War: the kingdoms face each other')}</>
    return <>{t('header.war', 'Wars: each kingdom faces its two neighbours')}</>
  }
  return <WarBeatHeader />
}

/**
 * What the header says at each beat of the wars: the strength of the front rows, then the war against each neighbour of
 * the central kingdom, one after the other, then the points of the phase
 */
export const WarBeatHeader = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const beat = useWarBeat()
  // The neighbours of the central kingdom, in the order their wars are told: with 3 kingdoms, the left one then the right one
  const players = getWarPlayers(context)
  const first = usePlayerName(players.length === 3 ? players[0] : players[1])
  const second = usePlayerName(players[players.length - 1])
  const lastWar = players.length === 3 ? WarBeat.SecondWar : WarBeat.FirstWar
  if (beat === WarBeat.Strengths) return <>{t('header.war.strengths', 'Wars: each kingdom counts the strength of its front row')}</>
  if (beat <= lastWar) {
    return <>{t('header.war.against', { defaultValue: 'War against {player}', player: beat === WarBeat.FirstWar ? first : second })}</>
  }
  return <>{t('header.war.points', 'Wars: the points of the phase')}</>
}

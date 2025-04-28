/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GameTable, GameTableNavigation } from '@gamepark/react-game'
import { FC } from 'react'
import { PlayerPanels } from './panels/PlayerPanels'
import { getTableSize } from './position/position.utils'

type GameDisplayProps = {
  players: number
}

export const GameDisplay: FC<GameDisplayProps> = ({ players }) => {
  if (!players) return null
  const tableSize = getTableSize(players)
  return <>
    <GameTable {...tableSize}
               verticalCenter
               css={process.env.NODE_ENV === 'development' && css`border: 1px solid white;`}>
      <GameTableNavigation css={gameNavigationCss}/>
      <PlayerPanels/>
    </GameTable>
  </>
}

const gameNavigationCss = css`
  top: 30em;
  font-size: 0.9em;
`

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { GameTable, GameTableNavigation } from '@gamepark/react-game'
import { FC } from 'react'
import { PlayerPanels } from './panels/PlayerPanels'

type GameDisplayProps = {
  players: number
}

export const GameDisplay: FC<GameDisplayProps> = (props) => {
  return <>
    <GameTable xMin={getGameTableSize(props.players).xMin}
               xMax={getGameTableSize(props.players).xMax}
               yMin={getGameTableSize(props.players).yMin} 
               yMax={getGameTableSize(props.players).yMax}
               css={process.env.NODE_ENV === 'development' && css`border: 1px solid white;`}>
      <GameTableNavigation/>
      <PlayerPanels/>
    </GameTable>
  </>
}

type gameTableSizes = {
  xMin:number
  xMax:number
  yMin:number
  yMax:number
}

function getGameTableSize(players:number):gameTableSizes{
  switch (players){
    case 2:
      return {xMin:-70, xMax:70, yMin:-45, yMax:16}
    case 3:
      return {xMin:-82, xMax:95, yMin:-45, yMax:30}
    case 4:
      return {xMin:-70, xMax:70, yMin:-45, yMax:16}
    case 5:
    default:
      return {xMin:-70, xMax:70, yMin:-45, yMax:16}

  }
}

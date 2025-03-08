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
      return {xMin:-80, xMax:80, yMin:-38, yMax:33}
    case 4:
      return {xMin:-93, xMax:93, yMin:-40, yMax:42}
    case 5:
    default:
      return {xMin:-70, xMax:70, yMin:-45, yMax:16}

  }
}

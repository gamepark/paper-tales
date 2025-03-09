/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { usePlayers } from '@gamepark/react-game'
import { FC } from 'react'
import { createPortal } from 'react-dom'
import { PaperTalesPlayerPanel } from './PaperTalesPlayerPanel'

export const PlayerPanels: FC<any> = () => {
  const players = usePlayers({ sortFromMe: true })
  const root = document.getElementById('root')
  if (!root) {
    return null
  }

  return createPortal(
    <>
      {players.map((player, index) =>
        <PaperTalesPlayerPanel 
          key={player.id} 
          player={player} 
          index={index} 
          color={playerColorCode[player.id as PlayerColor]} 
          css={[absolute, panelWidth(players.length), positionCss(players.length)[index]]}/>
      )}
    </>,
    root
  )
}
const absolute = css`
  position: absolute;
  font-size:0.8em;
`

const panelWidth = (players:number) => css`
  width: ${players === 2 ? 25 : players === 3 ? 25 : players === 4 ? 30 : 25}em;
`

function positionCss (players:number) {
  switch (players){
    case 2:
      return [bottomLeft(players), bottomRight(players)] // 2 players
    case 3:
      return [bottomLeft(players), bottomRight(players), topRight(players)] // 3 players
    case 4:
      return [bottomLeft(players), topLeft(players), topRight(players), bottomRight(players)] // 4 players
    case 5:
    default:
      return [bottomCenter(players), bottomRight(players), topRight(players), topLeft(players), bottomLeft(players)] // 5 players
  }

} 

const bottomLeft = (players:number) => css`
  left: ${players === 2 ? 1 : players === 3 ? 2 : players === 4 ? 2 : 2}em;
  bottom: ${players === 2 ? 2 : players === 3 ? 11 : players === 4 ? 7 : 2}em;
`

const bottomRight = (players:number) => css`
  right: ${players === 2 ? 1 : players === 3 ? 2 : players === 4 ? 2 : 2}em;
  bottom: ${players === 2 ? 2 : players === 3 ? 2 : players === 4 ? 7 : 2}em;
`

const topLeft = (players:number) => css`
  left: ${players === 3 ? 2 : players === 4 ? 2 : 2}em;
  top: ${players === 3 ? 2 : players === 4 ? 12 : 12}em;
`

const topRight = (players:number) => css`
  right: ${players === 3 ? 2 : players === 4 ? 2 : 2}em;
  top: ${players === 3 ? 40 : players === 4 ? 12 : 12}em; 
`

const bottomCenter = (_players:number) => css`
  right: 10em;
  bottom: 2em;
  transform: translateX(-32em);
`

export const playerColorCode: Record<PlayerColor, string> = {
  [PlayerColor.Red]: 'red',
  [PlayerColor.Blue]: 'blue',
  [PlayerColor.Green]: 'green',
  [PlayerColor.Yellow]: 'yellow',
  [PlayerColor.Black]: 'black',
  [PlayerColor.Purple]: 'purple',
  [PlayerColor.White]: 'white'

}
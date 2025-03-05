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
          css={[absolute, positionCss(players.length)[index]]}/>
      )}
    </>,
    root
  )
}
const absolute = css`
  position: absolute;
  font-size:0.8em;
`

const bottomLeft = (players:number) => css`
  left: ${players === 2 ? 1 : 2}em;
  bottom: ${players === 2 ? 2 :11}em;
  width:25em;
`

const bottomRight = (players:number) => css`
  right: ${players === 2 ? 1 : 2}em;
  bottom: ${players === 2 ? 2 : 40}em;
  width:25em;
`

const topLeft = (_players:number) => css`
  left: 2em;
  bottom: 2em;
`

const topRight = (_players:number) => css`
  left: 2em;
  bottom: 40em;
  width:25em;
`

const topCenter = (_players:number) => css`
  left: 50%;
  top: 10em;
  transform: translateX(-32em);
`


function positionCss (players:number) {
  switch (players){
    case 2:
      return [bottomLeft(players), bottomRight(players)] // 2 players
    case 3:
      return [bottomLeft(players), bottomRight(players), topRight(players)] // 3 players
    case 4:
      return [bottomLeft(players), bottomRight(players), topLeft(players), topRight(players)] // 4 players
    case 5:
    default:
      return [bottomLeft(players), bottomRight(players), topLeft(players), topRight(players), topCenter(players)] // 5 players
  }

} 

export const playerColorCode: Record<PlayerColor, string> = {
  [PlayerColor.Red]: 'red',
  [PlayerColor.Blue]: 'blue',
  [PlayerColor.Green]: 'green',
  [PlayerColor.Yellow]: 'yellow',
  [PlayerColor.Black]: 'black',
  [PlayerColor.Purple]: 'purple',
  [PlayerColor.White]: 'white'

}
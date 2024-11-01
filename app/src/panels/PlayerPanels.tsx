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
        <PaperTalesPlayerPanel key={player.id} player={player} index={index} color={playerColorCode[player.id]} css={[absolute, positionCss[players.length - 2][index]]}/>
      )}
    </>,
    root
  )
}
const absolute = css`
  position: absolute;
`

const topLeft = css`
  left: 2em;
  top: 15em;
`

const topRight = css`
  right: 2em;
  top: 15em;
`

const bottomLeft = css`
  left: 2em;
  bottom: 2em;
`

const bottomRight = css`
  right: 2em;
  bottom: 2em;
`

const topCenter = css`
  left: 50%;
  top: 10em;
  transform: translateX(-32em);
`


const positionCss = [
  [topLeft, topRight], // 2 players
  [bottomLeft, topCenter, bottomRight], // 3 players
  [bottomLeft, topLeft, topRight, bottomRight], // 4 players
  [bottomLeft, topLeft, topCenter, topRight, bottomRight] // 4 players
]

export const playerColorCode: Record<PlayerColor, string> = {
  [PlayerColor.Red]: 'red',
  [PlayerColor.Blue]: 'blue',
  [PlayerColor.Green]: 'green',
  [PlayerColor.Yellow]: 'yellow',
  [PlayerColor.Black]: 'black',
  [PlayerColor.Purple]: 'purple',
  [PlayerColor.White]: 'white'

}
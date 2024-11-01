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
        <PaperTalesPlayerPanel key={player.id} player={player} index={index} color={playerColorCode[player.id]} css={panelPosition(index)}/>
      )}
    </>,
    root
  )
}
const panelPosition = (index: number) => css`
  position: absolute;
  right: 1em;
  top: ${8.5 + index * 16}em;
  width: 28em;
  height: 14em;
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
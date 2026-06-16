/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { usePlayerId, usePlayers, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { FC } from 'react'
import { PaperTalesPlayerPanel } from './PaperTalesPlayerPanel'

export const PlayerPanels: FC = () => {
  const players = usePlayers<PlayerColor>({ sortFromMe: true })
  const me = usePlayerId<PlayerColor>()
  const rules = useRules<MaterialRules>()
  const viewedPlayer = (rules as unknown as { game: { view?: PlayerColor } } | undefined)?.game.view ?? me ?? players[0]?.id

  return (
    <div css={columnCss}>
      {players.map((player, index) => (
        <PaperTalesPlayerPanel
          key={player.id}
          player={player}
          index={index}
          isViewed={player.id === viewedPlayer}
          css={panelCss}
        />
      ))}
    </div>
  )
}

// Colonne fixée au bord droit DE LA GAME TABLE, panels empilés depuis le bas.
// `transform: translateZ(5em)` lève le conteneur au-dessus des cartes (3D layering Faraway-style).
// pointer-events: none sur le conteneur, auto sur les panels → ne bloque pas les drags de cartes.
const columnCss = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.8em;
  padding: 0.5em 0.6em;
  pointer-events: none;
  transform: translateZ(5em);

  > * {
    pointer-events: auto;
  }
`

const panelCss = css`
  font-size: 1em;

  @media (max-width: 768px) {
    font-size: 1.2em;
  }
`

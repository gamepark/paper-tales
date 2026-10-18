import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton, useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getDraftRecipient,
  getLeftNeighbour,
  getMe,
  getPanelPosition,
  getPanelsOrder,
  getRightNeighbour,
  getViewedPlayer,
  isDraftRule,
  isSpectator,
  isWarView,
  PANEL_HEIGHT,
  PANEL_WIDTH
} from '../locators/TableLayout'
import { TableAnchor } from '../table/TableAnchor'
import { paper, paperBackgroundCss, paperButtonResetCss, rust, tagPaperCss } from '../theme/tableTheme'
import { PaperTalesPlayerPanel } from './PaperTalesPlayerPanel'

/**
 * The panels, laid on the table in a column in seating order: my right neighbour above me, my left neighbour below me,
 * then the others.
 * A whole panel is the button that displays that player's area: a view change nobody else sees, so the move is
 * transient. The panel of the displayed area is pulled out of the column. During the recruitment, the panel of the
 * Monarch who receives my cards is tagged.
 */
export const PlayerPanels: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = getMe(context)
  const viewed = isWarView(context) ? undefined : getViewedPlayer(context)
  // Left, right and who receives the cards are told from my seat: a spectator has none
  const spectator = isSpectator(context)
  const twoPlayers = context.rules.players.length === 2
  // With 2 players, the other Monarch is the only neighbour and receives every card: no tags at all
  const recipient = isDraftRule(context) && !spectator && !twoPlayers ? getDraftRecipient(context) : undefined

  const neighbourTag = (player: PlayerColor) => {
    if (spectator || twoPlayers || player === me) return undefined
    if (player === getLeftNeighbour(context)) return t('panel.left', 'Left')
    if (player === getRightNeighbour(context)) return t('panel.right', 'Right')
    return undefined
  }

  return (
    <>
      {getPanelsOrder(context).map((id, index) => {
        const tag = neighbourTag(id)
        return (
          <TableAnchor key={id} position={getPanelPosition(index)} css={containerCss}>
            {id === viewed ? <PaperTalesPlayerPanel player={id} css={viewedCss} /> : <ViewPanelButton player={id} />}
            {tag && <span css={[tagPaperCss, tagCss, cornerCss]}>{tag}</span>}
            {id === recipient && <span css={[tagPaperCss, tagCss, recipientCss]}>{t('panel.receives', 'Receives your cards')}</span>}
          </TableAnchor>
        )
      })}
    </>
  )
}

/** The panel of a player whose area is not displayed: clicking it displays their area */
const ViewPanelButton: FC<{ player: PlayerColor }> = ({ player }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  return (
    <PlayMoveButton
      css={panelButtonCss}
      move={MaterialMoveBuilder.changeView(player)}
      transient
      title={t('panel.view', { defaultValue: 'View the kingdom of {player}', player: name })}
    >
      <PaperTalesPlayerPanel player={player} />
    </PlayMoveButton>
  )
}

const containerCss = css`
  position: relative;
  width: ${PANEL_WIDTH}em;
  height: ${PANEL_HEIGHT}em;
`

// The panel of the displayed area is pulled out of the column, like a page sticking out of a book
const viewedCss = css`
  transform: translateX(0.7em);
`

// The whole panel is the button: no button look, the paper sheet lifts under the pointer
const panelButtonCss = css`
  ${paperButtonResetCss};
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover:not(:disabled) {
    transform: translate(-0.06em, -0.1em);
  }

  &:active:not(:disabled) {
    transform: translate(0.06em, 0.08em);
  }
`

const tagCss = css`
  position: absolute;
  z-index: 2;
  top: -0.75em;
  padding: 0.15em 0.9em 0.05em;
  font-size: 0.75em;
  pointer-events: none;
`

const cornerCss = css`
  left: 0.4em;
`

const recipientCss = css`
  top: auto;
  bottom: -0.6em;
  right: 0.4em;
  ${paperBackgroundCss(rust, paper)};
`

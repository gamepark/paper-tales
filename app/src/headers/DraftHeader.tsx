import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * Recruitment (rulebook p.5): keep one card, the rest goes to the neighbour. Branches on the active players, never on
 * the legal moves.
 */
export const DraftHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId<PlayerColor>()
  const active = me !== undefined && rules.isTurnToPlay(me)
  if (active) return <>{rules.players.length === 2 ? t('header.draft.two-players', 'Keep a card, discard another one') : t('header.draft', 'Keep a card')}</>
  // A spectator has no card to keep: the Monarchs, not the other ones
  if (me === undefined) return <>{t('header.draft.spectator', 'The Monarchs choose their card')}</>
  return <>{t('header.draft.wait', 'The other Monarchs choose their card')}</>
}

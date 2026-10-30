import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { MaterialContext, PlayMoveButton, useLegalMove, useMaterialContext, usePlayerId, useRules } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { getNeighboursView, getViewedPlayer, getWarCenter, isWarView, viewMove } from '../locators/TableLayout'
import { cutLine, paperMuted } from '../theme/tableTheme'
import { replayWars, useWarsTold } from '../table/warPace'
import { WarBeatHeader } from './WarHeader'

/**
 * The summary of the wars: every Monarch reads it at their pace, then moves on; the income comes once they all have.
 * The wars can be told again: on the neighbours view of the Monarch they are about (mine, or for a spectator the one they
 * look at), the header then follows their beats.
 */
export const WarSummaryHeader = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = usePlayerId<PlayerColor>()
  const rules = useRules<PaperTalesRules>()!
  const continueMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  const told = useWarsTold(context)
  if (told) return <WarBeatHeader />
  if (me === undefined) {
    return (
      <Trans i18nKey="header.war-summary.spectator" defaults="The Monarchs read the outcome of the wars <0>Replay</0>">
        <ReplayButton context={context} subject={isWarView(context) ? getWarCenter(context) : getViewedPlayer(context)} />
      </Trans>
    )
  }
  if (!rules.isTurnToPlay(me)) return <>{t('header.war-summary.wait', 'The other Monarchs read the outcome of the wars')}</>
  return (
    <Trans i18nKey="header.war-summary" defaults="Outcome of the wars: read it at your pace, then <0>continue</0> <1>Replay</1>">
      <PlayMoveButton move={continueMove} />
      <ReplayButton context={context} subject={me} />
    </Trans>
  )
}

/**
 * Tells the wars again on the neighbours view of the Monarch they are about, mine or the one a spectator looks at: the view
 * goes back there (whatever was looked at meanwhile), then the beats start again
 */
const ReplayButton = ({ context, subject, children }: { context: MaterialContext; subject: PlayerColor; children?: ReactNode }) => {
  return (
    <PlayMoveButton css={replayCss} move={viewMove(context, getNeighboursView(context, subject))} transient onPlay={replayWars}>
      {children}
    </PlayMoveButton>
  )
}

/** Telling the wars again is a side action: a paler slip than the one that moves the game on */
const replayCss = css`
  color: ${cutLine};

  &::before {
    background: ${paperMuted};
  }
`

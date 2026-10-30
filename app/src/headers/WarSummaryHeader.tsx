import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton, ThemeButton, useLegalMove, useMaterialContext, usePlayerId, useRules } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { cutLine, paperMuted } from '../theme/tableTheme'
import { replayWars, useWarsTold } from '../table/warPace'
import { WarBeatHeader } from './WarHeader'

/**
 * The summary of the wars: every Monarch reads it at their pace, then moves on; the income comes once they all have.
 * The wars can be told again: the header then follows their beats.
 */
export const WarSummaryHeader = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = usePlayerId<PlayerColor>()
  const rules = useRules<PaperTalesRules>()!
  const continueMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  const told = useWarsTold(context)
  if (told) return <WarBeatHeader />
  if (me === undefined) return <>{t('header.war-summary.spectator', 'The Monarchs read the outcome of the wars')}</>
  if (!rules.isTurnToPlay(me)) return <>{t('header.war-summary.wait', 'The other Monarchs read the outcome of the wars')}</>
  return (
    <Trans i18nKey="header.war-summary" defaults="Outcome of the wars: read it at your pace, then <0>continue</0> <1>Replay</1>">
      <PlayMoveButton move={continueMove} />
      <ThemeButton css={replayCss} onClick={replayWars} />
    </Trans>
  )
}

/** Telling the wars again is a side action: a paler slip than the one that moves the game on */
const replayCss = css`
  color: ${cutLine};

  &::before {
    background: ${paperMuted};
  }
`

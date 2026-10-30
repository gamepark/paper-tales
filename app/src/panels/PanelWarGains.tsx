import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import gold from '../images/icons/gold-token.webp'
import legend from '../images/icons/legend.webp'
import { labelCss } from '../theme/tableTheme'
import { Amount } from '../table/Receipt'
import { getWarGains } from '../table/warGainsHelper'

/**
 * During the summary of the wars, on the panel of every Monarch: what they gained at the wars, the Legend points and the
 * gold, on a slip of paper pinned on the top edge of the panel
 */
export const PanelWarGains: FC<{ player: PlayerColor }> = ({ player }) => {
  const context = useMaterialContext()
  if (context.rules.game.rule?.id !== RuleId.WarSummary) return null
  const gains = getWarGains(context, player)
  return (
    <span css={[labelCss, gainsCss]}>
      <Amount value={gains.score} icon={legend} />
      {gains.gold > 0 && <Amount value={gains.gold} icon={gold} />}
    </span>
  )
}

const gainsCss = css`
  position: absolute;
  right: 0.6em;
  top: -1.2em;
  gap: 0.5em;
  padding: 0.15em 0.8em 0.05em;
  font-size: 0.7em;
`

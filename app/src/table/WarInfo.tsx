import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import shield from '../images/tokens/bouclier_rouge.png'
import { getKingdomScale, getKingdomSlotCoordinates, getMe, getWarPlayers, getWarRibbonPosition, isWarView } from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { colorStripCss, paper, paperBackgroundCss, rust, tagPaperCss } from '../theme/tableTheme'
import { getColor } from '../utils/color'
import { Sash } from './Sash'
import { TableAnchor } from './TableAnchor'

/**
 * In the neighbours view, under each kingdom: the Monarch's name in their colour and the strength of their front row
 * (plus ranged units, rulebook p.6). The central kingdom is the one displayed, in a larger ribbon. Once the wars are
 * fought, their outcome is told in banners beside (see WarResults).
 */
export const WarInfo: FC = () => {
  const context = useMaterialContext()
  if (!isWarView(context)) return null
  const war = new War(context.rules.game)
  const players = getWarPlayers(context)
  const center = players.length === 3 ? players[1] : players[0]
  return (
    <>
      {players.map((player, index) => (
        <WarKingdomInfo key={player} player={player} index={index} count={players.length} power={war.getPlayerPower(player)} central={player === center} me={player === getMe(context)} />
      ))}
      {players.map((player) => (
        <BackRowStamp key={player} player={player} />
      ))}
    </>
  )
}

/** The back row of a kingdom does not fight (rulebook p.6): a "Not fighting" band across it */
const BackRowStamp: FC<{ player: PlayerColor }> = ({ player }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const scale = getKingdomScale(context, player)
  const width = unitCardDescription.width * scale
  const height = unitCardDescription.height * scale
  const slots = [0, 1].map((x) => getKingdomSlotCoordinates(context, player, x, 1))
  const left = Math.min(...slots.map((slot) => slot.x)) - width / 2
  const right = Math.max(...slots.map((slot) => slot.x)) + width / 2
  const rect = { x: left, y: slots[0].y - height / 2, width: right - left, height }
  return <Sash rect={rect} label={t('war.back-row', 'Not fighting')} scale={scale * 1.15} angle={-6} />
}

type WarKingdomInfoProps = {
  player: PlayerColor
  index: number
  count: number
  power: number
  central: boolean
  me: boolean
}

const WarKingdomInfo: FC<WarKingdomInfoProps> = ({ player, index, count, power, central, me }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  const position = getWarRibbonPosition(index, count)
  return (
    <TableAnchor
      position={position}
      css={[tagPaperCss, colorStripCss(getColor(player).substring(0, 7)), infoCss, position.beside && besideCss, central && centralCss]}
    >
      <span>{me ? t('war.you', 'You') : name}</span>
      <span css={powerCss}>
        <img src={shield} alt="" />
        {power}
      </span>
    </TableAnchor>
  )
}

const infoCss = css`
  transform: translateX(-50%);
  gap: 0.8em;
  font-size: 1.1em;
`

// Beside the kingdom: anchored by its bottom right corner
const besideCss = css`
  transform: translate(-100%, -100%);
`

// The kingdom at the centre of the view, larger and on rust paper
const centralCss = css`
  font-size: 1.35em;
  ${paperBackgroundCss(rust, paper)};
`

const powerCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25em;

  img {
    height: 1.3em;
  }
`

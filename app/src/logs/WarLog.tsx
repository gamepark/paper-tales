import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * The start of the wars: the strength of every kingdom and the wars it wins, read on the game before they are fought
 */
export const WarLog: FC<MaterialLogProps> = ({ context }) => {
  const rules = new PaperTalesRules(context.game)
  const war = new War(context.game)
  return (
    <div>
      <Trans i18nKey="log.war" defaults="Wars" />
      <ul css={listCss}>
        {rules.players.map((player) => (
          <WarLine key={player} player={player} power={war.getPlayerPower(player)} won={war.getWarsWon(player)} />
        ))}
      </ul>
    </div>
  )
}

const WarLine: FC<{ player: PlayerColor; power: number; won: number }> = ({ player, power, won }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  return <li>{t('log.war.player', { defaultValue: '{player}: strength {power}, {count, plural, =0 {no war won} one {# war won} other {# wars won}}', player: name, power, count: won })}</li>
}

const listCss = css`
  margin: 0.2em 0 0;
  padding-left: 1.2em;
`

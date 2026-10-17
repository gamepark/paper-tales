import { css } from '@emotion/react'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useUnitName } from './useUnitName'

/** The units that die at the Age (rulebook p.8), read on the game before they leave the kingdoms */
export const AgeLog: FC<MaterialLogProps> = ({ context }) => {
  const { t } = useTranslation()
  const rules = new PaperTalesRules(context.game)
  const deaths = rules.players
    .map((player) => ({ player, units: new AgeHelper(context.game, player).dyingUnits.getItems<Unit>().map((unit) => unit.id) }))
    .filter(({ units }) => units.length > 0)
  return (
    <div>
      {t('log.age', 'Age: dead units')}
      {deaths.length ? (
        <ul css={listCss}>
          {deaths.map(({ player, units }) => (
            <DeathLine key={player} player={player} units={units} />
          ))}
        </ul>
      ) : (
        <div>{t('log.age.none', 'No unit dies')}</div>
      )}
    </div>
  )
}

const DeathLine: FC<{ player: PlayerColor; units: Unit[] }> = ({ player, units }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  const unitName = useUnitName()
  return <li>{t('log.age.dead', { defaultValue: '{player} loses {units}', player: name, units: units.map(unitName).join(', ') })}</li>
}

const listCss = css`
  margin: 0.2em 0 0;
  padding-left: 1.2em;
`

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { goldMoney } from '@gamepark/paper-tales/material/Gold'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const GoldCoinHelp: FC<MaterialHelpProps> = (props) => {
  const rules = useRules<PaperTalesRules>()!
  const { item } = props
  const { t } = useTranslation()
  const { location } = item
  const playerId = usePlayerId()
  const itsMe = playerId === item.location?.player
  const name = usePlayerName(item.location?.player)
  return (
    <>
      <h2 css={titleCss}>{t('gold.help.title')}</h2>
      <p>
        <Trans defaults="gold.help.text" values={{ place: item.location!.id }}>
          <strong/>
        </Trans>
      </p>
      {location?.type === LocationType.PlayerGoldStock && (
        <p>
          <Trans defaults={itsMe ? 'gold.help.you' : 'gold.help.player'} values={{ player: name, gold: goldMoney.count(rules.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(item.location?.player)) }}/>
        </p>
      )}
    </>
  )
}

const titleCss = css`
  margin-bottom: 0.5em !important;
`
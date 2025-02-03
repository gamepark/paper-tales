/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Effect } from '@gamepark/paper-tales/material/effects/Effect'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { unitCardCaracteristics, UnitPattern } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import {
  MaterialHelpProps,
  usePlayerId,
  usePlayerName,
  useRules,
} from '@gamepark/react-game'
import { FC, ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const PaperTalesCardHelp: FC<MaterialHelpProps> = (props) => {
  const { t } = useTranslation()
  const { item } = props
  const isFlipped = !!item.location?.rotation
  //const buy = useLegalMoves(move => !isFlipped && isMoveItemType(MaterialType.Unit)(move) && move.itemIndex === itemIndex && move.location.type === LocationType.PlayerDraftHand && !move.location.rotation)

  return (
    <>
      <h2 css={titleCss}>{isFlipped ? t('card.face-down') : t(`card.${item.id.front}`)}</h2>
      {!isFlipped && <VisibleCard {...props} />}
      <CardLocation {...props} />
    </>
  )
}

const VisibleCard: FC<MaterialHelpProps> = (props) => {
  //const { t } = useTranslation()
  const { item } = props
  if (!item.id.front) return null
  const characteristic: UnitPattern = unitCardCaracteristics[item.id.front]
  const effects = characteristic.effect

  return (
    <>
      {!!characteristic.cost && (
        <>
          <p>
            <span>
            <Trans defaults="card.cost" values={{ cost: characteristic.cost }}>
              <strong/>
            </Trans>
            </span>
          </p>
        </>
      )}

      {effects !== undefined && (
        <EffectList i18nKey="card.effect" effects={effects} getDescription={getEffectDescription}/>
      )}

    </>

  )
}

const EffectList: FC<{ i18nKey: string, effects: Effect[], getDescription: (effect: Effect) => any }> = (props) => {
  const { i18nKey, effects, getDescription } = props
  return (
    <>
      <p css={underlineCss}>
        <Trans defaults={i18nKey} values={{ effects: effects.length }}>
          <strong/>
        </Trans>
      </p>
      {effects.length === 1 && (
        <p css={listCss}>
          {getDescription(effects[0])}
        </p>
      )}
      {effects.length > 1 && (
        <ul css={listCss}>
          {effects.map((effect, i) => (
            <li key={i}>
              {getDescription(effect)}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

const CardLocation: FC<MaterialHelpProps> = (props) => {
  const { item: { location } } = props
  const rules = useRules<PaperTalesRules>()!
  const player = usePlayerId()
  const itsMine = player && player === location?.player
  const name = usePlayerName(location?.player)

  return (
    <p>
      {location?.type === LocationType.Deck && (
        <Trans defaults="card.deck" values={{
          number: rules.material(MaterialType.Unit).location(LocationType.Deck).locationId(location.id).length,
          place: location.id
        }}>
          <strong/>
        </Trans>
      )}
      {location?.type === LocationType.Discard && (
        <Trans defaults="card.discard" values={{
          number: rules.material(MaterialType.Unit).location(LocationType.Discard).locationId(location.id).length,
          place: location.id
        }}>
          <strong/>
        </Trans>
      )}
      {location?.type === LocationType.PlayerDraftHand && (
        location.rotation ?
          <Trans defaults="card.river.face-down"><strong/></Trans>
          : <Trans defaults="card.river"><strong/></Trans>
      )}
      {location?.type === LocationType.PlayerUnitBoard && (
        location.rotation ?
          <Trans defaults="card.river.face-down"><strong/></Trans>
          : <Trans defaults="card.river"><strong/></Trans>
      )}
      {location?.type === LocationType.PlayerUnitHand && <>
        <Trans defaults={itsMine ? 'card.tableau.you' : 'card.tableau.player'} values={{ player: name }}>
          <strong/>
        </Trans>
      </>}
    </p>
  )
}

const listCss = css`
  margin-top: 0 !important;

  > li {
    margin-bottom: 0.5em;
  }
`

const underlineCss = css`
  text-decoration: underline;
  margin-bottom: 0.7em !important;
`

const titleCss = css`
  margin-bottom: 0.5em !important;
`

const getEffectDescription = (effect: Effect): ReactElement => {
  switch (effect.type) {
 
  }
  return <></>
}


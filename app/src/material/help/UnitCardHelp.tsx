/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Effect, EffectType } from '@gamepark/paper-tales/material/effects/Effect'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { unitCardCaracteristics, UnitPattern } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import {
  MaterialHelpProps,
  Picture,
  usePlayerId,
  usePlayerName,
  useRules,
} from '@gamepark/react-game'
import { FC, ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

//import gold from '../images/tokens/Gold1.jpg'
import wood from '../../images/ressources/ressources_bois.png'
import food from '../../images/ressources/ressources_viande.png'
import diamond from '../../images/ressources/ressources_minerai.png'

export const PaperTalesCardHelp: FC<MaterialHelpProps> = (props) => {
  const { t } = useTranslation()
  const { item } = props
  const player = usePlayerId()
  const isFlipped = !!item.location?.rotation 
  || item.location?.type === LocationType.Deck 
  || item.location?.type === LocationType.Discard
  || (item.location?.player !== player && (item.location?.type === LocationType.PlayerDraftHand || item.location?.type === LocationType.PlayerUnitHand))
  //const buy = useLegalMoves(move => !isFlipped && isMoveItemType(MaterialType.Unit)(move) && move.itemIndex === itemIndex && move.location.type === LocationType.PlayerDraftHand && !move.location.rotation)

  return (
    <>
      <h2 css={titleCss}>{isFlipped ? t('card.face-down') : t(`card.${item.id}`)}</h2>
      {!isFlipped && <VisibleCard {...props} />}
      <CardLocation {...props} />
    </>
  )
}

const VisibleCard: FC<MaterialHelpProps> = (props) => {
  //const { t } = useTranslation()
  const { item } = props
  if (item.id === undefined) return null
  const characteristic: UnitPattern = unitCardCaracteristics[item.id]
  const effects = characteristic.effect

  return (
    <>
      {characteristic.cost !== undefined && (
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
        <EffectList i18nKey="card.effect.title" effects={effects} getDescription={getEffectDescription}/>
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
        <Trans defaults={itsMine ? 'card.player.draft.you' : 'card.player.draft.them'} values={{ player: name }}>
          <strong/>
        </Trans>
      )}
      {location?.type === LocationType.PlayerUnitBoard && (
        location.rotation ?
          <Trans defaults="card.player.board.face.down"><strong/></Trans>
          : <Trans defaults="card.player.board"><strong/></Trans>
      )}
      {location?.type === LocationType.PlayerUnitHand && <>
        <Trans defaults={itsMine ? 'card.player.hand.you' : 'card.player.hand.them'} values={{ player: name }}>
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

const mini = css`
  height: 1.05em;
  margin-bottom: -0.17em;
`

const getEffectDescription = (effect: Effect): ReactElement => {
  switch (effect.type) {
    case EffectType.ReplaceResourceByGold:
      if (effect.resource.length === 3){
        return (
          <>
            <Picture css={mini} src={wood}/>
            <Picture css={mini} src={food}/>
            <Picture css={mini} src={diamond}/>
            <Trans defaults="card.effect.replace.all.resources.by.gold"/>
          </>
        )
      } else if (effect.resource.includes(Resources.Wood)){
        return (
          <>
            <Picture css={mini} src={wood}/>
            <Trans defaults="card.effect.replace.wood.by.gold"/>
          </>
        )
      }
      return <></>
    case EffectType.AddWarPower:
      return (
        <>
          <Trans defaults="card.effect.add.war.power"/>
        </>
      )

    case EffectType.CantWar:
      return (
        <>
          <Trans defaults="card.effect.cant.war"/>
        </>
      )

    case EffectType.ChangeWarPower:

    case EffectType.GainAgeToken:

    case EffectType.GainAgeTokenOnChosenUnit:

    case EffectType.GainTokenIfDying:

    case EffectType.GainTokenIfWinWar:

    case EffectType.GainTokenOnDeploy:

    case EffectType.IgnoreFieldCost:

    case EffectType.ImproveBuilding:

    case EffectType.IncomeIfAgeToken:

    case EffectType.IncomePerResource:

    case EffectType.MysticEffect:

    case EffectType.RelicEffect:

    case EffectType.ReplaceResourceByGold:

    case EffectType.ScoreAtWar:

    case EffectType.Shapeshifter:

    case EffectType.SpecialDyingCondition:

    case EffectType.WarFromBacklane:

  }
  return <></>
}


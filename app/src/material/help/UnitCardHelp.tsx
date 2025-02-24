/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Effect, EffectType, WhichUnit } from '@gamepark/paper-tales/material/effects/Effect'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { ResourcesCondition, unitCardCaracteristics, UnitPattern } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import {
  MaterialHelpProps,
  Picture,
  PlayMoveButton,
  useLegalMove,
  usePlayerId,
  usePlayerName,
  useRules,
} from '@gamepark/react-game'
import { FC, ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import gold from '../../images/tokens/Gold1.jpg'
import wood from '../../images/ressources/ressources_bois.png'
import food from '../../images/ressources/ressources_viande.png'
import diamond from '../../images/ressources/ressources_minerai.png'
import scoreIcon from '../../images/score/scoreIcon.png'
import ageToken from '../../images/tokens/Age.jpg'
import { howManyCardCopies } from '@gamepark/paper-tales/material/Unit'
import { isCustomMoveType } from '@gamepark/rules-api'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'

export const PaperTalesCardHelp: FC<MaterialHelpProps> = (props) => {
  const { t } = useTranslation()
  const { item } = props
  const player = usePlayerId()
  const unitIndex = props.itemIndex!
  const isFlipped = !!item.location?.rotation
    || item.location?.type === LocationType.Deck
    || item.location?.type === LocationType.Discard
    || (item.location?.player !== player && (item.location?.type === LocationType.PlayerDraftHand || item.location?.type === LocationType.PlayerUnitHand))
  //const buy = useLegalMoves(move => !isFlipped && isMoveItemType(MaterialType.Unit)(move) && move.itemIndex === itemIndex && move.location.type === LocationType.PlayerDraftHand && !move.location.rotation)

  console.log("index : ", unitIndex)

  const chooseWhereToPlaceTokenMove = useLegalMove((move) => isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move) && move.data.unitIndex === unitIndex)
  console.log(chooseWhereToPlaceTokenMove)

  return (
    <>
      <h2 css={titleCss}>{isFlipped ? t('card.face-down') : t(`card.${item.id}`)}</h2>
      {!isFlipped && <VisibleCard {...props} />}
      <CardLocation {...props} />
      <PlayMoveButton move={chooseWhereToPlaceTokenMove}></PlayMoveButton>
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
                <strong />
              </Trans>
            </span> &nbsp;
            <span>
              <Trans defaults="card.copies.number" values={{ copies: howManyCardCopies(item.id) }}>
                <strong />
              </Trans>
            </span>
            <span>
              <Trans defaults="card.power" values={{ power: howManyCardCopies(characteristic.power) }}>
                <strong />
              </Trans>
            </span>
          </p>
          {characteristic.resources !== undefined &&
            <ResourcesHelp _i18nKey="card.effect.resources" resources={characteristic.resources.type} conditions={characteristic.resources.condition} />
          }
        </>
      )}


      {effects !== undefined && (
        <EffectList i18nKey="card.effect.title" effects={effects} getDescription={getEffectDescription} />
      )}

    </>

  )
}

const ResourcesHelp: FC<{ _i18nKey: string, resources: Resources[], conditions: ResourcesCondition | undefined }> = (props) => {
  const { resources } = props
  const resourcesPictures = resources.map((res, i) => {
    switch (res) {
      case Resources.Diamond:
        return <Picture key={i} css={mini} src={diamond} />
      case Resources.Food:
        return <Picture key={i} css={mini} src={food} />
      case Resources.Wood:
        return <Picture key={i} css={mini} src={wood} />
      default:
        return <Picture key={i} css={mini} src={gold} />
    }
  })
  return (
    <>
      <p>
        <Trans defaults="card.resources"></Trans> &nbsp;

        {resourcesPictures.map((pict) => (
          <span>{pict} </span>
        ))}
      </p>
    </>
  )
}

const EffectList: FC<{ i18nKey: string, effects: Effect[], getDescription: (effect: Effect) => any }> = (props) => {
  const { i18nKey, effects, getDescription } = props
  return (
    <>
      <p css={underlineCss}>
        <Trans defaults={i18nKey} values={{ effects: effects.length }}>
          <strong />
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
          <strong />
        </Trans>
      )}
      {location?.type === LocationType.Discard && (
        <Trans defaults="card.discard" values={{
          number: rules.material(MaterialType.Unit).location(LocationType.Discard).locationId(location.id).length,
          place: location.id
        }}>
          <strong />
        </Trans>
      )}
      {location?.type === LocationType.PlayerDraftHand && (
        <Trans defaults={itsMine ? 'card.player.draft.you' : 'card.player.draft.them'} values={{ player: name }}>
          <strong />
        </Trans>
      )}
      {location?.type === LocationType.PlayerUnitBoard && (
        location.rotation ?
          <Trans defaults="card.player.board.face.down"><strong /></Trans>
          : <Trans defaults="card.player.board"><strong /></Trans>
      )}
      {location?.type === LocationType.PlayerUnitHand && <>
        <Trans defaults={itsMine ? 'card.player.hand.you' : 'card.player.hand.them'} values={{ player: name }}>
          <strong />
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
      if (effect.resource.length === 3) {
        return (
          <>
            <Picture css={mini} src={wood} />
            <Picture css={mini} src={food} />
            <Picture css={mini} src={diamond} />
            <Trans defaults="card.effect.replace.all.resources.by.gold" />
          </>
        )
      } else if (effect.resource.includes(Resources.Wood)) {
        return (
          <>
            <Picture css={mini} src={wood} />
            <Trans defaults="card.effect.replace.wood.by.gold" />
          </>
        )
      }
      return <></>
    case EffectType.AddWarPower:
      return (
        <>
          <Trans defaults="card.effect.add.war.power" />
        </>
      )

    case EffectType.CantWar:
      return (
        <>
          <Trans defaults="card.effect.cant.war" />
        </>
      )

    case EffectType.ChangeWarPower:
      return (
        <>
        </>
      )

    case EffectType.GainAgeToken:
      const isGainAgeOnDeploy = effect.onDeployment === true && <Trans defaults="gain.token.on.deploy" />
      const whichUnit = effect.whichUnit === WhichUnit.Others
        ? <Trans defaults="gain.token.gain.age.others" />
        : effect.whichUnit === WhichUnit.Myself
          ? <Trans defaults="gain.token.gain.age.myself" />
          : <Trans defaults="gain.token.gain.age.all" />
      const ageTokenyPicture = <Picture css={mini} src={ageToken} />
      const gainAgeTokenBase = <Trans defaults="gain.token.base" values={{ count: effect.amount }} />
      return (
        <>
          {isGainAgeOnDeploy} {gainAgeTokenBase} {ageTokenyPicture} {whichUnit}
        </>
      )

    case EffectType.GainAgeTokenOnChosenUnit:
      return (
        <>
        </>
      )
    case EffectType.GainTokenIfDying:
      return (
        <>
        </>
      )
    case EffectType.GainTokenIfWinWar:
      const gainTokenIfWinWarPicture = <Picture css={mini} src={effect.token === MaterialType.Gold ? gold : scoreIcon} />
      const gainTokenIfWinWarBaseText = <Trans defaults="card.effect.gain.if.win.war" />
      const gainTokenIfWinWarScoringConditionText = effect.perResource !== undefined
        && <Trans defaults="score.at.war.per.resource" values={{ score: effect.amount }} />
      return (
        <>
          {gainTokenIfWinWarBaseText} {gainTokenIfWinWarPicture}
          {gainTokenIfWinWarScoringConditionText}
        </>
      )
    case EffectType.GainTokenOnDeploy:
      const isOnDeploy = effect.onDeployment === true && <Trans defaults="gain.token.on.deploy" />
      const isOnLevel2Builds = effect.perLevel2Builds === true && <Trans defaults="gain.token.on.deploy.on.lvl2.builds" />
      const gainTokenOnDeployPicture = <Picture css={mini} src={effect.token === MaterialType.Gold ? gold : scoreIcon} />
      const gainTokenOnDeployBase = <Trans defaults="gain.token.on.deploy.base" values={{ score: effect.amount }} />
      return (
        <>
          {isOnDeploy} {gainTokenOnDeployBase} {gainTokenOnDeployPicture} {isOnLevel2Builds}
        </>
      )
    case EffectType.IgnoreFieldCost:
      return (
        <>
          <Trans defaults="card.effect.ignore.field.cost" />
        </>
      )
    case EffectType.ImproveBuilding:
      const isImproveBuildingOnDeploy = effect.onDeployment === true && <Trans defaults="card.effect.improve.building.on.deploy" />
      return (
        <>
          {isImproveBuildingOnDeploy}
        </>
      )
    case EffectType.Income:
      return (
        <>
          <Trans defaults="card.effect.income.base" values={{ income: effect.amount }} />
        </>
      )
    case EffectType.IncomeIfAgeToken:
      return (
        <>
        </>
      )
    case EffectType.IncomePerResource:
      return (
        <>
        </>
      )
    case EffectType.MysticEffect:
      return (
        <>
          <Trans defaults="card.effect.mystic.effect" />
        </>
      )
    case EffectType.RelicEffect:
      return (
        <>
        </>
      )
    case EffectType.ScoreAtWar:
      const scoreAtWarBaseText = <Trans defaults="card.effect.score.at.war" />
      const scoringConditionText = effect.perResource !== undefined
        ? <Trans defaults="score.at.war.per.resource" values={{ score: effect.amount }} />
        : effect.perUnitStrongerThan !== undefined
          ? <Trans defaults="score.at.war.stronger.than" values={{ score: effect.amount, strongerThan: effect.perUnitStrongerThan }} />
          : <Trans defaults="" values={{ score: effect.amount }} />
      return (
        <>
          {scoreAtWarBaseText}
          {scoringConditionText}
        </>
      )

    case EffectType.Shapeshifter:
      return (
        <>
          <Trans defaults="card.effect.shapeshifter" />
        </>
      )
    case EffectType.SpecialDyingCondition:
      return (
        <>
        </>
      )
    case EffectType.WarFromBacklane:
      return (
        <>
        </>
      )
  }
  return <></>
}


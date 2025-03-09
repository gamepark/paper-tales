/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { MaterialHelpProps, Picture, usePlayerId, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import gold from '../../images/tokens/Gold1.jpg'
import wood from '../../images/ressources/ressources_bois.png'
import food from '../../images/ressources/ressources_viande.png'
import diamond from '../../images/ressources/ressources_minerai.png'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { Building } from '@gamepark/paper-tales/material/Building'

export const BuildingHelp: FC<MaterialHelpProps> = (props) => {
  //const rules = useRules<PaperTalesRules>()!
  const { item } = props
  const { t } = useTranslation()
  const isLevel2 = item.location?.rotation === true
  const isBuilt = item.location?.type === LocationType.PlayerBuildingBoard
  const caracteristics = buildingCardCaracteristics[item.id]
  const mine = item.id === Building.Mine
  const temple = item.id === Building.Temple
  const tavern = item.id === Building.Tavern
  const town = item.id === Building.Town
  const barracks = item.id === Building.Barracks

  return (
    <>
      <h2 css={titleCss}>{t('building.help.title')}</h2>
      <GetLocationText {...props} />
      {isBuilt && <p><Trans defaults={isLevel2 ? 'build.lvl2' : 'build.lvl1.player'} /></p>}


      {mine && <ResourcesHelp _i18nKey="card.effect.resources1" resources={caracteristics.resources1} />}
      {/* {mine && TODO Construction N1} */}
      {mine && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost1} />}
      {/* {mine && TODO Construction N2} */}
      {mine && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost2} />}

      {/* {mine && TODO Symbole Phase 3} */}
      {/* {mine && TODO Symbole 2 PV} */}
      {mine && <Trans defaults="level.two.effect.one.mine" />}
      {/* {mine && TODO Symbole diamant} */}
      {mine && <Trans defaults="level.two.effect.two.mine" />}


      {/* {temple && TODO Construction N1} */}
      {temple && <ResourcesHelp _i18nKey="card.effect.resources1" resources={caracteristics.cost1} />}
      {/* TODO : Diamant OU Or (cost) */}
      {/* {temple && TODO Construction N2} */}

      {temple && <ResourcesHelp _i18nKey="card.effect.resources1" resources={caracteristics.cost2} />}
      {/* {temple && phase 4 */}
      {/* {temple && 2 or} */}
      {/* {temple && phase 3 */}
      {/* {temple && 2PV */}




      {/* {tavern && TODO Construction N1} */}
      {tavern && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost1} />}
      {/* {tavern && TODO Construction N2} */}
      {tavern && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost2} />}
      {/* {tavern && Phase 4 } */}
      {/* {tavern && 1 or } */}
      {tavern && <Trans defaults="effect.one.tavern" />}
      {/* {tavern && viande} */}
      {tavern && <Trans defaults="effect.two.tavern" />}
      {/* {tavern && phase 3} */}
      {/* {tavern && 1 PV } */}
      {tavern && <Trans defaults="effect.one.tavern" />}
      {/* {tavern && viande} */}
      {tavern && <Trans defaults="effect.two.tavern" />}


      {/* {town && TODO Construction N1} */}
      {town && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost1} />}
      {/* {town && TODO Construction N2} */}
      {town && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost2} />}
      {town && <ResourcesHelp _i18nKey="card.effect.resources1" resources={caracteristics.resources1} />}
      {town && <ResourcesHelp _i18nKey="card.effect.resources2" resources={caracteristics.resources2} />}



      {/* {barracks && TODO Construction N1} */}
      {barracks && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost1} />}
      {/* {barracks && TODO Construction N2} */}
      {barracks && <ResourcesHelp _i18nKey="card.cost" resources={caracteristics.cost2} />}
      {/* {barrack && Phase 3 } */}
      {/* {barracks && 1 atk } */}
      {barracks && <Trans defaults="effect.one.barracks" />}
      {/* {barracks && bois} */}
      {barracks && <Trans defaults="effect.two.barracks" />}
      {/* {barracks && phase 3} */}
      {/* {barracks && 1 PV } */}
      {barracks && <Trans defaults="effect.three.barracks" />}
      {/* {barracks && combat 3+} */}
      {barracks && <Trans defaults="effect.four.barracks" />}


    </>
  )
}

const GetLocationText: FC<MaterialHelpProps> = (props) => {
  //const { t } = useTranslation()
  const { item } = props
  const { location } = item
  const playerId = usePlayerId()

  const itsMe = playerId === item.location?.player
  const name = usePlayerName(item.location?.player)

  return (
    <>
      {location?.type === LocationType.PlayerBuildingHand && (
        <p>
          <Trans defaults={itsMe ? 'build.hand.you' : 'build.hand.player'} values={{ player: name }} />
        </p>
      )}

      {location?.type === LocationType.PlayerBuildingBoard && (
        <p>
          <Trans defaults={itsMe ? 'build.board.you' : 'build.board.player'} values={{ player: name }} />
        </p>
      )}

    </>

  )
}

const ResourcesHelp: FC<{ _i18nKey: string, resources: Resources[] }> = (props) => {
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

const titleCss = css`
  margin-bottom: 0.5em !important;
`

const mini = css`
  height: 1.05em;
  margin-bottom: -0.17em;
`
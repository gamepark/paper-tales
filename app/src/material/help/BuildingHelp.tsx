/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialHelpProps, usePlayerId, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const BuildingHelp: FC<MaterialHelpProps> = (props) => {
  //const rules = useRules<PaperTalesRules>()!
  //const { item } = props
  const { t } = useTranslation()
  return (
    <>
      <h2 css={titleCss}>{t('building.help.title')}</h2>
      <GetLocationText {...props} />
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
          <Trans defaults={itsMe ? 'build.hand.you' : 'build.hand.player'} values={{ player: name }}/>
        </p>
      )}

        {location?.type === LocationType.PlayerBuildingBoard && (
        <p>
          <Trans defaults={itsMe ? 'build.board.you' : 'build.board.player'} values={{ player: name }}/>
        </p>
      )}
  
      </>
  
    )
  }

const titleCss = css`
  margin-bottom: 0.5em !important;
`
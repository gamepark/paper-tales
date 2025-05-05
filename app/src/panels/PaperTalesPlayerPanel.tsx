/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { ScoreHelper } from '@gamepark/paper-tales/rules/helpers/ScoreHelper'
import { Player } from '@gamepark/react-client'
import { CounterProps, StyledPlayerPanel, useFocusContext, usePlayerId, useRules } from '@gamepark/react-game'
import { FC, HTMLAttributes, useEffect, useMemo } from 'react'
import wood from '../images/ressources/ressources_bois.png'
import diamond from '../images/ressources/ressources_minerai.png'
import food from '../images/ressources/ressources_viande.png'
import shield from '../images/tokens/bouclier_rouge.png'
import gold from '../images/tokens/Gold1.jpg'
import { scoreTokenDescription } from '../material/ScoreTokenDescription'

type PaperTalesPlayerPanelProps = {
  player: Player<PlayerColor>
  index: number
  color: string
} & HTMLAttributes<HTMLDivElement>

export const PaperTalesPlayerPanel: FC<PaperTalesPlayerPanelProps> = (props) => {
  const { player, color, ...rest } = props
  const rules = useRules<PaperTalesRules>()!
  const scoreHelper = useMemo(() => new ScoreHelper(rules.game, player.id), [rules.game, player.id])
  const resourcesHelper = useMemo(() => new ResourcesHelper(rules.game, player.id), [rules.game, player.id])
  const buildHelper = useMemo(() => new BuildHelper(rules.game, player.id), [rules.game, player.id])
  const war = useMemo(() => new War(rules.game), [rules.game])
  const isTutorial = rules.game.tutorial !== undefined
  const { setFocus } = useFocusContext()
  const playerId = usePlayerId()
  const mine = playerId && playerId === player.id
  const focusPlayer = () => {
    setFocus({
      materials: [rules.material(MaterialType.Unit).player(player.id), rules.material(MaterialType.Building).player(player.id)],
      staticItems: [],
      locations: [
        { type: LocationType.PlayerUnitBoard, player: player.id, x: 0, y: 0 },
        { type: LocationType.PlayerUnitBoard, player: player.id, x: 2, y: 0 },
        { type: LocationType.PlayerUnitBoard, player: player.id, x: 1, y: 1 }
      ],
      margin: {
        left: mine ? 20 : 2,
        right: 2,
        top: rules.game.players.length === 2 ? 17 : 2,
        bottom: 2
      },
      animationTime: 500
    })
  }

  useEffect(() => {
    if (mine && !isTutorial) {
      setTimeout(focusPlayer, 2000)
    }
  }, [mine, playerId, setFocus, isTutorial])

  const counters: CounterProps[] = [
    {
      image: scoreTokenDescription.images[player.id],
      value: scoreHelper.score
    },
    {
      image: wood,
      value: resourcesHelper.getResource(Resources.Wood)
    },
    {
      image: food,
      value: resourcesHelper.getResource(Resources.Food)
    },
    {
      image: diamond,
      value: resourcesHelper.getResource(Resources.Diamond)
    },
    {
      image: gold,
      value: buildHelper.gold,
      imageCss: css`
        border-radius: 100%;
      `
    },
    {
      image: shield,
      value: war.getPlayerPower(player.id)
    }
  ]

  return (
    <StyledPlayerPanel
      activeRing
      onClick={focusPlayer}
      player={player}
      counters={counters}
      countersPerLine={2}
      css={[canClick, colorBG(color)]}
      timerOnRight={false}
      {...rest}
    />
  )
}

const canClick = css`
  cursor: pointer;
`

const colorBG = (color: string) => css`
  background-color: rgba(${getColor(color)});
`

function getColor(color: string): string {
  switch (color) {
    case 'yellow':
      return '248, 210, 22, 0.8'
    case 'black':
      return '0, 0, 0, 1'
    case 'blue':
      return '26, 94, 170, 0.8'
    case 'red':
      return '228, 3, 44, 0.8'
    case 'green':
      return '0, 153, 88, 0.8'
    case 'purple':
      return '118, 37, 131, 0.8'
    case 'white':
      return '240, 240, 240, 0.8'
  }
  return ''
}

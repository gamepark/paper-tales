/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { ScoreHelper } from '@gamepark/paper-tales/rules/helpers/ScoreHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { Player } from '@gamepark/react-client'
import { CounterProps, StyledPlayerPanel, useFocusContext, useRules } from '@gamepark/react-game'
import { FC, HTMLAttributes, useCallback, useMemo } from 'react'
import gold from '../images/tokens/Gold1.jpg'
import wood from '../images/ressources/ressources_bois.png'
import food from '../images/ressources/ressources_viande.png'
import diamond from '../images/ressources/ressources_minerai.png'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import shield from '../images/tokens/bouclier_rouge.png'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { War } from '@gamepark/paper-tales/rules/3_War/War'

type PaperTalesPlayerPanelProps = {
  player: Player,
  index: number,
  color:string, 
} & HTMLAttributes<HTMLDivElement>

export const PaperTalesPlayerPanel: FC<PaperTalesPlayerPanelProps> = (props) => {
  const { player, index, color, ...rest } = props
  const rules = useRules<PaperTalesRules>()!
  const scoreHelper = useMemo(() => new ScoreHelper(rules.game, player.id), [rules.game, player.id])
  const ressourcesHelper = useMemo(() => new ResourcesHelper(rules.game, player.id), [rules.game, player.id])
  const buildHelper = useMemo(() => new BuildHelper(rules.game, player.id), [rules.game, player.id])
  const war = useMemo(() => new War(rules.game), [rules.game, player.id])

  const { setFocus } = useFocusContext()
  const isBottomPlayers = rules.players.length === 5 ? (index === 0 || index === 4) : (rules.players.length === 4 ? (index === 0 || index === 3) : index === 0)
  const focusPlayer = useCallback(() => {
    setFocus({
      materials: [],
      staticItems: [],
      locations: [],
      margin: {
        left: (!isBottomPlayers && rules.players.length === 5) ? 17 : 0,
        top: rules.players.length === 2 ? 6 : 1,
        bottom: 1
      },
      animationTime: 500
    })
  }, [rules, player, setFocus])

  const counters: CounterProps[] = [{
    image: '',
    value: scoreHelper.getScore(player.id)
  },
  {
    image: wood,
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, Resources.Wood) 
  },
  {
    image: food,
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, Resources.Food) 
  },
  {
    image: diamond,
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, Resources.Diamond) 
  },
  {
    image: gold, 
    value: buildHelper.getPlayerGold(player.id),
    imageCss:css`border-radius:100%;`
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

const colorBG = (color:string) => css`
  background-color: rgba(${getColor(color)})
`

function getColor(color:string):string {
 switch (color){
  case 'yellow':
    return "248, 210, 22, 0.8"

  case 'black':
    return "0, 0, 0,0.6"
 }
 return ""
}
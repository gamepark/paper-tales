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

type PaperTalesPlayerPanelProps = {
  player: Player,
  index: number
} & HTMLAttributes<HTMLDivElement>

export const PaperTalesPlayerPanel: FC<PaperTalesPlayerPanelProps> = (props) => {
  const { player, index, ...rest } = props
  const rules = useRules<PaperTalesRules>()!
  const scoreHelper = useMemo(() => new ScoreHelper(rules.game, player.id), [rules.game, player.id])
  const ressourcesHelper = useMemo(() => new ResourcesHelper(rules.game, player.id), [rules.game, player.id])


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
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, 1) 
  },
  {
    image: food,
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, 2) 
  },
  {
    image: diamond,
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, 3) 
  },

  {
    image: gold, 
    value: ressourcesHelper.getPlayerOneTypeResource(player.id, 4) 
  }
]

  return (
    <StyledPlayerPanel
      activeRing
      onClick={focusPlayer}
      player={player}
      counters={counters}
      backgroundImage={panelBackgrounds[player.id]}
      countersPerLine={3}
      css={canClick}
      {...rest}
    />
  )
}

const canClick = css`
  cursor: pointer;
`

const panelBackgrounds = {
}
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { ScoreHelper } from '@gamepark/paper-tales/rules/helpers/ScoreHelper'
import { Player } from '@gamepark/react-client'
import { CounterProps, StyledPlayerPanel, useFocusContext, useRules } from '@gamepark/react-game'
import { FC, HTMLAttributes, useCallback, useMemo } from 'react'

type PaperTalesPlayerPanelProps = {
  player: Player,
  index: number
} & HTMLAttributes<HTMLDivElement>

export const PaperTalesPlayerPanel: FC<PaperTalesPlayerPanelProps> = (props) => {
  const { player, index, ...rest } = props
  const rules = useRules<PaperTalesRules>()!
  const scoreHelper = useMemo(() => new ScoreHelper(rules.game, player.id), [rules.game, player.id])

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
  }]

  return (
    <StyledPlayerPanel
      activeRing
      onClick={focusPlayer}
      player={player}
      counters={counters}
      backgroundImage={panelBackgrounds[player.id]}
      countersPerLine={2}
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
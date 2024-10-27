/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { ScoreHelper } from '@gamepark/paper-tales/rules/helpers/ScoreHelper'
import { Avatar, PlayerTimer, SpeechBubbleDirection, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'


type FarawayPlayerPanelProps = {
    player: number
    players: number
} & HTMLAttributes<HTMLDivElement>

export const TarotPlayerPanel: FC<FarawayPlayerPanelProps> = ({ player, players, ...props }) => {
    const playerName = usePlayerName(player)
    const playerId = usePlayerId()
    const position = (-player + (playerId ?? 1) + players) % players + 1
    const long = position === 1 || (players === 4 && position === 3)
    const direction = speechBubbleDirection(position, players)
    const { t } = useTranslation()
    const rules = useRules<PaperTalesRules>()!
    const scoreHelper =  new ScoreHelper(rules.game, player)
    const getScore = scoreHelper.getScore(player)  

    return (
        <div  {...props}>
            <Avatar css={avatarStyle} playerId={player} speechBubbleProps={{ direction, css: bubbleCss }}>
            </Avatar>
            <h2 css={[nameStyle]}>{playerName}</h2>
            <Timer player={player} long={long} />
            <span css={[scoreCss, long ? scoreLongCss : scoreShortCss]}>{t('points', { score: getScore })}</span>

        </div>
    )
}

const Timer = ({ player, long }: { player: number, long: boolean }) => {
    const rules = useRules<PaperTalesRules>()

    if (rules?.isOver()) return null

    return <PlayerTimer playerId={player} css={[timerCss, long ? timerLongCss : timerShortCss]} />
}





const speechBubbleDirection = (position: number, players: number) => {
    switch (position) {
        case 1:
        case 2:
            return players === 3 ? SpeechBubbleDirection.BOTTOM_LEFT : SpeechBubbleDirection.TOP_LEFT
        case 3:
            return players === 3 ? SpeechBubbleDirection.BOTTOM_RIGHT : SpeechBubbleDirection.BOTTOM_LEFT
        case 4:
            return players === 4 ? SpeechBubbleDirection.TOP_RIGHT : SpeechBubbleDirection.BOTTOM_RIGHT
        default:
            return SpeechBubbleDirection.TOP_RIGHT
    }
}




const avatarStyle = css`
  position: absolute;
  top: -0.1em;
  left: 0;
  border-radius: 100%;
  height: 6em;
  width: 6em;
  color: black;
  z-index: 1;
`

const nameStyle = css`
  position: absolute;
  top: 0.5em;
  left: 3em;
  max-width: 9.5em;
  font-size: 2.4em;
  margin: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const timerCss = css`
  position: absolute;
  left: initial;
  right: 4.1em;
  font-size: 2.5em;
`

const timerLongCss = css`
  top: 0.6em;
  left: 12em;
`

const timerShortCss = css`
  top: 2em;
  left: 2.9em;
`


const scoreCss = css`
  position: absolute;
  font-size: 2.5em;
`

const scoreLongCss = css`
  top: 0.6em;
  left: initial;
  right: 0.25em;
`

const scoreShortCss = css`
  top: 2em;
  left: initial;
  right: 1em;
`

const bubbleCss = css`box-shadow: 0 0 0.1em black;`


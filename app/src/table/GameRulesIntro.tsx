import { css, Interpolation, Theme, useTheme } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { GameTheme, RulesDialog, useMaterialContext } from '@gamepark/react-game'
import { FC, useState } from 'react'
import { getMe, getRound, hasGameRules, isSpectator } from '../locators/TableLayout'
import { GameRulesHelp } from '../material/help/GameRulesHelp'

/**
 * The rules proper to this game, told once to each Monarch before their first choice: as long as they have kept no card
 * of the first turn. Nothing to remember: a reload before that choice tells them again, and after it, never.
 */
export const GameRulesIntro: FC = () => {
  const theme = useTheme() as GameTheme
  const context = useMaterialContext()
  const [closed, setClosed] = useState(false)
  const firstChoice =
    !isSpectator(context) &&
    getRound(context) === 1 &&
    context.rules.game.rule?.id === RuleId.Draft &&
    !context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(getMe(context)).length
  const [told] = useState(firstChoice && hasGameRules(context))
  if (!told) return null
  return (
    <RulesDialog open={!closed} close={() => setClosed(true)}>
      <div css={[layoutCss, theme.dialog.helpLayout as Interpolation<Theme>]}>
        <div css={[contentCss, theme.dialog.content as Interpolation<Theme>]}>
          <GameRulesHelp />
        </div>
      </div>
    </RulesDialog>
  )
}

/** The layout the framework gives to the help of a location (LocationRulesDialogContent, which it does not export) */
const layoutCss = css`
  display: flex;
  padding: 3em 1em 3em 3em;
  max-width: inherit;
  max-height: inherit;
`

const contentCss = css`
  margin: 0 0.5em;
  padding: 0 0.5em;
  font-size: 2.4em;
  overflow: auto;
  flex: 1;
`

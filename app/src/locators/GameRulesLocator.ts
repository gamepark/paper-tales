import { Locator } from '@gamepark/react-game'
import { GameRulesHelp } from '../material/help/GameRulesHelp'

/** The rules proper to this game: nothing on the table, only their help page (see GameRulesButton) */
class GameRulesLocator extends Locator {
  help = GameRulesHelp
}

export const gameRulesLocator = new GameRulesLocator()

import { Locator } from '@gamepark/react-game'
import { ExpansionRulesHelp } from '../material/help/ExpansionRulesHelp'

/** The rules of the expansions played: nothing on the table, only their help page (see ExpansionRulesButton) */
class ExpansionRulesLocator extends Locator {
  help = ExpansionRulesHelp
}

export const expansionRulesLocator = new ExpansionRulesLocator()

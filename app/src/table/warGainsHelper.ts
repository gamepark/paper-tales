import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War, WarStrengths } from '@gamepark/paper-tales/rules/3_War/War'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext } from '@gamepark/react-game'
import { isWarView } from '../locators/TableLayout'

/** The gains of the wars of a Monarch, computed by the rule that awards them, with the strengths the wars were fought with */
export const getWarGains = (context: MaterialContext, player: PlayerColor) =>
  new War(context.rules.game).getWarGains(player, context.rules.remind<WarStrengths | undefined>(Memory.WarStrengths))

/** The wars are fought and read: their gains are told until their summary is over */
export const isWarGainsShown = (context: MaterialContext) =>
  [RuleId.War, RuleId.WarSummary].includes(context.rules.game.rule?.id as RuleId) && isWarView(context)

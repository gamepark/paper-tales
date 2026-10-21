import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { BuildAction, BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialLogProps } from '@gamepark/react-game'
import { EndPlayerTurn, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { GoldValueIcon } from '../material/help/book/HelpIcons'
import { deployEffectSource } from './logHelpers'
import { BuildingLink, CardLink } from './CardLink'
import { Who } from './Who'

/**
 * A construction (rulebook p.7): a Building built at level 1, directly at level 2, or upgraded, with the gold it costs.
 * A Building improved or built by a "when revealed" effect (the Golem, the Djinn, the Titan) tells the card instead.
 */
export const BuildLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const item = new PaperTalesRules(context.game).material(MaterialType.Building).getItem<Building>(move.itemIndex)
  const player = move.location.player as PlayerColor
  const action = item.location.type !== LocationType.PlayerBuildingHand ? BuildAction.Upgrade : move.location.rotation ? BuildAction.BuildLevel2 : BuildAction.BuildLevel1
  const key = buildKeys[action]
  const byEffect = context.game.rule?.id === RuleId.DeployEffects
  const source = byEffect ? deployEffectSource(context.game, player) : undefined
  const gold = byEffect ? 0 : (new BuildHelper(context.game, player).getGoldToPay(item.id, action) ?? 0)
  const components = {
    who: <Who player={player} />,
    building: <BuildingLink building={item.id} />,
    g: <GoldValueIcon value={gold} />,
    source: source !== undefined ? <CardLink card={source} /> : <></>
  }
  if (source !== undefined) return <Trans i18nKey={`${key.i18nKey}.effect`} defaults={`${key.defaults} thanks to <source/>`} components={components} />
  if (gold) return <Trans i18nKey={`${key.i18nKey}.paid`} defaults={`${key.defaults} for <g/>`} components={components} />
  return <Trans i18nKey={key.i18nKey} defaults={key.defaults} components={components} />
}

const buildKeys: Record<BuildAction, { i18nKey: string; defaults: string }> = {
  [BuildAction.BuildLevel1]: { i18nKey: 'log.build', defaults: '<who/> builds <building/>' },
  [BuildAction.BuildLevel2]: { i18nKey: 'log.build.level2', defaults: '<who/> builds <building/> directly at level 2' },
  [BuildAction.Upgrade]: { i18nKey: 'log.upgrade', defaults: '<who/> upgrades <building/> to level 2' }
}

/** A Monarch who passes the construction (rulebook p.7) */
export const NoBuildLog: FC<MaterialLogProps<EndPlayerTurn>> = ({ move }) => (
  <Trans i18nKey="log.build.none" defaults="<who/> builds nothing" components={{ who: <Who player={move.player as PlayerColor} /> }} />
)

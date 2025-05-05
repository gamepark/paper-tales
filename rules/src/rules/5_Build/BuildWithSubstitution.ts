import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { Resources } from '../../material/Resources'
import { BuildHelper } from '../helpers/BuildHelper'

export class BuildWithSubstitution extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  getMissingResourcesForBuilding(playerResources: Resources[], buildCost: Resources[]): Resources[] {
    const woodCost = buildCost.filter((resource) => resource === Resources.Wood).length
    const foodCost = buildCost.filter((resource) => resource === Resources.Food).length
    const diamondCost = buildCost.filter((resource) => resource === Resources.Diamond).length

    const playerWood = playerResources.filter((resources) => resources === Resources.Wood).length
    const playerFood = playerResources.filter((resources) => resources === Resources.Food).length
    const playerDiamond = playerResources.filter((resources) => resources === Resources.Diamond).length

    const deltaWood = woodCost - playerWood
    const deltaFood = foodCost - playerFood
    const deltaDiamond = diamondCost - playerDiamond

    const missingWood: Resources[] = deltaWood > 0 ? [...Array(deltaWood).fill(Resources.Wood)] : []
    const missingFood: Resources[] = deltaFood > 0 ? [...Array(deltaFood).fill(Resources.Food)] : []
    const missingDiamond: Resources[] = deltaDiamond > 0 ? [...Array(deltaDiamond).fill(Resources.Diamond)] : []

    return [...missingWood, ...missingFood, ...missingDiamond]
  }

  canBuildWithSubstitution(playerResources: Resources[], cost: Resources[], fieldCost: number): boolean {
    const buildHelper = new BuildHelper(this.game, this.player)
    const playerGold = buildHelper.gold
    let additionalGold = 0

    const missingResources = this.getMissingResourcesForBuilding(playerResources, cost)
    const canReplaceWoodByGold = buildHelper.getReplaceResourceByGoldEffects(this.player).some((eff) => eff.resource.some((res) => res === Resources.Wood))
    const canReplaceFoodByGold = buildHelper.getReplaceResourceByGoldEffects(this.player).some((eff) => eff.resource.some((res) => res === Resources.Food))
    const canReplaceDiamondByGold = buildHelper
      .getReplaceResourceByGoldEffects(this.player)
      .some((eff) => eff.resource.some((res) => res === Resources.Diamond))

    if (
      (missingResources.some((res) => res === Resources.Wood) && !canReplaceWoodByGold) ||
      (missingResources.some((res) => res === Resources.Food) && !canReplaceFoodByGold) ||
      (missingResources.some((res) => res === Resources.Diamond) && !canReplaceDiamondByGold)
    ) {
      return false
    } else {
      if (canReplaceWoodByGold) {
        additionalGold += missingResources.filter((res) => res === Resources.Wood).length
      }
      if (canReplaceFoodByGold) {
        additionalGold += missingResources.filter((res) => res === Resources.Food).length
      }
      if (canReplaceDiamondByGold) {
        additionalGold += missingResources.filter((res) => res === Resources.Diamond).length
      }

      return playerGold >= fieldCost + additionalGold
    }
  }
}

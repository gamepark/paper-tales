import { css } from '@emotion/react'
import { isSpecialDyingCondition } from '@gamepark/paper-tales/material/effects/6_AgeEffects'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext, useMaterialContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getKingdomScale, getKingdomSlotCoordinates, getViewedPlayer, isWarView } from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { crimson } from '../theme/book'
import { paper, paperBackgroundCss } from '../theme/tableTheme'
import { Sash } from './Sash'

/** The parts of the Age where the units that die are still on the board */
const ageRules = [RuleId.AgeEffects, RuleId.AgeUnitsDie]

type AgeFate = { dies: true; tokens: number; needed: number } | { dies: false; saved: boolean; never: boolean; tokens: number; needed: number }

/**
 * What the Age does to a unit, and why (rulebook p.7): it dies when it carries an Age token, or as many as its card
 * says; it lives on when it never dies, does not carry enough, or was saved by the Mystical Healer. Undefined for a
 * unit without Age token, which simply ages.
 */
const getAgeFate = (context: MaterialContext, unit: MaterialItem, index: number): AgeFate | undefined => {
  const helper = new AgeHelper(context.rules.game, unit.location.player!)
  const tokens = helper.howManyAgeTokenOnIndex(index)
  if (!tokens) return undefined
  const special = helper.getUnitAgeEffects(unit).find(isSpecialDyingCondition)
  const needed = special?.dyingFromAmount ?? 1
  if (helper.isUnitDying(unit, index)) return { dies: true, tokens, needed }
  const saved = (context.rules.remind<number[] | undefined>(Memory.UnitSavedWithMystic, unit.location.player) ?? []).includes(index)
  return { dies: false, saved, never: needed === 0, tokens, needed }
}

/**
 * During the Age, on the kingdom displayed: a band across each unit that carries Age tokens, telling whether it dies
 * and why, in crimson for the ones that die. The first death waits for them to be read (see PaperTalesAnimations).
 */
export const AgeFates: FC = () => {
  const context = useMaterialContext()
  if (!ageRules.includes(context.rules.game.rule?.id as RuleId) || isWarView(context)) return null
  const player = getViewedPlayer(context)
  const units = context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
  return (
    <>
      {units.entries.map(([index, unit]) => {
        const fate = getAgeFate(context, unit, index)
        return fate && <AgeFateSash key={index} unit={unit as MaterialItem<number, number, Unit>} fate={fate} />
      })}
    </>
  )
}

const AgeFateSash: FC<{ unit: MaterialItem; fate: AgeFate }> = ({ unit, fate }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const scale = getKingdomScale(context, unit.location.player)
  const { x, y } = getKingdomSlotCoordinates(context, unit.location.player, unit.location.x!, unit.location.y!)
  const width = unitCardDescription.width * scale
  const height = unitCardDescription.height * scale
  // Across the bottom of the card, under its picture: the Age token on the card stays in sight
  const rect = { x: x - width / 2, y: y + height * 0.18, width, height: height * 0.3 }
  const label = fate.dies
    ? fate.needed > 1
      ? t('age.fate.dies.many', { defaultValue: 'Dies: {count} Age tokens', count: fate.tokens })
      : t('age.fate.dies', 'Dies: it carries an Age token')
    : fate.saved
      ? t('age.fate.saved', 'Saved by the Mystical Healer')
      : fate.never
        ? t('age.fate.never', 'Never dies')
        : t('age.fate.lives', { defaultValue: 'Lives on: {count} Age token of {needed}', count: fate.tokens, needed: fate.needed })
  return <Sash rect={rect} label={label} scale={scale * 0.9} angle={-8} look={fate.dies ? diesCss : undefined} />
}

const diesCss = css`
  ${paperBackgroundCss(crimson, paper)};
`

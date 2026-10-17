import { Resources } from '@gamepark/paper-tales/material/Resources'
import { AgeIcon, CoinIcon, LegendIcon, ResourceIcon, StrengthIcon } from './HelpIcons'

/** The components the translations can use: <food/>, <wood/>, <crystal/>, <gold/>, <age/>, <pl/>, <s2/>… */
export const helpIconComponents = {
  food: <ResourceIcon resource={Resources.Food} />,
  wood: <ResourceIcon resource={Resources.Wood} />,
  crystal: <ResourceIcon resource={Resources.Diamond} />,
  gold: <CoinIcon />,
  age: <AgeIcon />,
  pl: <LegendIcon />,
  ...Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`s${n}`, <StrengthIcon key={n} value={n} />]))
}

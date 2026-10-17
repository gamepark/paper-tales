import { Resources } from '@gamepark/paper-tales/material/Resources'
import { FC } from 'react'
import { helpIconComponents } from './helpIconComponents'
import { ResourceIcon } from './HelpIcons'

/** A cost printed on the card: its resources, gold coins written as one coin with their number */
export const Cost: FC<{ cost: Resources[] }> = ({ cost }) => {
  const gold = cost.filter((resource) => resource === Resources.Gold).length
  return (
    <>
      {cost
        .filter((resource) => resource !== Resources.Gold)
        .map((resource, index) => (
          <ResourceIcon key={index} resource={resource} />
        ))}
      {gold > 0 && helpIconComponents[`g${gold}` as keyof typeof helpIconComponents]}
    </>
  )
}

export const CostOptions: FC<{ cost: Resources[]; alternate?: Resources[] }> = ({ cost, alternate }) => (
  <>
    <Cost cost={cost} />
    {alternate && (
      <>
        {' / '}
        <Cost cost={alternate} />
      </>
    )}
  </>
)

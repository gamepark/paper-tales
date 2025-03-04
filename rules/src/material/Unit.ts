import { getEnumValues } from '@gamepark/rules-api'

export enum Unit {
    Commander = 1,
    Militiaman,
    TimeMaster,
    Peddler,
    Rogue,
    Sculptor,
    Treefolk,
    Necromancer,
    Veteran,
    Miner,
    Woodcutter,
    Dragon,
    Knight,
    Leviathan,
    Shapeshifter,
    CaveSpirit,
    Cook,
    MysticalHealer,
    MasterAlchemist,
    ForestSpirit,
    LandLord,
    Manticore,
    GiantSnake,
    GrandArchitect,
    Colossus,
    Cerberus,
    Farmer,
    Kraken,
    Demon,
    ForestChild,
    Ogre,
    Hunter,
    Blacksmith,
    RelicOfWisdom,
    WoodMerchant,
    Strategist,
    PalmReader,
    Archer,
    Golem,
    Salamander,
    Monkey,
    Adventurer,
}



export const units = getEnumValues(Unit)

export const theRealDeck = [
    Unit.Adventurer, Unit.Adventurer,
    Unit.Commander, Unit.Commander,
    Unit.Militiaman, Unit.Militiaman, Unit.Militiaman,
    Unit.TimeMaster, Unit.TimeMaster, Unit.TimeMaster,
    Unit.Peddler, Unit.Peddler,
    Unit.Rogue, Unit.Rogue,
    Unit.Sculptor, Unit.Sculptor,
    Unit.Treefolk, Unit.Treefolk,
    Unit.Necromancer,
    Unit.Veteran, Unit.Veteran, Unit.Veteran,
    Unit.Miner, Unit.Miner, Unit.Miner,
    Unit.Woodcutter, Unit.Woodcutter, Unit.Woodcutter, 
    Unit.Dragon,
    Unit.Knight, Unit.Knight, Unit.Knight,
    Unit.Leviathan,
    Unit.Shapeshifter,
    Unit.CaveSpirit, Unit.CaveSpirit,
    Unit.Cook, Unit.Cook,
    Unit.MysticalHealer, Unit.MysticalHealer, Unit.MysticalHealer,
    Unit.MasterAlchemist,
    Unit.ForestSpirit,
    Unit.LandLord,
    Unit.Manticore, Unit.Manticore, Unit.Manticore,
    Unit.GiantSnake,
    Unit.GrandArchitect,
    Unit.Colossus,
    Unit.Cerberus, Unit.Cerberus, Unit.Cerberus,
    Unit.Farmer, Unit.Farmer, Unit.Farmer,
    Unit.Kraken,
    Unit.Demon,
    Unit.ForestChild, Unit.ForestChild, Unit.ForestChild,
    Unit.Ogre, 
    Unit.Hunter, Unit.Hunter,
    Unit.Blacksmith, Unit.Blacksmith, Unit.Blacksmith,
    Unit.RelicOfWisdom,
    Unit.WoodMerchant, Unit.WoodMerchant,
    Unit.Strategist,
    Unit.PalmReader, Unit.PalmReader,
    Unit.Archer, Unit.Archer,
    Unit.Golem, Unit.Golem,
    Unit.Salamander,   
    Unit.Monkey, Unit.Monkey,

]

export const testDeck = [
    Unit.ForestChild, Unit.ForestChild, Unit.ForestChild,
    Unit.ForestChild, Unit.ForestChild, Unit.ForestChild,
    Unit.ForestChild, Unit.ForestChild, Unit.ForestChild,
]

export function howManyCardCopies(unit:Unit):number{
    return theRealDeck.filter(u => u === unit).length
}

export function isChooseWherePlacingAgeTokenUnit(unit:Unit):boolean{
    return unit === Unit.MasterAlchemist || unit === Unit.TimeMaster
}
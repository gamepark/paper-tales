import { getEnumValues } from "@gamepark/rules-api"




export enum Card {
    Commander_1 = 1,
    Commander_2,

    Militiaman_1,
    Militiaman_2,
    Militiaman_3,

    TimeMaster_1,
    TimeMaster_2,
    TimeMaster_3,

    Peddler_1,
    Peddler_2,

    Rogue_1,
    Rogue_2,

    Sculptor_1,
    Sculptor_2,

    Treekfolk_1,
    Treekfolk_2,
    
    Necromancer_1,

    Veteran_1,
    Veteran_2,
    Veteran_3,

    Miner_1,
    Miner_2,
    Miner_3,

    Woodcutter_1,
    Woodcutter_2,
    Woodcutter_3,

    Dragon_1,

    Knight_1,
    Knight_2,
    Knight_3,
    
    Leviathan_1,

    Shapeshifter_1,

    CaveSpirit_1,
    CaveSpirit_2,
    
    Cook_1,
    Cook_2,

    MysticalHealer_1,
    MysticalHealer_2,
    MysticalHealer_3,
    
    MasterAlchemist_1,

    ForestSpirit_1,
    
    Landlord_1,

    Manticore_1,
    Manticore_2,
    Manticore_3,

    GiantSnake_1,

    GrandArchitect_1,

    Colossus_1,

    Cerberus_1,
    Cerberus_2,
    Cerberus_3,

    Farmer_1,
    Farmer_2,
    Farmer_3,

    Kraken_1,

    Demon_1,

    ForestChild_1,
    ForestChild_2,
    ForestChild_3,

    Ogre_1,

    Hunter_1,
    Hunter_2,

    Blacksmith_1,
    Blacksmith_2,
    Blacksmith_3,

    RelifOfWisdom_1,

    WoodMerchant_1,
    WoodMerchant_2,

    Strategist_1,

    PalmReader_1,
    PalmReader_2,

    Archer_1,
    Archer_2,

    Golem_1,
    Golem_2,

    Salamander_1,

    Monkey_1,
    Monkey_2,

    Adventurer_1,
    Adventurer_2,
    
}




export const cards = getEnumValues(Card)



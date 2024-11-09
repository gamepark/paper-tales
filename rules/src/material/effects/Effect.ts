import { DeploymentEffect } from "./2_DeploymentEffects"
import { WarEffect } from "./3_WarEffects"
import { IncomeEffect } from "./4_IncomeEffects"
import { Build } from "./5_Build"
import { AgeEffect } from "./6_AgeEffects"
import { RelicEffect } from "./7_EndGameEffects"

export enum EffectType {
    Deploymennt = 1,
    Shapeshifter,
    GainTokenOnDeploy,
    ImproveBuilding,
    GainAgeToken,
    GainAgeTokenOnChosenUnit,
    GainTokenIfWinWar,
    ChangeWarPower,
    AddWarPower,
    WarFromBacklane,
    CantWar,
    Income, 
    IncomePerResource,
    IncomeIfAgeToken,
    Build,
    Age,
    GainTokenIfDying,
    MysticEffect,
    SpecialDyingCondition,
    RelicEffect,
}

export enum AgeLocation {
    OnUnit = 1,
    InRealm
}

export enum WhichUnit {
    Myself = 1,
    Others,
    All,
} 

export enum WhichBuilding {
    All = 1,
    Choice,
}

export type Effect = DeploymentEffect | WarEffect | IncomeEffect | Build | AgeEffect | RelicEffect


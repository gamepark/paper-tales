import { getEnumValues } from '@gamepark/rules-api'
import { Unit } from './Unit'

/**
 * The Legendary Artifacts of What forges legends. They are shuffled into the deck with the units and travel with them
 * (draft, hand), as items of MaterialType.Unit: their ids start at 101 so that a card of the deck is a Unit or an Artifact.
 */
export enum Artifact {
  LuxuriantGrove = 101,
  HornOfPlenty,
  ElementalScepter,
  CursedCrown,
  ShieldOfPower,
  SwordOfGlory,
  WarChest,
  BottomlessPurse,
  MedallionOfLife
}

export const artifacts = getEnumValues(Artifact)

/** Every Legendary Artifact has 2 copies */
export const artifactsDeck = artifacts.flatMap((artifact) => [artifact, artifact])

/** A card of the deck */
export type Card = Unit | Artifact

export const isArtifact = (card?: Card): card is Artifact => card !== undefined && card >= Artifact.LuxuriantGrove

export const isUnit = (card?: Card): card is Unit => card !== undefined && card < Artifact.LuxuriantGrove

import { MaterialGameSetup } from '@gamepark/rules-api'
import { PaperTalesOptions } from './PaperTalesOptions'
import { PaperTalesRules } from './PaperTalesRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'
import { theRealDeck, Unit } from './material/Unit'
import { Gold } from './material/Gold'
import { Building, buildings } from './material/Building'

/**
 * This class creates a new Game based on the game options
 */
export class PaperTalesSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, PaperTalesOptions> {
  Rules = PaperTalesRules

  setupMaterial() {
    this.setupDeck()
    this.setupPlayers()
    this.game.players.forEach(player => {
      this.material(MaterialType.ScoreToken).createItem({id:player, location:{type:LocationType.PlayerScore, player:player, x:0}})
    })
    this.material(MaterialType.Time).createItem({id:4, location:{type:LocationType.Time}})
    this.material(MaterialType.Time).createItem({id:3, location:{type:LocationType.Time}})
    this.material(MaterialType.Time).createItem({id:2, location:{type:LocationType.Time}})
    this.material(MaterialType.Time).createItem({id:1, location:{type:LocationType.Time}})
  }

  setupDeck() {
    const items = theRealDeck.map(unit => ({
      id:unit,
      location: { type: LocationType.Deck }
    }))

    this.material(MaterialType.Unit).createItems(items)
    this.material(MaterialType.Unit).location(LocationType.Deck).shuffle()
  }

  setupPlayers() {
    this.players.forEach(player => {
      this.material(MaterialType.Gold).createItem({
        id: Gold.Gold1,
        location: { type: LocationType.PlayerGoldStock, player },
        quantity:3
      })

      const items = buildings.map(building => ({
        id:building,
        location: { type: LocationType.PlayerBuildingHand, player}
      }))
      
      this.material(MaterialType.Building).createItems(items)
      const testCard1 = theRealDeck.find(item => item === Unit.ForestSpirit)

      const itemsDiscardArray = [{
        id:testCard1,
        location:{type: LocationType.Discard}
      }]

      const itemsArray = [{
        id:testCard1,
        location:{type: LocationType.PlayerUnitBoard, player, x:0, y:0}
      },{
        id:testCard1,
        location:{type: LocationType.PlayerUnitBoard, player, x:1, y:0}
      },{
        id:testCard1,
        location:{type: LocationType.PlayerUnitBoard, player, x:2, y:0}
      },{
        id:testCard1,
        location:{type: LocationType.PlayerUnitBoard, player, x:0, y:1}
      },{
        id:testCard1,
        location:{type: LocationType.PlayerUnitBoard, player, x:1, y:1}
      }]
      const buildTestCard = buildings.find(item => item === Building.Town)
      const buildingArray = [{
        id:buildTestCard,
        location:{type:LocationType.PlayerBuildingBoard, player}
      },{
        id:buildTestCard,
        location:{type:LocationType.PlayerBuildingBoard, player}
      },{
        id:buildTestCard,
        location:{type:LocationType.PlayerBuildingBoard, player}
      },{
        id:buildTestCard,
        location:{type:LocationType.PlayerBuildingBoard, player}
      }]

      this.material(MaterialType.Unit).createItems(itemsArray) 
      this.material(MaterialType.Building).createItems(buildingArray)
      this.material(MaterialType.Unit).createItems(itemsDiscardArray)

      
    })

  }

  start() {
    this.startPlayerTurn(RuleId.Deal, this.game.players[0])
    //this.startSimultaneousRule(RuleId.Build)
  }
}
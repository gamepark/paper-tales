import { DropAreaDescription, HandLocator } from "@gamepark/react-game";



export class PlayerBuildingHandLocator extends HandLocator {

    locationDescription = new DropAreaDescription({ width: 20, height: 8, borderRadius: 0.4 })

    coordinates = { x: -50, y: 5, z: 0 }
    radius = 2
  

}




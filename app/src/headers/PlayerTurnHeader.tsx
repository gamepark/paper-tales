/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMoves } from "@gamepark/react-game"


export const PlayerTurnHeader = () => {

  const legalMoves = useLegalMoves()
  const endMove = legalMoves.find(move => move.type === 2)


  return <>

    <PlayMoveButton move={endMove}>
      <div> end.turn.player</div>
    </PlayMoveButton>


  </>
}



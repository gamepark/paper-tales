/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMoves } from "@gamepark/react-game"


export const BuildHeader = () => {

  const legalMoves = useLegalMoves()
  const endMove = legalMoves.find(move => move.type === 2)
  console.log(legalMoves)


  return <>

    <PlayMoveButton move={endMove}>
      <div> end.turn.build</div>
    </PlayMoveButton>


  </>
}



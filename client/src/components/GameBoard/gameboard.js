import GameDay from "../GameDay/gameday";
import { useEffect } from "react";
import "./gameboard.css"

function GameBoard() {
 
    return (
        <div className="gameboard">
            <GameDay></GameDay>
        </div>
    )
}

export default GameBoard;
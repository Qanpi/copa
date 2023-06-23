import GameDay from "../GameDay/gameday";
import { useEffect, useState } from "react";
import "./gameboard.css"
import axios from "axios"

function GameBoard() {
    const [gameDays, setGameDays] = useState([])
    
    // useEffect(() => {
    //     axios
    //         .get("/api/games?week=22")
    //         .then((res) => {
    //             const data = res.data;
    //             setGameDays(data);
    //         })
    //         .catch((err) => console.error(err));
    // }, [])
 
    return (
        <div className="gameboard">
            <GameDay></GameDay>
        </div>
    )
}

export default GameBoard;
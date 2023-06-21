import { useState } from "react";
import "./gamerecord.css"

function GameRecord() {
    const [isOver, setIsOver] = useState(false);

    return ( 
        <div className={(isOver ? "past" : "future") + " gamerecord"}>
            <span>Tinpot FC</span>
            <span>3 | 2</span>
            <span>Tinpot</span>
        </div>
    )
}

export default GameRecord;
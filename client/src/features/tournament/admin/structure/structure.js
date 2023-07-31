import { useEffect } from "react";

const mockURL = 'http://localhost:3002/db';

async function render() {
  const data = await fetch(mockURL).then(res => res.json());

  window.bracketsViewer.render({
    stages: data.stage,
    matches: data.match,
    matchGames: data.match_game,
    participants: data.participant,
  });
}

function TournamentStructure() {
    useEffect(() => {
        render();
    }, [])

    return(
        <div className="brackets-viewer"></div>
    )
}

export default TournamentStructure;
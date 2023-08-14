import { useEffect } from "react";
import { useTournament } from "../../../..";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

async function render() {
  const res = await axios.get("http://localhost:3002/db");
  const data = res.data;

  // window.bracketsViewer.render({
  //   stages: data.stage,
  //   matches: data.match,
  //   matchGames: data.match_game,
  //   participants: [""],
  // }, {
  //   // selector: "#demo",
  //   // customRoundName: finalRoundNames,
  // });
}

function TournamentStructureDemo() {

  return (<div>Demo</div>)

}

export default TournamentStructureDemo;

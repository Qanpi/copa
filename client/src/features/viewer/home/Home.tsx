import { Link } from "react-router-dom";
import { useTournament } from "../../..";
import GameBoard from "./GameBoard/gameboard";
import "./Home.css";
import InstagramBoard from "./InstagramBoard/instagramboard";
import * as dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useLayoutEffect, useMemo } from "react";

import { BracketsViewer } from "ts-brackets-viewer";
import "ts-brackets-viewer/dist/style.css";
import { Match } from "brackets-model";
const bracketsViewer = new BracketsViewer();

const useStageData = (id: string) => {
  const { data: tournament } = useTournament("current");

  return useQuery({
    queryKey: ["stageData", "id"],
    queryFn: async () => {
      const res = await axios.get(
        `/api/tournaments/${tournament.id}/stages/${id}`
      );
      return res.data;
    },
    enabled: !!tournament,
  });
};

export const useMatches = (query?: { start?: Date; end?: Date, status?: string }) => {
  return useQuery({
    queryKey: ["matches", query],
    queryFn: async () => {
      let url = `/api/matches`;

      if (query) {
        url += "?";
        for (const [k, v] of Object.entries(query)) {
          url += `${k}=${v}`;
        }
      }

      const res = await axios.get(url);
      return res.data;
    },
  });
};

function Home() {
  const { data: tournament } = useTournament("current");
  const { data: stageData } = useStageData(tournament?.groupStage.id);

  const startOfWeek = useMemo(() => dayjs().day(1), []);

  const { data: matches } = useMatches({start: startOfWeek.toDate()});
  // console.log(matches)

  useEffect(() => {
    if (stageData) {
      bracketsViewer.render({
        stages: stageData.stage,
        matches: stageData.match,
        matchGames: stageData.match_game,
        participants: stageData.participant,
      });
    }
  }, [stageData]);
  //tournament?
  //registration -> register screen + countdown
  //otherwise -> display countdown to next event
  //group stage/bracket -> dashboard
  //previous winner page
  console.log(matches);
  if (tournament) {
    switch (tournament.registration.status) {
      case "awaiting":
        return (
          <div>
            Registration will begin {dayjs().to(tournament.registration.from)}
          </div>
        );
      case "in progress":
        return (
          <>
            <div>
              Registration closes {dayjs().to(tournament.registration.to)}
            </div>
            <Link to="/register">Register</Link>
          </>
        );
      case "over":
        return (
          <>
            <div className="dashboard">
              <GameBoard></GameBoard>
              <InstagramBoard></InstagramBoard>
            </div>

            <div className="group-stage" id="test">
              <div className="brackets-viewer"></div>
            </div>
          </>
        );
      case "indefinite":
      default:
        return <div>Registrtion will start soon.</div>;
    }
  }

  return <div className="banner">Winner page.</div>;
}

export default Home;

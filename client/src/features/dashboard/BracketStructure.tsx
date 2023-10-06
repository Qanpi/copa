/// <reference types="webpack/module" />
import {
  Button,
  Card,
  CardContent,
  Slider,
  Typography
} from "@mui/material";
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useParticipants } from "../participant/hooks.ts";
import { useTournament } from "../tournament/hooks.ts";

import { BracketsViewer } from "ts-brackets-viewer";
// import "ts-brackets-viewer/dist/style.css";

import { BracketsManager, helpers } from "brackets-manager";
import { InMemoryDatabase } from "brackets-memory-db";
import { Seeding } from "brackets-model";
import { RoundNameInfo } from "ts-brackets-viewer";
import { groupBy, flatten, create } from "lodash-es";
import { isSeedingWithIds } from "brackets-manager/dist/helpers";
import { useGroupedParticipants } from "./Draw.tsx";
import { useMatches } from "../tournament/matches/hooks.ts";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);
const bracketsViewer = new BracketsViewer();

//workflow
//1. create in memory tournament structure
//0 - consider both genders
//1 find n of participants
//2 suggest n of groups, show appropriate bracket
//3 lock the tournament structure
// - manager create stages
//2. export it to db
export const divideGroups = (participants: number, groups: number) => {
  if (participants === 0) throw new RangeError(`Can't divide 0 participants into ${groups} groups`);
  if (groups === 0) throw new RangeError(`Can't divide ${participants} into 0 groups.`)

  const maxPartsPerGroup = Math.ceil(participants / groups);
  const groupSizes = [maxPartsPerGroup - 1, maxPartsPerGroup];

  const solutions = Array.from({ length: participants + 1 }, () => []); //[nParts: [solutions: [first/size, groupCount]]]
  solutions[0].push({ size: null, length: 0 });

  for (const w of groupSizes) {
    for (let i = 1; i <= participants; i++) {
      if (i - w >= 0) {
        for (const s of solutions[i - w]) {
          solutions[i].push({ size: w, length: s.length + 1 });
        }
      }
    }
  }

  const solution = [];

  let p = participants;
  let l = groups;

  while (l > 0) {
    const end = solutions[p].find((g) => g.length === l);

    const s = end.size;
    solution.push(s);

    p -= end.size;
    l--;
  }

  return solution;
};

const finalRoundNames = (roundInfo: RoundNameInfo) => {
  if ("fractionOfFinal" in roundInfo) {
    switch (roundInfo.fractionOfFinal) {
      case 1:
        return "Finals";
      case 0.5:
        return "Semifinals";
      case 0.25:
        return "Quarterfinals";
      default:
        return `Round of ${Math.round(1 / roundInfo.fractionOfFinal) * 2}`;
    }
  }

  return `Round ${roundInfo.roundNumber}`;
};

function BracketStructure({ prev, next }) {
  const { data: tournament } = useTournament("current");
  const { data: participants, status: participantsStatus } = useParticipants();

  const groupCount = tournament?.groupStage.settings.groupCount;
  const [teamsBreakingPerGroup, setTeamsBreakingPerGroup] = useState(2);

  const bracketSize = groupCount * teamsBreakingPerGroup;

  const {data: standings} = useQuery({
    queryKey: ["stndngs"],
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${tournament?.groupStage?.id}/standings`);
      return res.data;
    }
  });

  const rankedParticipants = standings?.map(group => group.map(ranking => participants?.find(p => ranking.id === p.id)));
  const cutOffParticipants = rankedParticipants?.map(group => group.slice(0, teamsBreakingPerGroup));
  const seeding = cutOffParticipants?.flat();

  const mockTournamentId = 0;

  useEffect(() => {
    const render = async () => {
      await manager.create.stage({
        name: "Preview Bracket",
        tournamentId: mockTournamentId,
        type: "single_elimination",
        seeding,
        settings: {
          size: helpers.getNearestPowerOfTwo(bracketSize),
          seedOrdering: ["inner_outer"],
          balanceByes: true,
        }
      });

      const mockBracket = await manager.get.tournamentData(mockTournamentId);

      bracketsViewer.render(
        {
          stages: mockBracket.stage,
          matches: mockBracket.match,
          matchGames: mockBracket.match_game,
          participants: mockBracket.participant,
        },
        {
          selector: "#mock-bracket",
          customRoundName: finalRoundNames,
        }
      );
    }

    if (seeding && seeding.length !== 0) render();

    const local = bracketsRef.current;
    return () => {
      if (local) local.innerHTML = "";
      manager.delete.tournament(mockTournamentId);
    };
  }, [seeding, bracketSize]);

  const handleSliderChange = async (_e, value) => {
    setTeamsBreakingPerGroup(value);
  }

  const saveBracket = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/tournaments/${tournament.id}/stages`, {
        name: "Bracket",
        tournamentId: tournament.id,
        type: "single_elimination",
        seeding,
        settings: {
          size: helpers.getNearestPowerOfTwo(bracketSize),
          seedOrdering: ["inner_outer"],
          balanceByes: true,
        }
      });
    },
  });

  const bracketsRef = useRef(null);

  if (participantsStatus !== "success") return;

  return (
    <>
      <div>
        <Typography>Teams breaking from each of the {groupCount} groups</Typography>
        <Slider
          value={teamsBreakingPerGroup}
          onChange={handleSliderChange}
          min={1}
          max={Math.ceil(participants.length / groupCount)}
          step={1}
          marks
          valueLabelDisplay="on"
        ></Slider>
      </div>

      <div
        ref={bracketsRef}
        className="brackets-viewer"
        id="mock-bracket"
      ></div>
      <Button type="submit" onClick={() => saveBracket.mutate()}>
        Lock in
      </ Button>
      <Button onClick={prev}>Previous</Button>
    </>
  );
}

export default BracketStructure;

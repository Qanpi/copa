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
import { groupBy, flatten } from "lodash-es";

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

  const { groupStage } = tournament;
  const groupCount = groupStage.settings.groupCount;

  const [teamsBreakingPerGroup, setTeamsBreakingPerGroup] = useState(2);

  const bracketSize = helpers.getNearestPowerOfTwo(
    groupCount * teamsBreakingPerGroup
  );

  const mockTournamentId = 0;

  const createMockStage = useMutation({
    mutationFn: async () => {
      const grouped = groupBy(participants, (p) => {
        const id = p.group_id;
        const group = tournament.groups.find(g => g.id === id);
        return group.number;
      });
      const groupedArray = Object.values(grouped);
      console.log(groupedArray)

      const sliced = groupedArray.map(group => group.slice(0, teamsBreakingPerGroup));
      const seeding = flatten(sliced);

      return await manager.create.stage({
        name: "Preview Bracket",
        tournamentId: mockTournamentId,
        type: "single_elimination",
        settings: {
          size: bracketSize,
          seedOrdering: ["inner_outer"],
          balanceByes: true,
        },
        seeding
      });
    }
  });

  useEffect(() => {
    createMockStage.mutate();

    return () => manager.delete.tournament(mockTournamentId);
  }, [participants, teamsBreakingPerGroup])

  const { data: mockBracket } = useQuery({
    queryKey: ["brackets", "tournament"], //FIXME:
    queryFn: async () => {
      const data = await manager.get.tournamentData(mockTournamentId);
      return data;
    },
  });

  const saveBracket = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/tournaments/${tournament.id}/stages`, {
        name: "Elimination Bracket",
        tournamentId: tournament.id,
        type: "single_elimination",
        settings: {
          size: bracketSize,
        },
      });
    },
  });

  const bracketsRef = useRef(null);

  useEffect(() => {
    if (mockBracket) {
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

    const local = bracketsRef.current;

    return () => {
      if (local) local.innerHTML = ""; //FIXME: clear past bracket
    };
  }, [mockBracket]);

  if (participantsStatus !== "success") return;

  const groups = divideGroups(participants.length, groupCount);

  return (
    <>
      <div>
        <Typography>Teams breaking from each of the {groupCount} groups</Typography>
        <Slider
          value={teamsBreakingPerGroup}
          onChange={(e, v: number) => setTeamsBreakingPerGroup(v)}
          min={1}
          max={Math.min(...groups)}
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
      </Button>
      <Button onClick={prev}>Previous</Button>
    </>
  );
}

export default BracketStructure;

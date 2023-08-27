/// <reference types="webpack/module" />
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useTournament } from "../../../..";
import axios from "axios";
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  Paper,
  Slider,
  Typography,
} from "@mui/material";
import { useParticipants } from "../../../participant/hooks";

import { BracketsViewer } from "ts-brackets-viewer";
import "ts-brackets-viewer/dist/style.css";

import { BracketsManager, helpers } from "brackets-manager";
import { InMemoryDatabase } from "brackets-memory-db";
import { Seeding } from "brackets-model";
import { RoundNameInfo } from "ts-brackets-viewer";

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

function StructurePage() {
  const { data: tournament } = useTournament("current");
  const { data: participants, status: participantsStatus } = useParticipants();

  const [groupCount, setGroupCount] = useState(4);
  const [teamsBreakingPerGroup, setTeamsBreakingPerGroup] = useState(2);
  const bracketSize = helpers.getNearestPowerOfTwo(
    groupCount * teamsBreakingPerGroup
  );
  const mockTournamentId = 0;

  const queryClient = useQueryClient();
  const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

  useEffect(() => {
    async function loadStage() {
      const seeding: Seeding = [];
      for (let i = 0; i < groupCount; i++) {
        const l = alphabet[i];

        for (let j = 0; j < teamsBreakingPerGroup; j++) {
          if (j === 0) seeding.push(`Group ${l} Winner`);
          else seeding.push(`Group ${l} Runner-up ${j + 1}`);
        }
      }

      await manager.create.stage({
        name: "Preview Bracket",
        tournamentId: mockTournamentId,
        type: "single_elimination",
        settings: {
          size: bracketSize,
          seedOrdering: ["inner_outer"],
          balanceByes: true,
        },
        seeding: seeding,
      });

      queryClient.invalidateQueries(["brackets", "tournament"]);
    }

    loadStage();

    return () => {
      manager.delete.tournament(0);
    };
  }, [groupCount, teamsBreakingPerGroup]);

  const { data: mockBracket } = useQuery({
    queryKey: ["brackets", "tournament"], //FIXME:
    queryFn: async () => {
      const data = await manager.get.tournamentData(mockTournamentId);
      return data;
    },
    enabled: participantsStatus === "success", //ensure that the html is rendered for brackets-viewer layout effect
  });

  const saveBracket = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/tournaments/${tournament.id}/stages`, {
        name: "Group Stage",
        tournamentId: tournament.id,
        type: "round_robin",
        settings: {
          groupCount: groupCount,
          size: participants.length,
        },
      });

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

  useLayoutEffect(() => {
    if (mockBracket) {
      bracketsViewer.render(
        {
          //FIXME: maybe fix to replace any with BracketsViewere later on
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
      if (local) local.innerHTML = ""; //clear past bracket
    };
  }, [mockBracket]);

  if (participantsStatus !== "success") return;

  const groups = divideGroups(participants.length, groupCount);

  return (
    <>
      <div>
        <Card
          sx={{
            p: 3,
            position: "relative",
            width: 100,
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
          }}
        >
          <CardContent>
            <Typography variant="h2">{participants.length}</Typography>
            <Typography
              sx={{
                position: "absolute",
                bottom: 25,
              }}
            >
              teams
            </Typography>
          </CardContent>
        </Card>

        <Slider
          value={groupCount}
          onChange={(e, v: number) => {
            setGroupCount(v);
          }}
          min={1}
          max={Math.ceil(participants.length / 2)}
          step={1}
          marks
          valueLabelDisplay="on"
        ></Slider>
        {/* FIXME: limit max n groups = parts / 2 */}
        {groups.map((n, i) => (
          <Card key={alphabet[i]}>
            <CardContent>
              <Typography>Group {alphabet[i]}</Typography>
              <Typography>{n} teams</Typography>
            </CardContent>
          </Card>
        ))}
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
    </>
  );
}

export default StructurePage;

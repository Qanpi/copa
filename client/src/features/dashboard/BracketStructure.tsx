/// <reference types="webpack/module" />
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Slider,
  Typography
} from "@mui/material";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";
import {
  useContext,
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
import { useGroupedParticipants } from "./Draw.tsx";
import { useMatches } from "../match/hooks.ts";
import { useCreateStage, useDeleteStage, useStages, useStandings } from "../stage/hooks.ts";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "../layout/DivisionPanel.tsx";
import AdminOnlyPage from "./AdminOnlyBanner.tsx";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import { SeedOrdering } from "brackets-model"
import MySelect from "../inputs/mySelect.tsx";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

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

};


const useMockBracketsViewer = (stageData, bracketSize) => {
  const ref = useRef(null);
  const mockTournamentId = 0;
  const bracketsViewer = new BracketsViewer();

  useEffect(() => {
    const render = async () => {
      await manager.create.stage({
        ...stageData,
        name: "Preview",
        tournamentId: mockTournamentId
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

    const local = ref.current;
    if (local && stageData) render();

    return () => {
      if (local) local.innerHTML = "";
      manager.delete.tournament(mockTournamentId);
    };
  }, [stageData, bracketSize, ref]);

  return ref;
}

function BracketStructure() {
  const { data: tournament } = useTournament("current");

  const division = useContext(DivisionContext);
  const { data: participants, status: participantsStatus } = useParticipants(tournament?.id, {
    division: division?.id
  });

  const { data: groupStageList, status: stageStatus } = useStages(tournament?.id, {
    type: "round_robin",
    division: division?.id
  });
  const groupStage = groupStageList?.[0];

  const groupCount = groupStage?.settings.groupCount;
  const [teamsBreakingPerGroup, setTeamsBreakingPerGroup] = useState(2);
  const [consolationFinal, toggleConsolationFinal] = useState(true);

  type PatchedSeedOrdering = SeedOrdering | "copa";
  const bracketOrderings: PatchedSeedOrdering[] = ["natural", "reverse", "half_shift", "reverse_half_shift", "pair_flip", "inner_outer", "copa"];
  const [seedOrdering, setSeedOrdering] = useState<PatchedSeedOrdering>("inner_outer");

  const bracketSize = groupCount * teamsBreakingPerGroup;

  const { data: standings, status: standingsStatus } = useStandings(groupStage?.id);

  const standingParticipants = standings?.map(group => group.map(ranking => participants?.find(p => ranking.id === p.id)));
  const breaking = standingParticipants?.map(group => group.slice(0, teamsBreakingPerGroup));
  const seeding = breaking?.flat();

  const stageData = seeding && division ? {
    name: division.name + " bracket",
    tournamentId: division.id,
    type: "single_elimination",
    seeding,
    settings: {
      consolationFinal,
      seedOrdering: [seedOrdering],
      balanceByes: true,
    }
  } : undefined;

  const bracketsRef = useMockBracketsViewer(stageData, bracketSize);

  const handleSliderChange = async (_e, value) => {
    setTeamsBreakingPerGroup(value);
  }

  const createBracket = useCreateStage();

  const handleSaveBracket = () => {
    if (stageData) createBracket.mutate(stageData)
  }

  const { data: brackets } = useStages(tournament?.id, {
    type: "single_elimination",
    division: division?.id
  })
  const bracket = brackets?.[0];

  const deleteStage = useDeleteStage();
  const handleRemoveBracket = () => {
    if (bracket?.id) deleteStage.mutate(bracket.id);
  }

  if (participantsStatus !== "success" || stageStatus !== "success") return <>Loading</>;

  return (
    <AdminOnlyPage>
      <BannerPage title="Bracket structure">

        <DivisionPanel>

          {bracket ? <>
            <Typography>
              Bracket already exists.
            </Typography>
            <Button onClick={handleRemoveBracket}>
              Delete bracket.
            </Button>
          </> :
            <>
              <div>
                <Typography>Teams breaking from each group</Typography>
                <Slider
                  value={teamsBreakingPerGroup}
                  onChange={handleSliderChange}
                  min={1}
                  max={Math.ceil(participants.length / groupCount)}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                ></Slider>
                <Select value={seedOrdering} onChange={(e) => setSeedOrdering(e.target.value)}>
                  {bracketOrderings.map(o => {
                    return <MenuItem key={o} value={o}>{o}</MenuItem>
                  })}
                </Select>
                <FormControlLabel control={
                  <Checkbox checked={consolationFinal} onChange={() => toggleConsolationFinal(!consolationFinal)}></Checkbox>
                } label="Bronze match"/>
              </div>

              <div
                ref={bracketsRef}
                className="brackets-viewer"
                id="mock-bracket"
              ></div>
              <Button type="submit" onClick={handleSaveBracket}>
                Lock in
              </ Button>
            </>
          }
        </DivisionPanel>
      </BannerPage>
    </AdminOnlyPage>
  );
}

export default BracketStructure;

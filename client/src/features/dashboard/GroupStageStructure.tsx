import {
  Button,
  Card,
  CardContent, Container, Slider, Typography
} from "@mui/material";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import {
  useEffect,
  useState
} from "react";
import { useTournament } from "../tournament/hooks";
import { useParticipants } from "../participant/hooks";

import "ts-brackets-viewer/dist/style.css";
import axios from "axios";

const useCreateStage = () => {
  const { data: tournament } = useTournament("current");

  return useMutation({
    mutationFn: async (values: any) => {
      await axios.post(`/api/tournaments/${tournament.id}/stages`, {
        tournamentId: tournament.id,
        ...values
      });
    }
  })
}

function GroupStageStructure() {
  const { data: participants, status: participantsStatus } = useParticipants();

  const [groupCount, setGroupCount] = useState(4);
  const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

  const createGroupStage = useCreateStage();

  if (participantsStatus !== "success") return;

  const groups = divideGroups(participants.length, groupCount);

  const handleClickSubmit = () => {
    createGroupStage.mutate({
        name: "Group Stage",
        type: "round_robin",
        //TODO: division: ""
        settings: {
          groupCount,
          size: participants.length,
        },
      });
  }

  return (
    <Container>
      <Slider
        value={groupCount}
        onChange={(e, v: number) => {
          setGroupCount(v);
        }}
        min={1}
        max={participants.length}
        step={1}
        marks
        valueLabelDisplay="on"
      ></Slider>
      {groups.map((n, i) => (
        <Card key={alphabet[i]}>
          <CardContent>
            <Typography>Group {alphabet[i]}</Typography>
            <Typography>{n} team(s)</Typography>
          </CardContent>
        </Card>
      ))}
      <Button onClick={handleClickSubmit}>Submit</Button>
    </Container>
  );
}

export default GroupStageStructure; 

//workflow (deprecated)
//1. create in memory tournament structure
//0 - consider both genders
//1 find n of participants
//2 suggest n of groups, show appropriate bracket
//3 lock the tournament structure
// - manager create stages
//2. export it to db

export const divideGroups = (participants: number, groups: number) => {
  if (participants === 0)
    throw new RangeError(`Can't divide 0 participants into ${groups} groups`);
  if (groups === 0)
    throw new RangeError(`Can't divide ${participants} into 0 groups.`);

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

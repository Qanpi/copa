import { Button, Card, CardContent, Container, Slider, Typography } from "@mui/material";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { useTournament } from "../tournament/hooks.ts";
import { participantKeys, useParticipants } from "../participant/hooks.ts";
import { groupBy, shuffle } from "lodash-es";
import Group from "../team/group/Group.js";
import { DataGrid } from "@mui/x-data-grid";
import GroupStageStructure from "./GroupStage.js";
import { useStageData } from "../tournament/groupStage/GroupStage.tsx";
import { divideGroups, useCreateStage } from "./GroupStageStructure.tsx";

const useGroup = (id) => {
  const { data: tournament } = useTournament("current");

  return tournament?.groups.find((g) => g.id === id);
};

const useGroups = () => {
  const { data: tournament } = useTournament("current");

  return tournament?.groups;
};

const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

function arrangeGroups(participants, groups) {
  const base = Math.floor(participants / groups);

  const groupings: number[] = new Array(groups).fill(base);

  let remainder = participants % groups;

  for (let i=0; remainder>0; i++) {
    groupings[i] += 1;
    remainder--;
  }

  return groupings;
}


function DrawPage() {
  const { data: tournament } = useTournament("current");

  const { data: participants, status: participantsStatus } = useQuery({
    queryKey: [participantKeys.all],
    queryFn: async () => {
      const res = await axios.get(`/api/participants`);
      return res.data;
    },
    staleTime: Infinity
  });

  // const updateParticipant = useMutation({
  //   mutationFn: async (values) => {
  //     const res = await axios.patch(`/api/participants/${values.id}`, values);
  //     return res;
  //   }
  // })

  const [groupCount, setGroupCount] = useState(4);
  const [seeding, setSeeding] = useState([]);

  const { data: groupStage } = useStageData(tournament?.groupStage?.id);
  const createGroupStage = useCreateStage();

  if (participantsStatus !== "success") return <>Loading...</>

  const groupSizes = arrangeGroups(participants.length, groupCount);

  const handleConfirmSeeding = () => {
    // for (let i=0; i<seeding.length; i++) {
    //   const n = i % groupCount; 
    //   updateParticipant.mutate({...seeding[i], group_id: });
    // }

    createGroupStage.mutate({
      name: "Group Stage",
      type: "round_robin",
      //TODO: division: ""
      settings: {
        groupCount,
        size: seeding.length,
      },
      seeding
    });
  };

  const handleSkipWheel = () => {
    setSeeding([...seeding, ...shuffle(participants)])
  };

  const handleResetSeeding = () => {
    setSeeding([]);
  };

  const handleWheelSelected = (option) => {
    setSeeding([...seeding, option]);
  }

  const groupless = participants?.filter(p => !seeding.some(s => s.id === p.id));

  return (
    <>
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
      </Container>

      {
        groupSizes.map((n, i) => {
          return (
            <Group
              name={`Group ${alphabet[i]}`}
              participants={seeding.filter((v, j) => (j % groupCount === i))}
              disableHead
              key={i}
            ></Group>
          );
        })
      }

      <FortuneWheel participants={groupless} onSelected={handleWheelSelected}></FortuneWheel>

      <Button onClick={handleSkipWheel}>
        Skip
      </Button>
      <Button onClick={handleResetSeeding}>Reset</Button>

      <Button onClick={handleConfirmSeeding}>
        Confirm
      </Button>
    </>
  )
}

function FortuneWheel({ participants, onSelected }) {
  const [mustSpin, setMustSpin] = useState(false);

  const randomN = Math.floor(Math.random() * participants.length);

  const wheelOptions = participants?.map((p) => {
    const l = 10;
    const trimmed =
      p.name.length > l ? p.name.substring(0, l - 3) + "..." : p.name;
    return { option: trimmed, ...p };
  });

  const isWheelVisible =
    !participants || participants.length === 0;

  const handleSpinOver = () => {
    setMustSpin(false);

    const chosen = wheelOptions[randomN];
    onSelected(chosen);

    //find the group with the smallest n of participants
    // const group = getCurrentGroup();
    // assignParticipantToGroup.mutate({ ...chosen, group_id: group.id });
    // setSeeding([...seeding, chosen]); //FIXME: seeding is reset after a realod, but the participants in groups aren't -> bad. Either figure out a way to keep of latest group, or use tmep memory and then commit and push at the end.
  };

  const handleSpin = () => {
    if (isWheelVisible || mustSpin) return;

    setMustSpin(true);
  };

  return (
    <>
      {!isWheelVisible ? (
        <Wheel
          data={wheelOptions}
          prizeNumber={randomN}
          mustStartSpinning={mustSpin}
          onStopSpinning={handleSpinOver}
          spinDuration={0.00001} //TODO: fix later
        ></Wheel>
      ) : (
        <div>No more temas left</div>
      )}

      <Button onClick={handleSpin} disabled={isWheelVisible}>
        Spin
      </Button>

    </>
  );
}

export default DrawPage;

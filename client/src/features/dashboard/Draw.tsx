import { Button, Card, CardContent, Container, Slider, Typography } from "@mui/material";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { useTournament } from "../viewer/hooks.ts";
import { participantKeys, useParticipants } from "../participant/hooks.ts";
import { groupBy, shuffle } from "lodash-es";
import Group from "../group/Group.js";
import { DataGrid } from "@mui/x-data-grid";
import GroupStageStructure from "./GroupStage.js";
import { useStageData } from "../stage/hooks.ts";
import { divideGroups } from "./GroupStageStructure.tsx";
import { useCreateStage } from "../stage/hooks.ts";
import DivisionPanel from "./DivisionPanel.tsx";
import { DivisionContext } from "../../index.tsx";
import { useGroupStageData, useStages } from "../stage/hooks.ts";

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

  for (let i = 0; remainder > 0; i++) {
    groupings[i] += 1;
    remainder--;
  }

  return groupings;
}


function DrawPage() {
  const { data: tournament } = useTournament("current");

  const division = useContext(DivisionContext);

  const { data: participants, status: participantsStatus, refetch } = useQuery({
    queryKey: [participantKeys.all],
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/${tournament?.id}/participants?division=${division?.id}`);
      return res.data;
    },
    enabled: Boolean(tournament) && Boolean(division?.id),
    staleTime: Infinity
  });

  //TODO: better way to do this?
  useEffect(() => {
    if (division) refetch();
  }, [division]);

  const [groupCount, setGroupCount] = useState(4);
  const [seeding, setSeeding] = useState([]);

  const { data: stages } = useStages(tournament?.id, {
    division: division?.id,
    type: "round_robin"
  });
  const groupStage = stages?.[0];

  const createGroupStage = useCreateStage();

  if (!participants) return <>Loading...</>

  if (tournament?.state !== "Groups") return <>Tournament is not in the gorup stage.</>

  const groupSizes = arrangeGroups(participants.length, groupCount);

  const handleConfirmSeeding = () => {
    createGroupStage.mutate({
      name: division.name,
      type: "round_robin",
      tournamentId: division.id,
      settings: {
        groupCount,
        size: seeding.length,
      },
      seeding
    }, {
      onSuccess: () => {
        setSeeding([]);
      }
    });
  };

  const handleSkipWheel = () => {
    const unset = participants.filter(p => !seeding.some(s => s.id === p.id));
    setSeeding([...seeding, ...shuffle(unset)])
  };

  const handleResetSeeding = () => {
    setSeeding([]);
  };

  const handleWheelSelected = (option) => {
    setSeeding([...seeding, option]);
  }

  const groupless = participants?.filter(p => !seeding.some(s => s.id === p.id));
  const groups = groupSizes.map((n, i) => {
    return (
      <Group
        name={`Group ${alphabet[i]}`}
        participants={seeding.filter((v, j) => (j % groupCount === i))}
        disableHead
        key={i}
      ></Group>
    );
  })

  return (
    <DivisionPanel>
      {groupStage ?
        <>Sorry can't reset an arleady made group stage yet. Contact support.</>
        :
        <>
          <Container>
            <Typography>Number of groups</Typography>

            <Slider
              value={groupCount}
              onChange={(e, v: number) => {
                setGroupCount(v);
              }}
              min={1}
              max={Math.min(participants.length, 6)} //FIXME: brackets-viewer appers unable to handle >6 groups 
              step={1}
              marks
              valueLabelDisplay="on"
            ></Slider>
          </Container>

          {groups}

          <FortuneWheel participants={groupless} onSelected={handleWheelSelected}></FortuneWheel>

          <Button onClick={handleSkipWheel}>
            Skip
          </Button>
          <Button onClick={handleResetSeeding}>Reset</Button>

          <Button onClick={handleConfirmSeeding}>
            Confirm
          </Button>
        </>
      }
    </DivisionPanel>
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

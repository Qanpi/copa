import { Button } from "@mui/material";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { useTournament } from "../tournament/hooks.ts";
import { participantKeys, useParticipants } from "../participant/hooks.ts";
import { groupBy } from "lodash-es";
import Group from "../team/group/Group.js";
import { DataGrid } from "@mui/x-data-grid";

const useGroups = () => {
  const { data: tournament } = useTournament("current");

  return tournament?.groups;
};

//TODO: convert into temp storage? 
export const useGroupedParticipants = () => {
  const groups = useGroups();
  const { data: participants } = useParticipants();

  if (groups.length === 0 || !participants) return; //before groups are initialized

  const grouped = groups
    .sort((a, b) => a.number - b.number)
    .map((g) => {
      //sort may not be necessary
      return {
        name: g.name,
        participants: participants.filter((p) => p.group_id === g.id),
      };
    });

  grouped.push({
    name: "none",
    participants: participants.filter((p) => !Boolean(p.group_id)),
  });

  return grouped;
};

const useGroup = (id) => {
  const { data: tournament } = useTournament("current");

  return tournament?.groups.find((g) => g.id === id);
};

function DrawPage() {
  const [mustSpin, setMustSpin] = useState(false);

  const { data: tournament } = useTournament("current");
  // const { data: participants } = useParticipants();
  const participantsByGroup = useGroupedParticipants();

  const groups = useGroups();

  const queryClient = useQueryClient();
  const assignParticipantToGroup = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/participants/${values.id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(participantKeys.all)
    }
  });

  const updateStage = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(
        `/api/tournaments/${tournament.id}/stages/${values.id}`,
        values
      );
      return res.data;
    },
  });

  const {data: seeding} = useQuery({
    queryKey: ["seeding"],
    queryFn: async (id) => {
      const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${tournament.groupStage.id}/seeding`);
      return res.data;
    }
  })

  if (!participantsByGroup) return <>Loading...</>;

  const grouplessParticipants = participantsByGroup.find(
    (g) => g.name === "none"
  ).participants;
  const groupedParticipants = participantsByGroup.filter(
    (g) => g.name !== "none"
  );

  const randomN = Math.floor(Math.random() * grouplessParticipants.length);

  const wheelOptions = grouplessParticipants?.map((p) => {
    const l = 10;
    const trimmed =
      p.name.length > l ? p.name.substring(0, l - 3) + "..." : p.name;
    return { option: trimmed, ...p };
  });

  const groupCount = 4;

  const handleConfirmSeeding = () => {
    if (grouplessParticipants.length !== 0) return;

    const seeding = groupedParticipants.map((g) => g.participants).flat();
    const seedingIds = seeding.map((s) => s.id);

    updateStage.mutate({
      id: tournament.groupStage.id,
      seedingIds,
    });
  };

  const isWheelVisible =
    !grouplessParticipants || grouplessParticipants.length === 0;

  const getCurrentGroup = () => {
    const smallestGrouping = groupedParticipants.reduce((a, b) =>
      a.participants.length <= b.participants.length ? a : b
    );

    return groups.find((g) => g.name === smallestGrouping.name);
  };

  const handleSpinOver = () => {
    setMustSpin(false);

    const chosen = wheelOptions[randomN];

    //find the group with the smallest n of participants
    const group = getCurrentGroup();
    assignParticipantToGroup.mutate({ ...chosen, group_id: group.id });
    // setSeeding([...seeding, chosen]); //FIXME: seeding is reset after a realod, but the participants in groups aren't -> bad. Either figure out a way to keep of latest group, or use tmep memory and then commit and push at the end.
  };

  const handleSpin = () => {
    if (isWheelVisible || mustSpin) return;

    setMustSpin(true);
  };

  const handleSkipWheel = () => {
    const initialGroup = getCurrentGroup();

    let n = initialGroup.number;

    for (const part of grouplessParticipants) {
      const group = groups.find(g => g.number === (n - 1) % groups.length + 1);
      assignParticipantToGroup.mutate({ ...part, group_id: group.id });
      n++;
    }
  };

  const handleResetSeeding = () => {
    groupedParticipants.forEach(({ _, participants }) => {
      participants.forEach((p) => {
        assignParticipantToGroup.mutate({ ...p, group_id: null });
      });
    });
  };

  const groupTables = groupedParticipants.map(({ name, participants }) => {
    return (
      <Group
        name={name}
        participants={participants}
        disableHead
        key={name}
      ></Group>
    );
  });

  if (seeding.length !== 0) {
    return;
  }

  return (
    <>
      {groupTables}

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

      <Button onClick={handleSkipWheel} disabled={isWheelVisible}>
        Skip
      </Button>
      <Button onClick={handleResetSeeding}>Reset</Button>
      <Button onClick={handleConfirmSeeding} disabled={!isWheelVisible}>
        Confirm
      </Button>
    </>
  );
}

export default DrawPage;

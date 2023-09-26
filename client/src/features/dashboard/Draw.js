import { Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { useTournament } from "../tournament/hooks.ts";
import { useParticipants } from "../participant/hooks.ts";
import { groupBy } from "lodash-es";
import Group from "../team/group/Group.js";

export const useGroupedParticipants = () => {
  const { data: participants } = useParticipants();
  const {data: groups} = useGroups();

  const grouped = groupBy(participants, (p) => {
    const id = p.group_id;
    const group = groups.find((g) => g.id === id);

    return group.number;
  });

  return Object.values(grouped); //FIXME: does this ensure sorting?
};

const useGroups = () => {
  const {data: tournament} = useTournament();

  return tournament?.groups;
}

const useGroup = (id) => {
  const { data: tournament, isSuccess } = useTournament("current");

  return tournament?.groups.find((g) => g.id === id);
};

function DrawPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [randomN, setRandomN] = useState(0);

  const { data: tournament } = useTournament("current");
  const { data: groupless } = useParticipants({
    group: "none",
  });

  const wheelOptions = groupless?.map((p) => {
    const l = 10;
    const trimmed =
      p.name.length > l ? p.name.substring(0, l - 3) + "..." : p.name;
    return { option: trimmed, ...p };
  });

  const [seeding, setSeeding] = useState([]);

  const createStage = useMutation({
    mutationFn: async (values) => {
      await axios.post(`/api/tournaments/${tournament.id}/stages`, {
        name: "Group Stage",
        tournamentId: tournament.id,
        type: "round_robin",
        //TODO: division: ""
        seedingIds: values.seedingIds,
        settings: {
          groupCount: values.groups,
          size: values.participants,
        },
      });
    },
  });

  const groupCount = 4;

  const assignToGroup = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/participants/${values.id}`, values);
      return res.data;
    },
  });

  const handleClickSaveSeeding = () => {
    for (const [i, part] of seeding.entries()) {
      const group_n = (i % 4) + 1;
      const group = tournament.groups.find((g) => g.number === group_n);

      assignToGroup.mutate({ ...part, group_id: group.id });
    }

    createStage.mutate({
      seedingIds: seeding.map((s) => s.id),
      groups: 4,
    });
  };

  const isWheelVisible = !groupless || groupless.length === 0;

  const handleSpinOver = () => {
    setMustSpin(false);

    const chosen = wheelOptions[randomN];

    const groupN = seeding.length % 4;
    const group = tournament.groups.find((g) => g.number === groupN);

    assignToGroup.mutate({ ...chosen, group_id: group.id });
    setSeeding([...seeding, chosen]);
  };

  const handleSpinClick = () => {
    if (isWheelVisible || mustSpin) return;
    const n = Math.floor(Math.random() * groupless.length);

    setRandomN(n);
    setMustSpin(true);
  };

  const handleClickSkipWheel = () => {
    const newGroupless = [...groupless];
    const newSeeding = [...seeding];

    while (newGroupless.length) {
      const n = Math.floor(Math.random() * newGroupless.length);

      newSeeding.push(newGroupless[n]);
      newGroupless.splice(n, 1);
    }

    //TODO: assign grups to prts
    setSeeding(newSeeding);
  };

  if (!groups) return <div>Loading...</div>;

  const groupTables = groups.map((g, i) => {
    const participants = seeding.filter((_, j) => j % groups.length === i);

    return (
      <Group
        name={g.name}
        participants={participants}
        disableHead
        key={g.name}
      ></Group>
    );
  });

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

      <Button onClick={handleSpinClick} disabled={isWheelVisible}>
        Spin
      </Button>

      <Button onClick={handleClickSkipWheel} disabled={isWheelVisible}>
        Skip
      </Button>
      <Button onClick={handleClickSaveSeeding} disabled={!isWheelVisible}>
        SAVE
      </Button>
    </>
  );
}

export default DrawPage;

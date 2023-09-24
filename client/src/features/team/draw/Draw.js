import { Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { useTournament } from "../../tournament/hooks.ts";
import { useParticipants } from "../../participant/hooks.ts";
import Group from "../group/Group.js";

const useGroups = () => {
  const { data: tournament, isSuccess } = useTournament("current");

  if (isSuccess)
    return tournament.groups.filter(
      (g) => g.stage === tournament.groupStage.id
    );
};

function DrawPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [randomN, setRandomN] = useState(0);

  const { status: participationsStatus, refetch } = useParticipants({
    group: "",
  });

  const [groupless, setGroupless] = useState([]);

  const wheelOptions = groupless.map((p) => {
    const l = 10;
    const trimmed =
      p.name.length > l ? p.name.substring(0, l - 3) + "..." : p.name;
    return { option: trimmed, ...p };
  });

  useEffect(() => {
    const firstLoad = async () => {
      const {data: participants} = await refetch();
      setGroupless(participants);
    };

    firstLoad();
  }, []);


  // const queryClient = useQueryClient();
  // const assignToGroup = useMutation({
  //   mutationFn: async (values) => {
  //     const res = await axios.patch(`/api/participations/${values.id}`, values);
  //     return res.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries("groups");
  //   },
  // });

  const { data: tournament } = useTournament("current");

  const groups = useGroups();
  const [seeding, setSeeding] = useState([]);

  const updateSeeding = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(
        `/api/tournaments/${tournament.id}/stages/${tournament.groupStage.id}`,
        values
      );
      return res.data;
    },
  });

  const handleClickSaveSeeding = (e) => {
    updateSeeding.mutate({ seedingIds: seeding.map(s => s.id) });
  };

  //TODO: skipping the whole process if desired
  // const [currentGroup, setCurrentGroup] = useState(0);

  const isAllDrawn = groupless.length === 0;

  const handleSpinOver = () => {
    setMustSpin(false);

    const chosen = wheelOptions[randomN];
    setGroupless(groupless.filter((p) => p.id !== chosen.id));
    setSeeding([...seeding, chosen]);
  };

  const handleSpinClick = () => {
    if (isAllDrawn || mustSpin) return;
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

    setSeeding(newSeeding);
    setGroupless(newGroupless);
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

      {!isAllDrawn ? (
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

      <Button onClick={handleSpinClick} disabled={isAllDrawn}>
        Spin
      </Button>

      <Button onClick={handleClickSkipWheel} disabled={isAllDrawn}>
        Skip
      </Button>
      <Button onClick={handleClickSaveSeeding} disabled={!isAllDrawn}>
        SAVE
      </Button>
    </>
  );
}

export default DrawPage;

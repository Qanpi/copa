import { Button, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useState } from "react";
import { Wheel } from "react-custom-roulette/";
import * as Yup from "yup";
import MyTextField from "../../../inputs/textField/mytextfield";
import { useParticipations } from "../../../viewer/tables/MyTable";
import Group from "../../group/Group";
import { useUpdateTeam } from "../../hooks";
import { useTournament } from "../../../..";
import axios from "axios";
import {
  useQuery,
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

const useGroups = () => {
  const { data: tournament, isSuccess } = useTournament("current");

  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/${tournament.id}/groups`);
      return res.data;
    },
    enabled: isSuccess,
  });
};

function Draw() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [randomN, setRandomN] = useState(0);

  const { data: groupless, status: participationsStatus } = useParticipations({
    group: "",
  });

  const groupN = 1; //TODO: control max n

  //TODO: separate page for defining tournament structure (groups -> bracket etc.)
  const queryClient = useQueryClient();
  const assignToGroup = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/participations/${values.id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries("groups");
    },
  });

  const { data: groups, status: groupsStatus } = useGroups();

  //TODO: skipping the whole process if desired
  const [currentGroup, setCurrentGroup] = useState(0);

  if (participationsStatus !== "success" || groupsStatus !== "success")
    return <div>Loading...</div>;

  const isAllDrawn = groupless.length === 0;

  const wheelOptions = groupless.map((p) => {
    return { option: p.team.name, ...p };
  });

  const handleSpinOver = () => {
    const chosenParticipant = wheelOptions[randomN];
    setIsSpinning(false);

    assignToGroup.mutate({
      id: chosenParticipant.id,
      group: groups[currentGroup].id,
    });
    setCurrentGroup((currentGroup + 1) % groups.length);
  };

  const handleSpinClick = () => {
    if (isAllDrawn) return;

    const n = Math.floor(Math.random() * groupless.length);
    setRandomN(n);

    if (!isSpinning) {
      setIsSpinning(true);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          groupCount: Math.ceil(wheelOptions.length / 4), //kinda dumb algo, maybe make smarter
        }}
        validationSchema={Yup.object({
          groupCount: Yup.number().min(1).max(20),
        })}
      >
        <Form>
          <Typography>
            There is a total of {wheelOptions.length} team(s).
          </Typography>
          <Typography>How many groups do you want there to be?</Typography>
          <MyTextField type="number" name="groupCount"></MyTextField>
        </Form>
      </Formik>
      {groups.map((g) => (
        <Group
          name={g.name}
          participations={g.participants}
          disableHead
          key={g.name}
        ></Group>
      ))}
      {!isAllDrawn ? (
        <Wheel
          data={wheelOptions}
          prizeNumber={randomN}
          mustStartSpinning={isSpinning}
          onStopSpinning={handleSpinOver}
          spinDuration={0.001} //TODO: fix later
        ></Wheel>
      ) : (
        <div>No more temas left</div>
      )}
      <Button onClick={handleSpinClick} disabled={isAllDrawn}>Spin</Button>
    </>
  );
}

export default Draw;

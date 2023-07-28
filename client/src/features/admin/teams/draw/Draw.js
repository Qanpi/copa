import { Button, Typography } from "@mui/material";
import { useParticipations } from "../../../viewer/tables/MyTable";
import MyTextField from "../../../inputs/textField/mytextfield";
import { Formik, Form, yupToFormErrors } from "formik";
import * as Yup from "yup";
import { Wheel } from "react-custom-roulette/";
import { useState } from "react";
import Group from "../../../team/group/Group";

function Draw() {
  const [isSpinning, setIsSpinning] = useState(true);
  const groupN = 1;
  const [groups, setGroups] = useState(Array(groupN).fill([]));
  const [groupId, setGroupId] = useState(0);

  const { data: participations, status: participationsStatus } =
    useParticipations();

  if (participationsStatus !== "success") return <div>Loading...</div>;

  const teams = participations.map((p) => {
    return { option: p.team.name };
  });
  const teamCount = teams.length;

  const random = Math.floor(Math.random() * teamCount);
  const randomTeam = teams[random];

  const handleSpinOver = () => {
    setGroups(
      groups.map((g, i) => {
        if (i === (groupId % groupN)) return [...g, randomTeam];
      })
    );

    setGroupId(id => id + 1);

    setIsSpinning(false);
  };

  const handleSpinClick = () => {
    if (!isSpinning) {
      setIsSpinning(true);
    }
  }

  return (
    <>
      <Formik
        initialValues={{
          groupCount: Math.ceil(teamCount / 4), //kinda dumb algo, maybe make smarter
        }}
        validationSchema={Yup.object({
          groupCount: Yup.number().min(1).max(20),
        })}
      >
        <Form>
          <Typography>There is a total of {teamCount} team(s).</Typography>
          <Typography>How many groups do you want there to be?</Typography>
          <MyTextField type="number" name="groupCount"></MyTextField>
        </Form>
      </Formik>
      {groups.map(g => <Group teams={g} disableHead></Group>)}
      <Wheel
        data={teams}
        prizeNumber={random}
        mustStartSpinning={isSpinning}
        onStopSpinning={handleSpinOver}
      ></Wheel>
      <Button onClick={handleSpinClick}>Spin</Button>
    </>
  );
}

export default Draw;

import { Button, Typography } from "@mui/material";
import { useParticipations } from "../../../viewer/tables/MyTable";
import MyTextField from "../../../inputs/textField/mytextfield";
import { Formik, Form, yupToFormErrors } from "formik";
import * as Yup from "yup";
import { Wheel } from "react-custom-roulette/";
import { useState } from "react";
import Group from "../../../team/group/Group";

function Draw() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [randomN, setRandomN] = useState(0);

  const { data: participations, status: participationsStatus } =
    useParticipations();
  const [picked, setPicked] = useState([]);

  const groupN = 1;
  const [groups, setGroups] = useState(Array({name: "A", groups: []}).fill([]));
  const [currentGroup, setCurrentGroup] = useState(0);

  if (participationsStatus !== "success") return <div>Loading...</div>;

  const teams = participations.map((p) => {
    return { option: p.team.name, ...p.team };
  });
  const isDrawn = picked.length === teams.length;


  const pickRandomUniqueN = up => {
    let n;
    do {
      n = Math.floor(Math.random() * up);
    } while (picked.includes(n));

    return n;
  };

  const handleSpinOver = () => {
    setGroups(
      groups.map((g, i) => {
        if (i === currentGroup % groupN) return [...g, teams[randomN]];
      })
    );

    setCurrentGroup((id) => id + 1);

    setIsSpinning(false);
    setPicked([randomN, ...picked]);
  };

  const handleSpinClick = () => {
    if (isDrawn) return;

    const n = pickRandomUniqueN(teams.length);
    setRandomN(n);

    if (!isSpinning) {
      setIsSpinning(true);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          groupCount: Math.ceil(teams.length / 4), //kinda dumb algo, maybe make smarter
        }}
        validationSchema={Yup.object({
          groupCount: Yup.number().min(1).max(20),
        })}
      >
        <Form>
          <Typography>There is a total of {teams.length} team(s).</Typography>
          <Typography>How many groups do you want there to be?</Typography>
          <MyTextField type="number" name="groupCount"></MyTextField>
        </Form>
      </Formik>
      {groups.map((g) => (
        <Group teams={g} disableHead key={g.name}></Group>
      ))}
      {!isDrawn ? 
      <Wheel
        data={teams}
        prizeNumber={randomN}
        mustStartSpinning={isSpinning}
        onStopSpinning={handleSpinOver}
        spinDuration={0.001} //TODO: fix later
     ></Wheel> : <div>No more temas left</div>
      }
      <Button onClick={handleSpinClick}>Spin</Button>
    </>
  );
}

export default Draw;

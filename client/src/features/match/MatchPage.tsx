import { Button } from "@mui/base";
import dayjs from "dayjs";
import { Form, Formik, useFormikContext } from "formik";
import { useContext, useEffect } from "react";
import { useParams } from "react-router";
import { useTimer } from "react-timer-hook";
import { RoleContext } from "../..";
import ScoreCounter from "../inputs/ScoreCounter";
import { useParticipant } from "../participant/hooks";
import { useMatch, useUpdateMatch } from "./hooks";
import { useUser } from "../user/hooks";
import { Container, Box, Stack, Typography } from "@mui/material";
import { Status } from "brackets-model"

const MatchTimer = ({ duration }: { duration: number }) => {
  const getExpiryTimestamp = () => dayjs().add(duration, "seconds").toDate();

  const { minutes, seconds, start, pause, resume, restart, isRunning, totalSeconds } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => console.log("epxciring"),
    autoStart: false,
  });

  const { setFieldValue, submitForm } = useFormikContext();

  useEffect(() => {
    const updateFrequency = 5;

    if (isRunning && seconds % updateFrequency === 0) {
      setFieldValue("elapsed", duration - totalSeconds);
      submitForm();
    }

  }, [seconds])

  const { data: user } = useUser("me");
  const isAdmin = user?.role === "admin";

  const handleReset = () => {
    setFieldValue("elapsed", 0);
    submitForm();
    //FIXME: restari gfter page reload doesn't worki
    restart(getExpiryTimestamp(), false);
  }

  return (
    <>
      <div>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
      {isAdmin ? <div>
        {isRunning ?
          <Button onClick={pause}>Pause</Button> :
          <Button onClick={resume}>Start</Button>
        }
        <Button onClick={handleReset}>
          Reset
        </Button>
      </div> : null}
    </>
  );
};

function MatchPage() {
  const { id } = useParams();
  const { data: match, status } = useMatch(id);

  //FIXME: auto-complete match if one of the articpns is BYE
  const { data: participant1 } = useParticipant(match?.opponent1?.id);
  const { data: participant2 } = useParticipant(match?.opponent2?.id);

  const updateMatch = useUpdateMatch();

  const { data: user } = useUser("me");
  const isAdmin = user?.role === "admin";

  if (status === "loading") return <div>Loading...</div>;

  const duration = match.duration * 60 - match.elapsed;

  const getMatchLayout = () => {
    if (!match?.status) return <>Loading</>

    if (match.status <= Status.Ready) {
      return (
        <Stack direction={"row"} spacing={3} display="flex" justifyContent={"center"}>
          <Box>
            <Box>
              img
            </Box>
            <Typography variant="h4">{participant1.name}</Typography>
          </Box>
          <Typography variant="h2">vs</Typography>
          <Box>
            <Box>
              img
            </Box>
            <Typography variant="h4">{participant2.name}</Typography>
          </Box>
        </Stack>
      )
    } else if (match.status === Status.Running) {
      return <>Match running page</>
    } else {
      return <>Match completed page</>
    }
  }

  return (
    <Container sx={{ pt: 5 }}>
      {getMatchLayout()}
      <Formik
        initialValues={{
          ...match,
          opponent1: {
            ...match.opponent1,
            score: match.opponent1.score || 0
          },
          opponent2: {
            ...match.opponent2,
            score: match.opponent2.score || 0
          }
        }}
        onSubmit={(values) => updateMatch.mutate(values)}
      >
        {({ values, submitForm, setFieldValue }) => (
          <Form>
            <ScoreCounter name="opponent1.score"></ScoreCounter>
            <ScoreCounter name="opponent2.score"></ScoreCounter>
            {values.elapsed}
            {isAdmin ? <Button onClick={
              () => {
                const s1 = values.opponent1.score;
                const s2 = values.opponent2.score;

                if (s1 > s2) setFieldValue("opponent1.result", "win");
                else if (s1 === s2) setFieldValue("opponent1.result", "draw"); //FIXME: deal with this properly
                else setFieldValue("opponent2.result", "win");

                submitForm();
              }
            }>Submit</Button> : null}
            <MatchTimer duration={duration}></MatchTimer>
          </Form>
        )
        }
      </Formik>
    </Container>
  );
}

export default MatchPage;

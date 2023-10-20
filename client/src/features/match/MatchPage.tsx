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
import { Container, Box, Stack, Typography, useTheme, LinearProgress } from "@mui/material";
import { Status } from "brackets-model"
import { TParticipant } from "brackets-mongo-db";

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
  console.log(match)

  const updateMatch = useUpdateMatch();

  const { data: user } = useUser("me");
  const isAdmin = user?.role === "admin";

  const theme = useTheme();

  if (status === "loading") return <div>Loading...</div>;

  const duration = match.duration * 60 - match.elapsed;

  if (!match?.status) return <>Loading</>

  const getMatchDisplay = (status: Status) => {
    if (status <= Status.Ready) {
      return (
        <Box sx={{ background: theme.palette.secondary.main, p: 1, pl: 5, pr: 5, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {match.start ?
            <>
              <Typography variant="subtitle2">
                {dayjs(match.start).format("DD.MM")}
              </Typography>
              <Typography variant="h1" sx={{ fontWeight: 800, m: -1 }}>
                {dayjs(match.start).format("HH:mm")}
              </Typography>
              <Typography variant="subtitle2">
                Indoor hall
              </Typography>
            </> : null}
        </Box>
      );
    } else if (match.status === Status.Running) {
      return <>Match running page</>
    } else {
      return <>Match completed page</>
    }
  }

  const opp1 = match.opponent1;
  const opp2 = match.opponent2;

  return (
    <Container sx={{ p: { xs: 5, md: 10 } }}>
      <Stack direction={{xs: "row", md: "column"}} sx={{ display: "flex",  alignItems: "center"}} spacing={5}>
        <Stack sx={{ position: "relative" }} direction={{ xs: "column", md: "row" }} spacing={10}>
          <Stack direction={{ xs: "column-reverse", md: "column"}} justifyContent={"center"}>
            <Box sx={{ width: "45vmin", height: "45vmin", background: "lightblue" }}>
              img
            </Box>
            <Typography variant="subtitle1">{opp1?.name || "BYE"}</Typography>
          </Stack>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) ", m: "0 !important", maxWidth: "40vmin" }}>
            {getMatchDisplay(match.status)}
          </Box>
          <Box sx={{maxWidth: "45vmin"}}>
            <Box sx={{ width: "45vmin" , height: "45vmin" , background: "lightblue"}}>
              img
            </Box>
            <Typography variant="subtitle1">{opp2?.name || "BYE"}</Typography>
          </Box>
        </Stack>
        {/* FIXME: make vertical on mobile */}
        <LinearProgress variant="determinate" value={10} sx={{ transform: {xs: "rotate(90deg)", md: "scaleX(-1)"}, height: 5, width: "80vmin"}}></LinearProgress>
      </Stack>
    </Container >
  )

  return (
    <Container sx={{ pt: 5 }}>
      {getMatchDisplay()}
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

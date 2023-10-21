import { TMatch } from "@backend/models/match";
import { TParticipant } from "@backend/models/participant";
import { AddCircle, KeyboardArrowDown, KeyboardArrowUp, PlusOne, RemoveCircle, Timer } from "@mui/icons-material";
import { Button, Box, BoxProps, Container, IconButton, LinearProgress, Stack, StackProps, Typography, useTheme, SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogTitle, DialogContent, Input, DialogActions } from "@mui/material";
import { Status } from "brackets-model";
import dayjs, { Dayjs } from "dayjs";
import { Form, Formik, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTimer } from "react-timer-hook";
import ScoreCounter from "../inputs/ScoreCounter";
import { useParticipant } from "../participant/hooks";
import { useUser } from "../user/hooks";
import { useMatch, useUpdateMatch } from "./hooks";
import { useDivision } from "../viewer/hooks";
import OutlinedContainer from "../layout/OutlinedContainer";

const MatchTimer = ({ end }: { end: Date }) => {


  return (
    <>
      <div>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
      {
        isRunning ?
          <Button onClick={pause}>Pause</Button> :
          <Button onClick={resume}>Start</Button>
      }
      <Button onClick={handleReset}>
        Reset
      </Button>
    </>
  )
}

const TeamBox = ({ match, opponent, sx, ...props }: { opponent: "opponent1" | "opponent2", match: TMatch, } & StackProps) => {
  const opp = match[opponent];

  const participant = useParticipant(opp?.id)
  const updateMatch = useUpdateMatch();

  const theme = useTheme();

  const handleChangeScore = (delta: number) => {
    const newScore = (opp.score || 0) + delta;

    if (newScore < 0) return;

    updateMatch.mutate({
      ...match,
      [opponent]: {
        ...opp,
        score: newScore
      }
    })
  }

  return (
    // <Stack direction={"row"} display="flex" justifyContent={"center"} alignItems="center" spacing={2}>
    <Stack direction="column" display="flex" alignItems="center"  {...props}>
      <Typography variant="subtitle1">{opp?.name || "BYE"}</Typography>

      <OutlinedContainer sx={{p: 0, pt: 1, pb: 1}}>
        <Stack direction="column" sx={{ pl: 10, pr: 10, alignItems: "center", display: "flex", justifyContent: "center" }}>
          <Button size="small" variant="contained" fullWidth color="primary" onClick={() => handleChangeScore(1)}>
            {/* <IconButton onClick={() => handleChangeScore(-1)}> */}
            <KeyboardArrowUp></KeyboardArrowUp>
            {/* </IconButton> */}
          </Button>
          {/* <Box sx={{ width: "100%", height: "100%", objectFit: "contain" }} component="img" src={participant?.bannerUrl}></Box> */}
          <Typography fontSize={"30vmin"} fontWeight={800} sx={{mb: -5, mt: -5}}>
            {opp?.score}
          </Typography>

          <Button size="small" variant="contained" color="primary" sx={{ width: "100%", }} onClick={() => handleChangeScore(-1)}>
            {/* <IconButton onClick={() => handleChangeScore(-1)}> */}
            <KeyboardArrowDown></KeyboardArrowDown>
            {/* </IconButton> */}
          </Button>
        </Stack>

      </OutlinedContainer>
    </Stack>
    // </Stack>
  )
}

const MatchDisplay = ({ match }: { match: TMatch }) => {
  const theme = useTheme();

  const getExpiryTimestamp = () => {
    const duration = dayjs(match.end).diff(match.start, "seconds");

    return dayjs().add(duration, "seconds").toDate();
  }

  const { minutes, seconds, start, pause, resume, restart, isRunning, totalSeconds } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => console.log("epxciring"),
    autoStart: false,
  });

  useEffect(() => {
    const updateFrequency = 5;

    if (isRunning && seconds % updateFrequency === 0) {
      console.log("tick")
    }

  }, [seconds])

  const handleReset = () => {
    //FIXME: restari gfter page reload doesn't worki
    restart(getExpiryTimestamp(), false);
  }

  const handleTimerClick = () => {
    if (isRunning) return pause();
    else resume();
  }

  if (!match.status) return <Typography>Couldn't determine the status of the match.</Typography>

  if (match.status <= Status.Ready) {
    return (
      <Stack direction="row" sx={{ p: 2, borderRadius: 2, background: theme.palette.secondary.main, display: "flex", alignItems: "center", justifyContent: "center", minWidth: "300px" }}>

        <Stack direction="column" alignItems={"center"}>
          <Typography variant="subtitle2">
            {match.start ? dayjs(match.start).format("DD.MM") : "Coming soon"}
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: 800, m: -1 }}>
            {match.start ? dayjs(match.start).format("HH:mm") : "-- : --"}
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            {match.location ? "Indoor hall" : "Stay tuned"}
          </Typography>
        </Stack>
      </Stack>
    );
  } else if (match.status === Status.Running) {

    return <Box sx={{ p: 2, borderRadius: 0, background: theme.palette.secondary.main, display: "flex", alignItems: "center", justifyContent: "center", minWidth: "300px" }}
      onClick={handleTimerClick}>
      <Stack direction="row" alignItems={"center"} justifyContent="center" >

        <Stack direction="column" sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h1" sx={{ fontWeight: 800 }}>
            {`${minutes.toString().padStart(2, '0')}`}
          </Typography>

          <Typography variant="subtitle2">min</Typography>
        </Stack>

        <Typography variant="h1" sx={{ fontWeight: 800, mb: "0.4em" }}>:</Typography>

        <Stack direction="column" sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h1" sx={{ fontWeight: 800 }}>
            {`${seconds.toString().padStart(2, '0')}`}
          </Typography>
          <Typography variant="subtitle2">sec</Typography>
        </Stack>

      </Stack>
    </Box >
  } else {
    return <>Match completed page</>
  }
}

const MatchProgress = ({ match }: { match: TMatch }) => {
  if (!match.status || match.status < Status.Running) return null;

  return (
    <LinearProgress variant="determinate" value={10} sx={{ transform: "scaleX(-1)", height: 5, width: "80vmin" }}></LinearProgress>
  )
}

function MatchPage() {
  const { id } = useParams();
  const { data: match, status } = useMatch(id);
  const updateMatch = useUpdateMatch();

  const { data: user } = useUser("me");
  const isAdmin = user?.role === "admin";

  const [durationPrompt, setDurationPrompt] = useState(false);

  const handleBeginMatch = () => {
    if (!match) return;

    if (!match.end) return setDurationPrompt(true);

    updateMatch.mutate({
      ...match,
      opponent1: {
        ...match.opponent1,
        score: 0
      },
      opponent2: {
        ...match.opponent2,
        score: 0
      }
    })
  }

  if (status === "loading") return <div>Loading...</div>;

  const duration = match.duration * 60 - match.elapsed;

  if (!match?.status) return <>Loading</>

  return (
    <>
      <Dialog open={durationPrompt}>
        <DialogTitle>
          Enter match duration
        </DialogTitle>
        <DialogContent>
          <Input type="number"></Input>
          <Typography color="text.secondary">seconds</Typography>
        </DialogContent>
        <DialogActions>
          <Button>Begin</Button>
          <Button onClick={() => setDurationPrompt(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Container sx={{ p: { xs: 5, md: 10 }, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* <Stack direction={{ xs: "row", md: "column" }} spacing={5}> */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 25, md: 20 }}>
          {/* //FIXME: default image */}
          <TeamBox match={match} opponent={"opponent1"}  ></TeamBox>
          <TeamBox match={match} opponent="opponent2" direction={{ xs: "column-reverse", md: "column" }}></TeamBox>
        </Stack>

        {/* <MatchProgress match={match}></MatchProgress> */}
        {/* </Stack> */}

        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) ", m: "0 !important" }}>
          <MatchDisplay match={match}></MatchDisplay>
        </Box>
      </Container >
      <SpeedDial icon={<SpeedDialIcon></SpeedDialIcon>} ariaLabel="Match Speed Dial" sx={{ position: "absolute", bottom: 16, right: 16 }}>
        <SpeedDialAction tooltipTitle="Begin match" icon={<Timer></Timer>} onClick={handleBeginMatch}></SpeedDialAction>
      </SpeedDial>
    </>
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
          </Form>
        )
        }
      </Formik>
    </Container>
  );
}

export default MatchPage;

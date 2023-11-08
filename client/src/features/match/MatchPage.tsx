import { TMatch } from "@backend/models/match";
import { TParticipant } from "@backend/models/participant";
import { AddCircle, KeyboardArrowDown, KeyboardArrowUp, PlusOne, RemoveCircle, RestartAlt, Timer } from "@mui/icons-material";
import { Button, Box, BoxProps, Container, IconButton, LinearProgress, Stack, StackProps, Typography, useTheme, SpeedDial, SpeedDialAction, SpeedDialIcon, Dialog, DialogTitle, DialogContent, Input, DialogActions } from "@mui/material";
import { Status } from "brackets-model";
import dayjs, { Dayjs } from "dayjs";
import { Form, Formik, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useTimer } from "react-timer-hook";
import ScoreCounter from "../inputs/ScoreCounter";
import { useParticipant } from "../participant/hooks";
import { useAuth } from "../user/hooks";
import { useMatch, useUpdateMatch } from "./hooks";
import { useDivision, useTournament } from "../tournament/hooks";
import OutlinedContainer from "../layout/OutlinedContainer";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { PromptContainer } from "../layout/PromptContainer";
import { useTeam } from "../team/hooks";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc)


const TeamBox = ({ match, opponent, sx, ...props }: { opponent: "opponent1" | "opponent2", match: TMatch, } & StackProps) => {
  const opp = match[opponent];

  const { data: team } = useTeam(opp?.name);
  const updateMatch = useUpdateMatch();


  const handleChangeScore = (delta: number) => {
    const newScore = (opp?.score || 0) + delta;

    if (newScore < 0) return;

    updateMatch.mutate({
      ...match,
      [opponent]: {
        ...opp,
        score: newScore
      }
    })
  }

  const { data: user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    // <Stack direction={"row"} display="flex" justifyContent={"center"} alignItems="center" spacing={2}>
    <Stack direction="column" display="flex" alignItems="center" sx={{ width: "40vmin", height: "50vmin", }}  {...props} spacing={1}>

      {match.status === Status.Running ?
        <Stack direction="column" sx={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
          {isAdmin ? <Button size="small" variant="contained" fullWidth color="primary" onClick={() => handleChangeScore(1)}>
            <KeyboardArrowUp></KeyboardArrowUp>
          </Button> : null}
          <Typography fontSize={"30vmin"} fontWeight={800} sx={{ mb: -5, mt: -5, ml: 10, mr: 10 }}>
            {opp?.score}
          </Typography>
          {isAdmin ? <Button size="small" disabled={opp?.score <= 0} variant="contained" color="primary" sx={{ width: "100%", }} onClick={() => handleChangeScore(-1)}>
            <KeyboardArrowDown></KeyboardArrowDown>
          </Button> : null}
        </Stack>
        : <Box sx={{ objectFit: "contain", width: "100%", height: "100%" }} component="img" src={team?.bannerUrl}></Box>
      }
      <Typography variant="h5">{opp?.name || "BYE"}</Typography>
    </Stack >
    // </Stack>
  )
}

const MatchDisplay = ({ matchId }: { matchId: string }) => {
  const theme = useTheme();
  const { data: match } = useMatch(matchId);

  const getExpiryTimestamp = () => {
    const end = dayjs().add(match.duration, "seconds");
    const remaining = end.subtract(match.elapsed, "seconds");

    return remaining.toDate();
  }

  const [completeMatchDialog, showCompleteMatchDialog] = useState(false);
  const { minutes, seconds, start, pause, resume, restart, isRunning, totalSeconds } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => showCompleteMatchDialog(true),
    autoStart: false,
  });

  const updateMatch = useUpdateMatch();
  useEffect(() => {
    const updateFrequency = 5;

    if (isRunning && totalSeconds % updateFrequency === 0) {
      updateMatch.mutate({
        id: match.id,
        elapsed: match.duration - totalSeconds
      })
    }

  }, [seconds])

  const handleTimerClick = () => {
    if (isRunning) return pause();
    else resume();
  }

  const handleCompleteMatch = () => {
    updateMatch.mutate({
      id: match.id,
      // ...match,
      // opponent1: {
      //   ...match.opponent1,
      // },
      // opponent2: {
      //   ...match.opponent2,
      // },
      status: Status.Completed
    })
  }

  if (!match) return <>loading..</>
  if (!match.status) return <Typography>Couldn't determine the status of the match.</Typography>

  if (match.status <= Status.Ready) {
    return (
      <Stack direction="row" sx={{ p: 2, borderRadius: 2, background: theme.palette.secondary.main, display: "flex", alignItems: "center", justifyContent: "center", minWidth: "300px" }}>
        <Stack direction="column" alignItems={"center"}>
          <Typography variant="subtitle1">
            {match.start ? dayjs(match.start).format("DD.MM") : "Coming soon"}
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: 800, mb: 1, mt: -1 }}>
            {match.start ? dayjs(match.start).format("HH:mm") : "-- : --"}
          </Typography>
        </Stack>
      </Stack>
    );
  } else if (match.status === Status.Running) {
    return (
      <>
        <Dialog open={completeMatchDialog}>
          <DialogTitle>
            Complete match?
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleCompleteMatch}>Yes</Button>
            <Button onClick={() => showCompleteMatchDialog(false)}>No</Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ p: 2, borderRadius: 0, opacity: isRunning ? 1 : 0.5, background: theme.palette.secondary.main, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "300px" }}
          onClick={handleTimerClick}>
          <Typography variant="h6" sx={{ mb: -1 }}>Time remaining</Typography>
          <Stack direction="row" alignItems={"center"} justifyContent="center" >

            <Stack direction="column" sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h1" sx={{ fontWeight: 800 }}>
                {`${minutes.toString().padStart(2, '0')}`}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: -2 }}>min</Typography>
            </Stack>

            <Typography variant="h1" sx={{ fontWeight: 800, mb: "0.2em" }}>:</Typography>

            <Stack direction="column" sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h1" sx={{ fontWeight: 800 }}>
                {`${seconds.toString().padStart(2, '0')}`}
              </Typography>
              <Typography variant="subtitle2" sx={{ mt: -2 }}>sec</Typography>
            </Stack>

          </Stack>
        </Box >
      </>
    )
  } else {
    return <>Match completed page</>
  }
}

const MatchProgress = ({ matchId }: { matchId: string }) => {
  const { data: match } = useMatch(matchId);

  if (!match?.status || match.status < Status.Running) return null;

  const progress = match.remaining / match.duration * 100;
  return (
    <LinearProgress variant="determinate" value={progress} sx={{ transform: "scaleX(-1)", height: 5, width: "80vmin" }}></LinearProgress>
  )
}

function MatchPage() {
  const { id } = useParams();
  const { data: match, status } = useMatch(id);

  const { data: user } = useAuth();
  const isAdmin = user?.role === "admin";

  const updateMatch = useUpdateMatch({ debounce: false });
  const handleBeginMatch = () => {
    if (!match) return;

    updateMatch.mutate({
      ...match,
      opponent1: {
        ...match.opponent1,
        score: 0
      },
      opponent2: {
        ...match.opponent2,
        score: 0
      },
      status: Status.Running
    })
  }

  const { data: tournament } = useTournament("current");

  const resetMatch = useMutation({
    mutationFn: async (values: Partial<TMatch>) => {
      //FIXME: wack af
      await axios.delete(`/api/tournaments/${tournament?.id}/matches/${values.id}/results`);
      await axios.patch(`/api/tournaments/${tournament?.id}/matches/${values.id}`, {
        elapsed: 0,
        status: Status.Ready //FIXME: assumption
      });
    },
  })

  const handleResetMatch = () => {
    resetMatch.mutate({
      id: match.id,
    });
  }

  if (status === "loading") return <div>Loading...</div>;
  if (!match?.status) return <>Loading</>

  return (
    <>
      {/* <Dialog open={durationPrompt}>
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
      </Dialog> */}
      <PromptContainer>
        {/* <Stack direction={{ xs: "row", md: "column" }} spacing={5}> */}
        <Stack direction={{ xs: "column", md: "row" }} sx={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", p: 5 }} spacing={20}>
          <TeamBox match={match} opponent={"opponent1"} direction={{ xs: "column-reverse", md: "column" }}></TeamBox>
          <TeamBox match={match} opponent="opponent2" ></TeamBox>

          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) ", m: "0 !important" }}>
            <MatchDisplay matchId={match.id}></MatchDisplay>
          </Box>
        </Stack>

        <MatchProgress matchId={match.id}></MatchProgress>
        {/* </Stack> */}

      </PromptContainer>

      <SpeedDial icon={<SpeedDialIcon></SpeedDialIcon>} ariaLabel="Match Speed Dial" sx={{ position: "absolute", bottom: 16, right: 16 }}>
        <SpeedDialAction tooltipTitle="Begin match" icon={<Timer></Timer>} onClick={handleBeginMatch}></SpeedDialAction>
        <SpeedDialAction tooltipTitle="Reset" icon={<RestartAlt></RestartAlt>} onClick={handleResetMatch}></SpeedDialAction>
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

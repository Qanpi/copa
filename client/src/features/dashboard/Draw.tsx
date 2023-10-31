import { TParticipant } from "@backend/models/participant.ts";
import { AlertProps, Backdrop, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, Paper, Slider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { shuffle } from "lodash-es";
import { useContext, useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "../layout/DivisionPanel.tsx";
import { FeedbackSnackbar } from "../layout/FeedbackSnackbar.tsx";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import { TParticipantPopulated, participantKeys } from "../participant/hooks.ts";
import { useCreateStage, useDeleteStage, useStages } from "../stage/hooks.ts";
import { useTournament } from "../tournament/hooks.ts";
import AdminOnlyPage from "./AdminOnlyBanner.tsx";
import "./fortuneWheel.css";
import useSound from "use-sound"
import tadaPolka from "./tadapolka.mp3"
import { ImageProps, WheelData } from "react-custom-roulette/dist/components/Wheel/types";
import { Label } from "@mui/icons-material";


const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

function arrangeGroups(participants: number, groups: number) {
  const base = Math.floor(participants / groups);

  const groupings: number[] = new Array(groups).fill(base);

  let remainder = participants % groups;

  for (let i = 0; remainder > 0; i++) {
    groupings[i] += 1;
    remainder--;
  }

  return groupings;
}


function DrawPage() {
  const { data: tournament } = useTournament("current");

  const division = useContext(DivisionContext);

  const { data: participants, status: participantsStatus, refetch } = useQuery({
    queryKey: [participantKeys.all],
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/${tournament?.id}/participants?division=${division?.id}`);
      return res.data as TParticipantPopulated[];
    },
    enabled: Boolean(tournament) && Boolean(division?.id),
    staleTime: Infinity
  });

  //TODO: better way to do this?
  useEffect(() => {
    if (division) {
      setSeeding([]);
      refetch();
    }
  }, [division]);

  const [spinDuration, setSpinDuration] = useState(100);

  const [groupCount, setGroupCount] = useState(4);
  const [seeding, setSeeding] = useState([] as TParticipant[]);

  const [resetDialog, setResetDialog] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertProps["severity"]>();

  const { data: stages } = useStages(tournament?.id, {
    division: division?.id,
    type: "round_robin"
  });
  const groupStage = stages?.[0];

  const createGroupStage = useCreateStage();
  const resetDraw = useDeleteStage();

  if (!stages || participantsStatus !== "success") return <LoadingBackdrop open={true}></LoadingBackdrop>

  if (tournament?.state !== "Groups") return <>Tournament is not in the gorup stage.</>

  if (!division) return;

  const groupSizes = arrangeGroups(participants.length, groupCount);

  const handleConfirmSeeding = () => {
    createGroupStage.mutate({
      name: division.name + " group stage",
      type: "round_robin",
      tournamentId: division.id,
      settings: {
        groupCount,
        size: seeding.length,
      },
      seeding
    }, {
      onSuccess: () => {
        setSnackbarSeverity("success");
        setSeeding([]);
      }
    });
  };

  const handleSkipWheel = () => {
    const unset = participants.filter(p => !seeding.some(s => s.id === p.id));
    setSeeding([...seeding, ...shuffle(unset)])
  };

  const handleResetSeeding = () => {
    setSeeding([]);
  };

  const handleWheelSelected = (option: TParticipant) => {
    setSeeding([...seeding, option]);
  }

  //TODO: maybe assign group id to participants or somewhow query participants by group
  //in order to display the made groups in here rather than just placeholders
  const groupless = participants?.filter(p => !seeding.some(s => s.id === p.id));
  const groups = groupSizes.map((n, i) => {

    //generate empty placeholder of size equals number of participants in group
    const placeholder = new Array(n).fill({});

    let k = 0; //participant number in the group

    //go through all participants in the current seeding
    //if their index (j) matches the index of the group, replace the placeholder with them
    //increment k to the positoin of next participant
    for (let j = 0; j < seeding.length; j++) {
      if (j % groupCount === i) {
        placeholder[k] = seeding[j];
        k++;
      }
    }

    return (
      <GroupTable key={i} name={`${alphabet[i]}`} participants={placeholder}></GroupTable>
    )
  })

  const handlePotentialReset = () => {
    setResetDialog(true);
  }

  const handleDialogResponse = async (choice: boolean) => {
    if (!choice) return setResetDialog(false);

    if (groupStage) await resetDraw.mutateAsync(groupStage.id);
    setResetDialog(false);
  }


  return (
    <AdminOnlyPage>

      <Stack direction={{ xs: "column", xl: "row" }} alignItems={"center"} justifyContent="center" spacing={3}>
        <LoadingBackdrop open={createGroupStage.isLoading}></LoadingBackdrop>
        <Backdrop open={!!groupStage} sx={{ zIndex: 10 }} onClick={handlePotentialReset}></Backdrop>

        <FeedbackSnackbar severity={snackbarSeverity} onClose={() => setSnackbarSeverity(undefined)}
          success="Group stage created successfully">
        </FeedbackSnackbar>

        <Dialog open={resetDialog}>
          <DialogTitle>Would you like to reset the draw?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The draw for the "{division.name}" division has already been made. Resetting it will delete all matches in the division up to this point.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogResponse(true)} variant="outlined">Yes</Button>
            <Button autoFocus onClick={() => handleDialogResponse(false)} variant="contained">No</Button>
          </DialogActions>
        </Dialog>

        {!groupStage ?
          <Box sx={{ height: "85vmin", aspectRatio: 1, position: "relative", maxWidth: "85vmin", justifyContent: "center", alignItems: "center", display: "flex" }}>
            <FortuneWheel duration={1 / spinDuration * 94} participants={groupless} onSelected={handleWheelSelected}></FortuneWheel>
          </Box> : null}

        <Container maxWidth="md">
          <DivisionPanel>
            <Container>
              <InputLabel>Number of groups</InputLabel>

              <Slider
                value={groupCount}
                onChange={(e, v) => {
                  if (!Array.isArray(v))
                    setGroupCount(v);
                }}
                min={1}
                max={Math.min(participants.length, 6)} //FIXME: brackets-viewer appers unable to handle >6 groups 
                step={1}
                marks
                valueLabelDisplay="on"
              ></Slider>
            </Container>

            <Box display="grid" gap="10px"
              gridTemplateColumns={"repeat(auto-fill, 250px)"}
              justifyContent={"center"}
            >
              {groups}
            </Box>



            <Box justifyContent={"center"} display="flex" gap={1}>

                <InputLabel>Wheel speed: </InputLabel>
              <Slider
                value={spinDuration}
                onChange={(e, v) => {
                  if (!Array.isArray(v))
                    setSpinDuration(v);
                }}
                min={50}
                max={200}
                valueLabelDisplay
              ></Slider>

              <Button onClick={handleResetSeeding} variant="outlined" color="secondary">Reset</Button>
              <Button onClick={handleSkipWheel} variant="outlined">
                Skip
              </Button>

              <Button onClick={handleConfirmSeeding} variant="contained">
                Confirm
              </Button>
            </Box>
          </DivisionPanel>
        </Container>
      </Stack >
    </AdminOnlyPage>
  )
}

function GroupTable({ name, participants }: { name: string, participants: TParticipant[] }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={5} align="center">
              <Typography variant="h6">Group {name}</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participants.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}.</TableCell>
              <TableCell>{p.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function FortuneWheel({ participants, onSelected, duration }: { participants: TParticipantPopulated[], onSelected: (option: TParticipantPopulated) => void, duration: number}) {
  const [mustSpin, setMustSpin] = useState(false);
  const [play, { stop }] = useSound(tadaPolka, {
    interrupt: true,
    playbackRate: Math.max(0.94 / duration, 0.8)
  });

  const randomN = Math.floor(Math.random() * participants.length);

  const theme = useTheme();
  const wheelOptions = participants?.map((p, i) => {
    const l = 17;
    const trimmed =
      p.name?.length > l ? p.name?.substring(0, l - 3) + "..." : p.name;

    const color = i % 2 === 0 ? theme.palette.primary.light : theme.palette.primary.main;

    console.log(p.team.bannerUrl);
    return {
      option: trimmed,
      style: {
        backgroundColor: color
      },
      image: p.team.bannerUrl ? {
        uri: p.team.bannerUrl,
        landscape: true,
        sizeMultiplier: 0.7,
        offsetX: -100
      } : undefined,
      ...p
    } as WheelData;
  });

  const isWheelVisible = participants?.length !== 0;

  const handleSpinOver = () => {
    setMustSpin(false);
    stop();

    const chosen = wheelOptions[randomN];
    onSelected(chosen);
  };

  const handleSpin = () => {
    if (!isWheelVisible || mustSpin) return;

    play();
    setMustSpin(true);
  };

  if (!isWheelVisible) return;

  return (
    <>
      <Wheel
        data={wheelOptions}
        prizeNumber={randomN}
        mustStartSpinning={mustSpin}
        onStopSpinning={handleSpinOver}
        fontSize={16}
        spinDuration={duration}
        radiusLineWidth={1}
        outerBorderWidth={2}
      ></Wheel>

      {/* position is calculated so that it's in the center and on top of the wheel */}
      {!mustSpin ? <Button onClick={handleSpin} sx={{ position: "absolute", height: "15%", width: "15%", bottom: "42.5%", left: "42.5%", zIndex: 5, borderRadius: "100%", minHeight: "50px", minWidth: "50px" }} variant="contained" color="secondary">
        Spin
      </Button> : null}
    </>
  );
}

export default DrawPage;

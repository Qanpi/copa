import { TParticipant } from "@backend/models/participant.ts";
import { AlertProps, Backdrop, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, Paper, Slider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { shuffle } from "lodash-es";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
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
import { FastForward, Label } from "@mui/icons-material";
import Dragula from "react-dragula"


const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

function arrangeGroups(participants: number, groups: number) {
  const base = Math.floor(participants / groups);

  const groupings: number[] = new Array(groups).fill(base);

  let remainder = participants % groups;

  for (let i = 0; remainder > 0; i++) {
    groupings[i] += 1;
    remainder--;
  }

  //returns an array of the numbers of participants for each group, e.g. [3, 3, 2]
  return groupings; 
}


function DrawPage() {
  const { data: tournament } = useTournament("current");
  const division = useContext(DivisionContext);

  const { data: participants, status: participantsStatus, refetch } = useQuery({
    queryKey: participantKeys.list({ division: division?.id }),
    queryFn: async () => {
      //pre-requisite API requests must've succeeded
      if (!tournament || !division) throw new Error("Invalid tournament or division.");

      const res = await axios.get(`/api/tournaments/${tournament.id}/participants?division=${division.id}`);
      return res.data as TParticipantPopulated[];
    },
    enabled: Boolean(tournament) && Boolean(division?.id),
  });

  //TODO: better way to do this?
  useEffect(() => {
    if (division) {
      setSeeding(getEmptySeeding(groupCount));
      refetch();
    }
  }, [division]);


  const [groupCount, setGroupCount] = useState(4); //default number of groups
  const nextGroupId = useRef(0); //add first participant to 0th group, then increment

  const getEmptySeeding = (groups: number) => {
    //create empty 2D array of groups : participants
    return Array.from({ length: groups }, () => [] as TParticipant[]);
  }
  const [seeding, setSeeding] = useState(() => getEmptySeeding(groupCount));

  const flatSeeding = seeding.flat();

  const participantsRef = useRef();

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

  //filtering out all the participants who have been already assigned to a group
  const groupless = participants?.filter(p => !flatSeeding.some(s => s.id === p.id));

  //get sizes for each of the groups
  const groupSizes = arrangeGroups(participants.length, groupCount);

  const handleConfirmSeeding = () => {
    //create 2D number array for manual seeding 
    //e.g. for 11 participants: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]
    const defaultOrdering = [];

    //TODO: rework the function output to already produce this structure of 2D array
    let k = 0;
    for (const size of groupSizes) {
      defaultOrdering.push(Array.from({length: size}, (_, i) => k + i + 1));
      k += size;
    }
    console.log(defaultOrdering);

    createGroupStage.mutate({
      name: division.name + " group stage",
      type: "round_robin",
      tournamentId: division.id,
      settings: {
        groupCount,
        // seedOrdering: ["groups.effort_balanced"]
        manualOrdering: defaultOrdering
      },
      seeding: flatSeeding
    }, {
      onSuccess: () => {
        setSnackbarSeverity("success");
      }
    });
  };

  //partition all participants into groups, in one go
  const handleSkipWheel = () => {
    let participantIndex = 0;
    setSeeding(seeding.map((s, i) => {
      const groupCopy = s.slice();
      while (groupCopy.length < groupSizes[i]) {
        groupCopy.push(groupless[participantIndex++]);
      }
      return groupCopy;
    }))
  };

  //empty all the progress
  const handleResetSeeding = () => {
    nextGroupId.current = 0;
    setSeeding(getEmptySeeding(groupCount));
  };

  const handleWheelSelected = (option: TParticipant) => {
    //append selected/drawn team
    setSeeding(seeding.map((group, i) => {
      if (i === nextGroupId.current) {
        return [...group, option];
      } else return group;
    }));

    //increment nextGroupId and wrap around the number of teams for next selection
    nextGroupId.current = ((nextGroupId.current + 1) % groupCount)
  }

  //TODO: maybe assign group id to participants or somewhow query participants by group
  //in order to display the made groups in here rather than just placeholders

  const drake = Dragula([]);
  drake.on("drop", (el, target, source, sibling) => {
    //the group to which the team is being dropped to
    const targetIndex = parseInt(target.getAttribute("data-group-index") || "0");
    //the group from which the team is dragged
    const sourceIndex = parseInt(source.getAttribute("data-group-index") || "0");

    //participant mongoID
    const participantId = el.getAttribute("data-participant-index");
    const participant = flatSeeding.find(p => p.id === participantId);

    if (!participant) return;

    setSeeding(seeding.map((s, i) => {
      if (i === targetIndex && i === sourceIndex) return s;

      //add to target group
      if (i === targetIndex) {
        return [...s, participant];
      }

      //remove from source group
      if (i === sourceIndex) {
        return s.filter(p => p.id !== participant.id);
      }

      return s;
    }))

    //prevent default HTML event
    drake.cancel(true);
  })

  const getContainersMap = () => {
    if (!participantsRef.current) {
      participantsRef.current = new Map();
    }

    return participantsRef.current;
  }

  const groupTables = seeding.map((group, i) => {
    return (
      <GroupTable ref={
        (node) => {
          const map = getContainersMap();
          if (node) {
            map.set(i, node);

          } else {
            map.delete(i);
          }

          const arr = Array.from(map.values());
          drake.containers = arr;
        }
      } key={i} index={i} participants={group}></GroupTable>
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

  const isWheelVisible = !groupStage && groupless && groupless.length !== 0;

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

        {isWheelVisible ?
          <Box sx={{
            height: "85vmin", aspectRatio: 1, position: "relative",
            maxWidth: "85vmin", justifyContent: "center", alignItems: "center", display: "flex"
          }}>
            <FortuneWheel onSkip={handleSkipWheel} participants={groupless} onSelected={handleWheelSelected}></FortuneWheel>
          </Box> : null}

        <Container maxWidth="md" sx={{ pt: 5 }}>
          <DivisionPanel>
            <Container>
              <InputLabel>Number of groups</InputLabel>
              <Slider
                value={groupCount}
                disabled={seeding.flat().length > 0}
                onChange={(e, v) => {
                  if (!Array.isArray(v)) {
                    setGroupCount(v);
                    setSeeding(getEmptySeeding(v));
                  }
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
              {groupTables}
            </Box>

            <Box justifyContent={"center"} display="flex" gap={1}>
              <Button onClick={handleResetSeeding} variant="outlined" color="secondary">Reset</Button>
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

const GroupTable = forwardRef(function GroupTable({ index, participants }: { index: number, participants: TParticipant[] }, ref) {
  const name = `${alphabet[index]}`

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <TableHead sx={{ width: "100%", display: "block" }}>
          <TableRow sx={{ width: "100%", display: "block" }}>
            <TableCell colSpan={5} align="center">
              <Typography variant="h6">Group {name}</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ height: "100%", display: "block" }}>
          <Box ref={ref} sx={{ height: "100%" }} data-group-index={index}>
            {participants.map((p, i) => (
              <TableRow key={i} sx={{ width: "100%" }} data-ingroup-index={i} data-participant-index={p.id}>
                <TableCell width={"100%"}>{p.name || "name"}</TableCell>
              </TableRow>
            ))}
            <Box data-ingroup-index={participants.length}></Box>
          </Box>
        </TableBody>
      </Table>
    </TableContainer>
  )
});

type FortuneWheelProps = {
  participants: TParticipantPopulated[],
  onSelected: (option: TParticipantPopulated) => void,
  onSkip: () => void
};

function FortuneWheel({ participants, onSelected, onSkip }: FortuneWheelProps) {
  const [mustSpin, setMustSpin] = useState(false);
  const [speed, setSpeed] = useState(100); //ranges from 50 to 200

  const matchMusicConstant = 94; //94 is experimentally determined to best match the music
  const spinDuration = 1 / speed * matchMusicConstant; 

  const [playPolka, { stop: stopPolka }] = useSound(tadaPolka, {
    interrupt: true,
    playbackRate: Math.max(speed / 100, 0.8) //cut-off past certain slowness
  });


  const theme = useTheme();
  const wheelOptions = participants?.map((p, i) => {
    const MAX_LENGTH = 17;
    const trimmed =
      p.name?.length > MAX_LENGTH ? p.name?.substring(0, MAX_LENGTH - 3) + "..." : p.name;

    const color = i % 2 === 0 ? theme.palette.primary.light : theme.palette.primary.main;

    const banner = p.team.bannerUrl;
    const valid = banner?.endsWith(".png") || banner?.endsWith(".jpg") || banner?.endsWith(".jpeg");

    const image = valid ? {
      uri: p.team.bannerUrl,
      // landscape: true,
      sizeMultiplier: 0.6,
      offsetY: 250
    } : undefined;

    return {
      option: trimmed,
      style: {
        backgroundColor: color
      },
      image,
      ...p
    } as WheelData;
  });

  //id of the randomly drawn participant
  const randomN = Math.floor(Math.random() * participants.length);

  const handleSpinOver = () => {
    setMustSpin(false); //wheel
    stopPolka(); //music

    const chosen = wheelOptions[randomN];
    //fire a onSelected event which will be handled by a higher-level component
    onSelected(chosen as TParticipantPopulated); 
  };

  const handleSpin = () => {
    //if already spinning
    if (mustSpin) return;

    playPolka(); //music
    setMustSpin(true); //wheel
  };

  const handleSkip = () => {
    //fire a onSkip event which will be handled by a higher-level component
    if (!mustSpin) onSkip();
  }

  return (
    <Box>
      <Box sx={{ position: "relative" }}>
        <Wheel
          data={wheelOptions}
          prizeNumber={randomN}
          mustStartSpinning={mustSpin}
          onStopSpinning={handleSpinOver}
          fontSize={16}
          spinDuration={spinDuration}
          radiusLineWidth={1}
          outerBorderWidth={2}
        ></Wheel>

        {/* position is calculated so that it's in the center and on top of the wheel */}
        {!mustSpin ? <Button onClick={handleSpin} sx={{ position: "absolute", height: "15%", width: "15%", bottom: "42.5%", left: "42.5%", zIndex: 5, borderRadius: "100%", minHeight: "50px", minWidth: "50px" }} variant="contained" color="secondary">
          Spin
        </Button> : null}
        <Button disabled={mustSpin} sx={{ position: "absolute", bottom: 10, right: 0, boxShadow: "none" }} onClick={handleSkip} variant="outlined">
          Skip
          <FastForward></FastForward>
        </Button>
      </Box>
      <Box>
        <InputLabel>Wheel speed: </InputLabel>
        <Slider
          disabled={mustSpin}
          value={speed}
          onChange={(e, v) => {
            if (!Array.isArray(v))
              setSpeed(v);
          }}
          min={50}
          max={200}
          valueLabelDisplay="auto"
        ></Slider>

      </Box>
    </Box>
  );
}

export default DrawPage;

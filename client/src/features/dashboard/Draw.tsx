import { Backdrop, Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, Paper, Slider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Wheel } from "react-custom-roulette/";
import { useTournament } from "../viewer/hooks.ts";
import { participantKeys, useParticipants } from "../participant/hooks.ts";
import { groupBy, shuffle } from "lodash-es";
import Group from "../group/Group.js";
import { DataGrid } from "@mui/x-data-grid";
import GroupStageStructure from "./GroupStage.js";
import { useDeleteStage, useStageData } from "../stage/hooks.ts";
import { divideGroups } from "./GroupStageStructure.tsx";
import { useCreateStage } from "../stage/hooks.ts";
import DivisionPanel from "./DivisionPanel.tsx";
import { DivisionContext } from "../../index.tsx";
import { useGroupStageData, useStages } from "../stage/hooks.ts";
import "./fortuneWheel.css"
import { TParticipant } from "@backend/models/participant.ts";
import { LoadingBackdrop } from "../viewer/header.tsx";

const useGroup = (id) => {
  const { data: tournament } = useTournament("current");

  return tournament?.groups.find((g) => g.id === id);
};

const useGroups = () => {
  const { data: tournament } = useTournament("current");

  return tournament?.groups;
};

const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

function arrangeGroups(participants, groups) {
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
      return res.data;
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

  const [groupCount, setGroupCount] = useState(4);
  const [seeding, setSeeding] = useState([]);

  const [resetDialog, setResetDialog] = useState(false);

  const { data: stages } = useStages(tournament?.id, {
    division: division?.id,
    type: "round_robin"
  });
  const groupStage = stages?.[0];

  const createGroupStage = useCreateStage();
  const resetDraw = useDeleteStage();

  if (!stages || participantsStatus !== "success") return <LoadingBackdrop open={true}></LoadingBackdrop>

  if (tournament?.state !== "Groups") return <>Tournament is not in the gorup stage.</>

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

  const handleWheelSelected = (option) => {
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
    <Stack sx={{ overflow: "hidden", pt: 5 }} direction={{ xs: "column", xl: "row" }} alignItems={"center"} justifyContent="center" spacing={3}>
      <Backdrop open={!!groupStage} sx={{ zIndex: 10 }} onClick={handlePotentialReset}>
      </Backdrop>
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

      {!groupStage ? <FortuneWheel participants={groupless} onSelected={handleWheelSelected}></FortuneWheel> : null}

      <Container maxWidth="md">
        <DivisionPanel>
          <Container>
            <InputLabel>Number of groups</InputLabel>

            <Slider
              value={groupCount}
              onChange={(e, v: number) => {
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


            <Button onClick={handleResetSeeding} variant="outlined" color="secondary">Reset</Button>
            <Button onClick={handleSkipWheel} variant="outlined" sx={{ mr: 3 }}>
              Skip
            </Button>

            <Button onClick={handleConfirmSeeding} variant="contained">
              Confirm
            </Button>
          </Box>
        </DivisionPanel>
      </Container>
    </Stack >
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

function FortuneWheel({ participants, onSelected }: { participants: TParticipant[] }) {
  const [mustSpin, setMustSpin] = useState(false);

  const randomN = Math.floor(Math.random() * participants.length);

  const wheelOptions = participants?.map((p) => {
    const l = 10;
    const trimmed =
      p.name?.length > l ? p.name?.substring(0, l - 3) + "..." : p.name;
    return { option: trimmed, ...p };
  });

  const isWheelVisible = participants?.length !== 0;

  const handleSpinOver = () => {
    setMustSpin(false);

    const chosen = wheelOptions[randomN];
    onSelected(chosen);
  };

  const handleSpin = () => {
    if (!isWheelVisible || mustSpin) return;

    console.log(mustSpin)
    setMustSpin(true);
  };

  const theme = useTheme();

  if (!isWheelVisible) return;

  return (
    <Box sx={{ height: "85vmin", width: "85vmin", position: "relative", minWidth: "85vmin" }}>
      <Wheel
        data={wheelOptions}
        prizeNumber={randomN}
        mustStartSpinning={mustSpin}
        onStopSpinning={handleSpinOver}
        spinDuration={0.00001} //TODO: fix later
        // fontSize={theme.typography.body1.fontSize}
      ></Wheel>

      {/* position is calculated so that it's in the center and on top of the wheel */}
      <Button onClick={handleSpin} sx={{ position: "absolute", height: "10%", width: "10%", bottom: "45%", left: "45%", zIndex: 5, borderRadius: "100%", minHeight: "50px", minWidth: "50px" }} variant="contained" color="secondary">
        Spin
      </Button>
    </Box >
  );
}

export default DrawPage;

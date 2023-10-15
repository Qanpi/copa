import {
  Container,
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputLabel,
  Typography,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  useCurrentDivisions,
  useDivisions,
  useTournament,
  useUpdateTournament,
} from "../viewer/hooks.ts";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { useParticipants } from "../participant/hooks.ts";
import { nextTick } from "process";
import { useContext, useState } from "react";
import { groupBy, isEmpty, mapKeys } from "lodash-es";
import NumberCard from "./NumberCard.tsx";
import { DivisionContext } from "../../index.tsx";
import DivisionPanel from "./DivisionPanel.tsx";

function RegistrationStage({ next, prev }) {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  const [isEarlyDialogOpen, setEarlyDialogOpen] = useState(false);
  const [notEnoughParticipants, setNotEnoughParticipants] = useState(null);

  const { data: divisions } = useDivisions(tournament?.id);
  const division = useContext(DivisionContext);
  const { data: allParticipants } = useParticipants(tournament?.id);

  const participants = allParticipants?.filter(
    (p) => p.division === division.id
  );

  //TODO: potentially refactor server-side
  const participantsByDivision = groupBy(allParticipants, "division");

  const handleClickNext = () => {
    for (const division of divisions) {
      const participants = participantsByDivision[division.id];
      //FIXME: check all divisions
      if (!participants) {
        return setNotEnoughParticipants({
          count: 0,
          division: division.name,
        });
      } else if (participants.length < 2) {
        setNotEnoughParticipants({
          count: participants.length,
          division: division.name,
        });

        return;
      }
    }

    const now = new Date();

    if (
      !tournament.registration?.to ||
      new Date(tournament.registration.to) > now
    ) {
      setEarlyDialogOpen(true);
      return;
    }

    next();
  };

  const handleDialogClose = async (response) => {
    const now = new Date();

    if (response) {
      await updateTournament.mutateAsync({
        "registration.to": now,
      });

      next();
    }

    setEarlyDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isEarlyDialogOpen} onClose={() => handleDialogClose(false)}>
        <DialogTitle>End registration early?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The registration period is still on-going. Do you want to end
            registration prematurely?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => handleDialogClose(false)}>
            No
          </Button>
          <Button onClick={() => handleDialogClose(true)}>Yes</Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="sm">
        {notEnoughParticipants ? (
          <Alert severity="error">
            <AlertTitle>Error: Not enough participants</AlertTitle>
            <Typography>
              There must be at least 2 registered participant(s) in the '
              {notEnoughParticipants.division}' division before proceeding to
              the next stage.
            </Typography>
          </Alert>
        ) : null}

        <Stack spacing={5}>
          <DivisionPanel>
            <NumberCard number={participants?.length}>
              team(s) registered
            </NumberCard>
          </DivisionPanel>

          <RegistrationPane></RegistrationPane>
        </Stack>

        <Button onClick={handleClickNext}>Next</Button>
      </Container>
    </>
  );
}

function RegistrationPane() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  if (tournamentStatus !== "success") return "bruh";

  const to = tournament.registration?.to;
  const from = tournament.registration?.from;
  return (
    <Formik
      initialValues={{
        registration: {
          from: from ? dayjs(from) : null,
          to: to ? dayjs(to) : null,
        },
      }}
      validationSchema={Yup.object({
        registration: Yup.object({
          from: Yup.date().required(),
          to: Yup.date()
            .required()
            .when(["from"], ([from], schema) => {
              if (from) return schema.min(dayjs(from)); //can be on the same day, but not before
            }),
        }),
      })}
      onSubmit={(values) => {
        updateTournament.mutate(values);
      }}
    >
      {({ values, setFieldValue, submitForm, validateForm, isValid, touched }) => (
        <Form>
          <InputLabel sx={{ mb: 1 }}>Open registration</InputLabel>
          <Stack direction="row" spacing={2}>
            <MyDatePicker
              label="from 00:00 on"
              name="registration.from"
              minDate={dayjs()}
              onChange={(value) => {
                setFieldValue("registration.from", dayjs(value).startOf("day"));
                submitForm()
              }}
            />
            <MyDatePicker
              disablePast
              label="to 23:59 on"
              name="registration.to"
              minDate={values.registration.from}
              onChange={async (value) => {
                setFieldValue("registration.to", dayjs(value).endOf("day"));
                submitForm() 
              }}
            />
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default RegistrationStage;

import {
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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useTournament, useUpdateTournament } from "../tournament/hooks.ts";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { useParticipants } from "../participant/hooks.ts";
import { nextTick } from "process";
import { useState } from "react";

function RegistrationStage({ next, prev }) {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  const { data: participants } = useParticipants();

  const [isEarlyDialogOpen, setEarlyDialogOpen] = useState(false);
  const [isZeroParticipantAlertOpen, setZeroParticipantAlertOpen] =
    useState(false);

  const handleClickNext = async () => {
    if (participants.length === 0) {
      setZeroParticipantAlertOpen(true);
      return;
    }

    const now = new Date();

    if (new Date(tournament.registration.to) > now) {
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

  if (tournamentStatus !== "success") return "bruh";

  const { to, from } = tournament.registration;

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
          <Button autofocus onClick={() => handleDialogClose(false)}>
            No
          </Button>
          <Button onClick={() => handleDialogClose(true)}>Yes</Button>
        </DialogActions>
      </Dialog>

      {isZeroParticipantAlertOpen ? (
        <Alert severity="error">
          <AlertTitle>Error: 0 participants</AlertTitle>
          <Typography>
            Can't proceed to the next stage with 0 participants.
          </Typography>
        </Alert>
      ) : null}

      <Formik
        initialValues={{
          registration: {
            from: from && dayjs(from),
            to: to && dayjs(to),
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
        {({ values, setFieldValue }) => (
          <Form>
            <div className="registration">
              <InputLabel>Open registration</InputLabel>
              <MyDatePicker label="from 00:00 on" name="registration.from" />
              <MyDatePicker
                disablePast
                label="to 23:59 on"
                name="registration.to"
                minDate={values.registration.from}
                onChange={(value) =>
                  setFieldValue("registration.to", dayjs(value).endOf("day"))
                }
              />
            </div>

            <Button type="submit">Confirm</Button>
          </Form>
        )}
      </Formik>
      <Card>
        <CardContent>
          <Typography variant="h2">{participants?.length}</Typography>
          team(s) registered
        </CardContent>
      </Card>

      <Button onClick={handleClickNext}>Next</Button>
    </>
  );
}

export default RegistrationStage;

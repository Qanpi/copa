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
import { useCurrentDivisions, useTournament, useUpdateTournament } from "../tournament/hooks.ts";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { useParticipants } from "../participant/hooks.ts";
import { nextTick } from "process";
import { useState } from "react";
import { isEmpty } from "lodash-es";
import NumberCard from "./NumberCard.tsx";

function RegistrationStage({ next, prev }) {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  const { data: participants } = useParticipants({
    tournament_id: tournament?.id,
  });

  const [isEarlyDialogOpen, setEarlyDialogOpen] = useState(false);
  const [notEnoughParticipants, setNotEnoughParticipants] = useState(false);

  const handleClickNext = () => {
    if (participants.length < 2) {
      setNotEnoughParticipants(true);
      return;
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

  if (tournamentStatus !== "success") return "bruh";

  const to = tournament.registration?.to;
  const from = tournament.registration?.from;

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

      {notEnoughParticipants ? (
        <Alert severity="error">
          <AlertTitle>Error: Not enough participants</AlertTitle>
          <Typography>
            Can't proceed to the next stage with {participants.length}{" "}
            participant(s).
          </Typography>
        </Alert>
      ) : null}

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
        {({ values, setFieldValue, submitForm, validateForm, isValid }) => (
          <Form>
            <div className="registration">
              <InputLabel>Open registration</InputLabel>
              <MyDatePicker
                label="from 00:00 on"
                name="registration.from"
                disablePast
              />
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

      <DashPane></DashPane>

      <Button
        onClick={async () => {
          // //workaround because formik is dumb
          // //see: https://github.com/jaredpalmer/formik/issues/1580
          // await submitForm();
          // const errors = await validateForm();

          // if (isEmpty(errors))
          handleClickNext();
        }}
      >
        Next
      </Button>
    </>
  );
}

function DashPane() {
  const { data: participants } = useParticipants();

  return (
    <NumberCard number={participants?.length}>team(s) registered</NumberCard>
  );
}

export default RegistrationStage;

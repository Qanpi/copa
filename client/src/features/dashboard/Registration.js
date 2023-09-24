import {
  Button,
  Card,
  CardContent,
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

function RegistrationStage({next, prev}) {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  const { data: participants } = useParticipants();

  if (tournamentStatus !== "success") return "bruh";

  const handleClickNext = async () => {
    const now = new Date();

    if (new Date(tournament.registration.to) > now) {
      alert("end early?");

      await updateTournament.mutateAsync({
        registration: {
          to: now
        }
      })
    }

    next();
  };

  return (
    <>
      <Formik
        initialValues={{
          registration: {
            from: tournament.registration.from
              ? dayjs(tournament.registration.from)
              : null,
            to: tournament.registration.to
              ? dayjs(tournament.registration.to)
              : null,
          },
        }}
        validationSchema={Yup.object({
          registration: Yup.object({
            from: Yup.date().required(),
            to: Yup.date()
              .required()
              .when(["from"], ([from], schema) => {
                if (from) return schema.min(dayjs(from).add(1, "day")); //can't be on the same day
              }),
          }),
        })}
        onSubmit={(values) => {
          updateTournament.mutate(values);
        }}
      >
        {({ values }) => (
          <Form>
            <div className="registration">
              <InputLabel>Open registration</InputLabel>
              <MyDatePicker label="from" name="registration.from" />
              <MyDatePicker
                disablePast
                label="to"
                name="registration.to"
                minDate={values.registration.from?.add(1, "day")}
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

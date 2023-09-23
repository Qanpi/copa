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

function RegistrationStage() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  //FIXME: custom hook extract needed
  const { status, data: participations } = useQuery({
    queryKey: ["participations"],
    queryFn: async () => {
      const res = await axios.get(`/api/participants`);
      return res.data;
    },
  });

  if (tournamentStatus !== "success") return "bruh";

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
        <CardContent>Teams registered</CardContent>
      </Card>
    </>
  );
}

export default RegistrationStage;

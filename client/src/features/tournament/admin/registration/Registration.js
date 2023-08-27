import {
  Button,
  Card,
  CardContent,
  InputLabel,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useTournament } from "../../../..";
import MyDatePicker from "../../../inputs/datePicker/MyDatePicker";
import { useUpdateTournament } from "../dashboard/Dashboard";

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
          from: Yup.date(),
          to: Yup.date()
            .when(["from"], ([from], schema) => {
              if (from) return schema.min(dayjs(from).add(1, "day")); //can't be on the same day
            }),
        }),
      })}
      onSubmit={(values) => {
        updateTournament.mutate(values);
      }}
    >
      {(formik) => (
        <>
          <Form>
            <Typography>Settings?</Typography>
            <div className="registration">
              <InputLabel>Open registration</InputLabel>
              <MyDatePicker disablePast label="from" name="registration.from" />
              <MyDatePicker
                disablePast
                label="to"
                name="registration.to"
                minDate={formik.values.registration.from?.add(1, "day")}
              />
            </div>

            <Button type="submit">Confirm</Button>
            <Card sx={{ width: 1 / 2, height: 200 }}>
              <CardContent>
                <Typography variant="h3">{participations?.length}</Typography>
                <Typography>currently registered</Typography>
              </CardContent>
            </Card>
          </Form>

          {/* <Dialog open={openDialog}>
            <DialogTitle>{"Proceed to group stages prematurely?"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Moving to the group stages before registration is over will
                abruptly end the registration process.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={() => handleDialogResponse(false)}>
                No
              </Button>
              <Button onClick={() => handleDialogResponse(true)}>Yes</Button>
            </DialogActions>
          </Dialog> */}
        </>
      )}
    </Formik>
  );
}

export default RegistrationStage;

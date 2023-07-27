import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputLabel,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { useTournament } from "../../..";
import MyDatePicker from "../../../components/inputs/MyDatePicker/mydatepicker";

function AdminRegistrationPage({ moveToNextStage }) {
  const [openDialog, setOpenDialog] = useState(false);
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");

  const queryClient = useQueryClient();
  const updateTournament = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(
        `/api/tournaments/${tournament.id}`,
        values
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", "current"]);
    },
  });

  //FIXME: custom hook extract needed
  const { status, data: participations } = useQuery({
    queryKey: ["participations"],
    queryFn: async () => {
      const res = await axios.get(`/api/participations`);
      return res.data;
    },
  });

  const handleMoveToNextStage = () => {
    if (tournament.registration?.to <= new Date()) {
      moveToNextStage.mutate();
    } else {
      setOpenDialog((b) => true);
    }
  };

  const handleDialogResponse = (userConfirmed) => {
    if (userConfirmed) {
      moveToNextStage.mutate();
    } else {
      setOpenDialog((b) => false);
    }
  };

  if (tournamentStatus !== "success") return "bruh";

  return (
    <Formik
      initialValues={{
        registration: {
          from: tournament.registration.from
            ? dayjs(tournament.registration.from)
            : dayjs().endOf("day"),
          to: tournament.registration.to
            ? dayjs(tournament.registration.to)
            : dayjs().add(7, "day").endOf("day"),
        },
      }}
      validationSchema={Yup.object({
        registration: Yup.object({
          from: Yup.date().min(dayjs()).required(),
          to: Yup.date()
            .required()
            .when(["from"], ([from], schema) => {
              if (from) return schema.min(dayjs(from).add(1, "day")); //can't be on the same day
            }),
        }),
      })}
      onSubmit={(values) => updateTournament.mutate(values)}
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
                minDate={formik.values.registration.from.add(1, "day")}
              />
            </div>

            <Button type="submit">Confirm</Button>
            <Card sx={{ width: 1 / 2, height: 200 }}>
              <CardContent>
                <Typography variant="h3">{participations?.length}</Typography>
                <Typography>currently registered</Typography>
              </CardContent>
            </Card>
            <div>
              <Button disabled>Back</Button>
              <Button
                onClick={async () => {
                  await formik.submitForm();
                  if (formik.isValid) handleMoveToNextStage();
                }}
              >
                Next stage
              </Button>
            </div>
          </Form>
          <Dialog open={openDialog}>
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
          </Dialog>
        </>
      )}
    </Formik>
  );
}

export default AdminRegistrationPage;

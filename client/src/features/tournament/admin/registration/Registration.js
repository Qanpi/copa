import {
  Button,
  Card,
  CardContent,
  InputLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  AlertTitle,
  Alert
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useTournament } from "../../../..";
import MyDatePicker from "../../../inputs/datePicker/MyDatePicker";
import {
  useMutateNextStage,
  useMutatePreviousStage,
  useUpdateTournament,
} from "../dashboard/Dashboard";
import { useState } from "react";
import { useParticipants } from "../../../participant/hooks";

const ZeroParticipantsAlert = ({open}) => {
  if (!open) return null;

  return (
    <Alert severity="error">
      <AlertTitle>
        Error.
      </AlertTitle>
      Unable to proceed past registration with 0 participants.
    </Alert>
  );
};

function RegistrationStage() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);
  const moveToNextStage = useMutateNextStage();

  const {data: participants} = useParticipants();

  const [alertOpen, setAlertOpen] = useState(false);

  const handleClickNextStage = () => {
    if (participants.length === 0) {
      setAlertOpen(true);
      return;
    }
    moveToNextStage();
  };

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
          to: Yup.date().when(["from"], ([from], schema) => {
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
            <ZeroParticipantsAlert open={alertOpen}></ZeroParticipantsAlert>
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
                <Typography variant="h3">{participants?.length}</Typography>
                <Typography>currently registered</Typography>
              </CardContent>
            </Card>
          </Form>

          <Button onClick={handleClickNextStage}>Next Stage</Button>

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

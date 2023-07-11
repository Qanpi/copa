import AdminCalendar from "../../../components/AdminCalendar/admincalendar";
import MyChecklist from "../../../components/MyChecklist/mychecklist";
import { useContext } from "react";
import { TournamentContext } from "../../..";
import { DatePicker } from "@mui/x-date-pickers";
import { Button, ButtonGroup, InputLabel, Typography } from "@mui/material";
import MyDatePicker from "../../../components/MyDatePicker/mydatepicker";
import { Formik, Form, yupToFormErrors, validateYupSchema } from "formik";
import dayjs from "dayjs";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import MyAlertDialog from "../../../components/MyAlertDialog/myalertdialog";

function AdminRegistrationPage({ id }) {
  const [openDialog, setOpenDialog] = useState(false);
  const tournament = useContext(TournamentContext);

  const queryClient = useQueryClient();

  const updateTournament = useMutation({
    mutationFn: async (values) => {
      const res = await axios.put(`/api/tournaments/${tournament.id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", "current"]);
    },
  });

  const handleMoveToNextStage = () => {
    if (tournament.isRegistrationOver) {
      updateTournament.mutate({ stageId: id + 1 });
    } else {
      setOpenDialog((b) => true);
    }
  };

  const handleDialogResponse = (userConfirmed) => {
    if (userConfirmed) {
      updateTournament.mutate({
        registration: { to: dayjs(new Date()) },
        stageId: id + 1,
      });
    } else {
      setOpenDialog((b) => false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          registration: {
            from: dayjs(tournament.registration.from || new Date()),
            to: dayjs(new Date()),
          },
        }}
        validationSchema={Yup.object({
          registration: Yup.object({
            from: Yup.date().min(dayjs(new Date())).required(),
            to: Yup.date()
              .when(["from"], (from, schema) => {
                return schema.min(from);
              })
              .required(),
          }),
        })}
        onSubmit={(values) => updateTournament.mutate(values)}
      >
        <Form>
          <Typography>Settings?</Typography>
          <div className="registration">
            <InputLabel>Open registration</InputLabel>
            <MyDatePicker label="from" name="registration.from" />
            <MyDatePicker label="to" name="registration.to" />
          </div>
          <Button disabled>Cancel</Button>
          <Button type="submit">Confirm</Button>
        </Form>
      </Formik>
      <div>Registration stats</div>
      <div>
        <Button disabled>Back</Button>
        <Button onClick={handleMoveToNextStage}>Next stage</Button>
      </div>
      <MyAlertDialog
        open={openDialog}
        handleBoolConfirm={handleDialogResponse}
      ></MyAlertDialog>
    </>
  );
}

export default AdminRegistrationPage;

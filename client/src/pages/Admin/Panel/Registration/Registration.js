import { useContext } from "react";
import { Button, ButtonGroup, InputLabel, Typography } from "@mui/material";
import { TournamentContext } from "../../../..";
import { Formik, Form, yupToFormErrors, validateYupSchema } from "formik";
import dayjs from "dayjs";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import MyAlertDialog from "../../../../components/MyAlertDialog/myalertdialog";
import MyDatePicker from "../../../../components/MyDatePicker/mydatepicker";

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
    console.log(tournament)
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
              if (from) return schema.min(from);
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
                minDate={formik.values.registration.from}
              />
            </div>
            <Button type="submit">Confirm</Button>
            <div>Registration stats</div>
            <div>
              <Button disabled>Back</Button>
              <Button
                onClick={() => {
                    //ugly code cuz of fucking formik bithc ass shit 
                    // can't even fix their submitForm promise
                  formik.validateForm().then((err) => {
                    if (Object.keys(err).length) formik.submitForm();
                    else handleMoveToNextStage();
                  });
                }}
              >
                Next stage
              </Button>
            </div>
          </Form>
          <MyAlertDialog
            open={openDialog}
            handleBoolConfirm={handleDialogResponse}
          ></MyAlertDialog>
        </>
      )}
    </Formik>
  );
}

export default AdminRegistrationPage;

import { useContext } from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, ButtonGroup, InputLabel, Typography } from "@mui/material";
import { TournamentContext } from "../../../..";
import { Formik, Form, yupToFormErrors, validateYupSchema } from "formik";
import dayjs from "dayjs";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import MyDatePicker from "../../../../components/MyDatePicker/mydatepicker";

function AdminRegistrationPage({ moveToNextStage }) {
  const [openDialog, setOpenDialog] = useState(false);
  const tournament = useContext(TournamentContext);
  
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

  return (
    <Formik
      initialValues={{
        registration: {
          from: tournament.registration
            ? dayjs(tournament.registration.from)
            : null,
          to: tournament.registration
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
                  formik.submitForm();
                  if (formik.isValid) handleMoveToNextStage()
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

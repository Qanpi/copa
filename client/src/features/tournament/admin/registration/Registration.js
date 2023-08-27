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
  Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Form, Formik, useFormikContext } from "formik";
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

const PrematureSkipDialog = ({ open, handleResponse }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>{"Proceed to group stages prematurely?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Moving to the group stages before registration is over will abruptly
          end the registration process.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => handleResponse(false)}>
          No
        </Button>
        <Button onClick={() => handleResponse(true)}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

const RegistrationForm = () => {

  const [alertOpen, setAlertOpen] = useState(false);
  const { data: participants } = useParticipants();

  const [dialogOpen, setDialogOpen] = useState(false);

  const {values} = useFormikContext();

  const handleClickNextStage = async () => {
    if (participants.length === 0) {
      return setAlertOpen(true);
    }

    if (values.registration.to > dayjs()) {
      return setDialogOpen(true);
    }

  };

  const handleDialogResponse = (confirmed) => {
    if (confirmed) {
    }
  }

  return <div></div>
};

function RegistrationStage() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  if (tournamentStatus !== "success") return "bruh";

  return <div>tets</div>
}

export default RegistrationStage;

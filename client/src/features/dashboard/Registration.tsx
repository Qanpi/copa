import { ArrowRight, ArrowLeft } from "@mui/icons-material";
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputLabel,
  Stack,
  ThemeProvider,
  Typography,
  Snackbar,
} from "@mui/material";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { groupBy } from "lodash-es";
import { useContext, useState } from "react";
import * as Yup from "yup";
import { DivisionContext } from "../../index.tsx";
import { lightTheme } from "../../themes.ts";
import MyDatePicker from "../inputs/MyDatePicker.js";
import { useParticipants } from "../participant/hooks.ts";
import {
  useDivisions,
  useTournament,
  useUpdateTournament,
} from "../viewer/hooks.ts";
import DivisionPanel from "./DivisionPanel.tsx";
import NumberCard from "./NumberCard.tsx";

function RegistrationStage({ next, prev }) {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");
  const updateTournament = useUpdateTournament(tournament?.id);

  const [isEarlyDialogOpen, setEarlyDialogOpen] = useState(false);
  const [notEnoughParticipants, setNotEnoughParticipants] = useState(null);

  const { data: divisions } = useDivisions(tournament?.id);
  const division = useContext(DivisionContext);
  const { data: allParticipants } = useParticipants(tournament?.id);

  const participants = allParticipants?.filter(
    (p) => p.division === division.id
  );

  //TODO: potentially refactor server-side
  const participantsByDivision = groupBy(allParticipants, "division");

  const handleClickNext = () => {
    for (const division of divisions) {
      const participants = participantsByDivision[division.id];
      //FIXME: check all divisions
      if (!participants) {
        return setNotEnoughParticipants({
          count: 0,
          division: division.name,
        });
      } else if (participants.length < 2) {
        setNotEnoughParticipants({
          count: participants.length,
          division: division.name,
        });

        return;
      }
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

  const handleClickBack = () => {

  }

  return (
    <Container maxWidth={"sm"}>
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

      <Stack spacing={5}>
        {notEnoughParticipants ? (
          <ThemeProvider theme={lightTheme}>
            <Alert severity="error">
              <AlertTitle>Error: Not enough participants</AlertTitle>
              <Typography variant="body1">
                There must be at least 2 registered participant(s) in the '
                {notEnoughParticipants.division}' division before proceeding to
                the next stage.
              </Typography>
            </Alert>
          </ThemeProvider>
        ) : null}

        <RegistrationPane></RegistrationPane>

        <DivisionPanel>
          <NumberCard number={participants?.length}>
            team(s) registered
          </NumberCard>
        </DivisionPanel>

        <Stack spacing={3} direction="row" alignItems="center" justifyContent="center">
          <Button startIcon={<ArrowLeft></ArrowLeft>} onClick={handleClickBack}>
            Go back
          </Button>
          <Button endIcon={<ArrowRight></ArrowRight>} onClick={handleClickNext}>
            Proceed
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}

function RegistrationPane() {
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");

  const updateTournament = useUpdateTournament(tournament?.id);
  const [updateSnackbar, setUpdateSnackbar] = useState(false);

  if (tournamentStatus !== "success") return "bruh";

  const to = tournament.registration?.to;
  const from = tournament.registration?.from;
  return (
    <Formik
      initialValues={{
        registration: {
          from: from ? dayjs(from) : undefined,
          to: to ? dayjs(to) : undefined,
        },
      }}
      validationSchema={Yup.object({
        registration: Yup.object({
          from: Yup.date().required(),
          to: Yup.date()
            .when(["from"], ([from], schema) => {
              if (from) return schema.min(dayjs(from)); //can be on the same day, but not before
            }),
        }),
      })}
      onSubmit={(values) => {
        updateTournament.mutate({
          ...values,
          registration: {
            from: values.registration.from?.toDate(),
            to: values.registration.to?.toDate()
          }
        }, {
          onSuccess: () => setUpdateSnackbar(true)
        });
      }}
    >
      {({
        values,
        setFieldValue,
        submitForm,
        validateForm,
        isValid,
        touched,
      }) => (
        <Form>
          <Snackbar open={updateSnackbar} anchorOrigin={{ horizontal: "right", vertical: "bottom" }} onClose={() => setUpdateSnackbar(false)} autoHideDuration={3000}>
            <Alert severity="success">
              Your changes have been saved.
            </Alert>
          </Snackbar>
          <InputLabel sx={{ mb: 2 }}>Open registration</InputLabel>
          <Stack direction="row" spacing={2}>
            <MyDatePicker
              label="from 00:00 on"
              name="registration.from"
              minDate={dayjs()}
              onChange={async (value) => {
                await setFieldValue("registration.from", dayjs(value).startOf("day"));
                submitForm();
              }}
            />
            <MyDatePicker
              disablePast
              label="to 23:59 on"
              name="registration.to"
              minDate={values.registration.from}
              onChange={async (value) => {
                await setFieldValue("registration.to", dayjs(value).endOf("day"));
                submitForm();
              }}
            />
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default RegistrationStage;

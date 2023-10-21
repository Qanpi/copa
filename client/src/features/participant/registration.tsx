import { Box, Stack, Button, ContainerOwnProps, MenuItem, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import MySelect from "../inputs/mySelect.tsx";
import MyTextField from "../inputs/myTextField.tsx";
import { teamValidationSchema } from "../team/CreateTeam.tsx";
import { useTeam, useUpdateTeam } from "../team/hooks.ts";
import { useUser } from "../user/hooks.ts";
import { divisionKeys, useDivisions, useTournament } from "../viewer/hooks.ts";
import { participantKeys, useParticipants } from "./hooks.ts";
import { LoadingBackdrop } from "../layout/LoadingBackdrop.tsx";
import { GoogleSignInButton } from "../user/userpanel.tsx";
import NoTeamPage from "../team/NoTeamPage.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import { TParticipant } from "@backend/models/participant.ts";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import OutlinedContainer from "../layout/OutlinedContainer.tsx";
import { FeedbackSnackbar } from "../layout/FeedbackSnackbar.tsx";
import { TFeedback } from "../types.ts";

function RegistrationPage() {
  const { data: tournament } = useTournament("current");
  const { data: user, status: userStatus } = useUser("me");
  const { data: team, status: teamStatus } = useTeam(user?.team?.name);

  const unregisterTeam = useDeleteParticipant();

  const { data: participants, status: participantStatus } = useParticipants(tournament?.id, {
    team: user?.team?.id,
  });
  const participant = participants?.[0];

  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (userStatus === "success" && !user)
  //     return navigate(`/login`)

  //   if (userStatus === "success" && !user?.team) {
  //     return navigate(`/team/none`); //TODO: redirect back frm here to registration
  //   }
  // }, [user]);
  const getActivePrompt = () => {
    if (!tournament?.registration?.isOpen) {
      //FIXME: make sure the types checkout (Date and string)
      const from = tournament?.registration?.from;
      const to = tournament?.registration?.to;

      if (!from || new Date(from) > new Date()) {
        return (
          <PromptContainer>
            <Typography>Slow down. Registration hasn't begun yet.</Typography>
          </PromptContainer>
        );
      }

      if (to && new Date(to) < new Date()) {
        return (
          <PromptContainer>
            <Typography>Dang, the registration has ended. You can try contacting the organizer.</Typography>
          </PromptContainer>
        );
      }
    }

    if (participant) {
      return (
        <BannerPage title="Congratulations!">
          <PromptContainer>
            <Stack direction="column" spacing={2} sx={{ mt: 3 }}>
              <Typography variant="h5">{team.name} is registered.</Typography>
              <Button variant="outlined" onClick={() => unregisterTeam.mutate({ id: participant.id })}>
                Deregister
              </Button>
            </Stack>
          </PromptContainer>
        </BannerPage>
      );
    }

    if (!user) return <PromptContainer>
      <Typography>Please sign in to proceed.</Typography>
    </PromptContainer>

    if (!user.team) return <NoTeamPage></NoTeamPage>;

    //FIXME: manager context
    if (team.manager === user.id) {
      return <BannerPage title={`Register for ${tournament.name}`}>
        <RegistrationForm></RegistrationForm>;
      </BannerPage>
    }

    return <PromptContainer maxWidth="sm">
      <OutlinedContainer>
        <Typography>Please ask the manager of your team to submit the registration.</Typography>
      </OutlinedContainer>
    </PromptContainer>

  }

  return (
    <>
      {getActivePrompt()}
    </>
  );
}

function RegistrationForm() {
  const { data: tournament } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);

  const { data: user } = useUser("me");
  const { data: team } = useTeam(user?.team?.name);
  const updateTeam = useUpdateTeam();

  const queryClient = useQueryClient();
  const registerParticipant = useMutation({
    mutationFn: async (values: Partial<TParticipant>) => {
      const res = await axios.post(
        `/api/tournaments/${tournament.id}/participants`,
        values
      );

      return res.data as TParticipant;
    },
    onSuccess: (data) => {
      //TODO: convert to optimistic updates
      queryClient.invalidateQueries(participantKeys.id(data.id));
      queryClient.invalidateQueries(participantKeys.list({ team: data.team }));
      queryClient.invalidateQueries(participantKeys.list({ division: data.division }));
    },
  });

  const [feedback, setFeedback] = useState<TFeedback>({});

  return (
    <PromptContainer>
      <Formik
        initialValues={{
          ...team,
          division: "",
        }}
        validationSchema={Yup.object({
          ...teamValidationSchema,
          division: Yup.string().required(),
        })}
        onSubmit={(values) => {
          updateTeam.mutate(values, {
            onSuccess: (team) => {
              const selected = divisions.find(
                (d) => d.name === values.division
              );

              if (!selected)
                return setFeedback({severity: "error", message: "Unrecognized division."})

              //TODO: error handling
              registerParticipant.mutate({
                division: selected.id,
                team: team.id,
                name: team.name,
                phoneNumber: team.phoneNumber,
              });
            },
          });
        }}
      >
        <Form>
          <FeedbackSnackbar severity={feedback.severity} message={feedback.message}></FeedbackSnackbar>
          <Typography variant="h6" sx={{ mb: 2 }} color="primary">Please verify the information below</Typography>
          <Stack direction="column" spacing={1}>
            <MyTextField name="name" label="Team name"></MyTextField>
            <MyTextField label="Phone number" name="phoneNumber"></MyTextField>
          </Stack>
          <Stack direction="row" sx={{ width: "100%", mt: 5 }} display={"flex"} justifyContent={"space-between"} alignItems="center">
            <MySelect label="Division" name="division" sx={{ mr: 3, flexGrow: 1 }}>
              {divisions?.map((d) => (
                <MenuItem value={d.name} key={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </MySelect>
            <Button type="submit" variant='contained' sx={{ height: "100%" }}>Register</Button>
          </Stack>
        </Form>
      </Formik>
    </PromptContainer >
  );
}

export const useDeleteParticipant = () => {
  const { data: tournament } = useTournament("current");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { id: string }) => {
      const res = await axios.delete(
        `/api/tournaments/${tournament.id}/participants/${values.id}`
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      //TODO: optimistic updates
      queryClient.invalidateQueries(participantKeys.id(variables.id));
      queryClient.invalidateQueries(participantKeys.lists);
    },
  });
};

export default RegistrationPage;

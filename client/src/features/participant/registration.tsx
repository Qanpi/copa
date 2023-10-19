import { Box, Stack, Button, Container, ContainerOwnProps, ContainerProps, MenuItem, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import MySelect from "../inputs/mySelect.tsx";
import MyTextField from "../inputs/myTextField.tsx";
import { teamValidationSchema } from "../team/CreateTeam.tsx";
import { useTeam, useUpdateTeam } from "../team/hooks.ts";
import { useUser } from "../user/hooks.ts";
import { divisionKeys, useDivisions, useTournament } from "../viewer/hooks.ts";
import { participantKeys, useParticipants } from "./hooks.ts";
import { LoadingBackdrop } from "../viewer/header.tsx";
import { GoogleSignInButton } from "../user/userMenu/userpanel.tsx";
import NoTeamPage from "../team/NoTeamPage.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import { TParticipant } from "@backend/models/participant.ts";

//team member -> ask manager
//team manager -> register
//teamless -> join/create team
//registered -> alr registered
export const PromptContainer = (props: ContainerProps) => {
  const { children, sx: propsSx, ...rest } = props;

  return <Container sx={{ minHeight: "600px", justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", pt: 5, ...propsSx }} maxWidth="md" {...rest}>
    {children}
  </Container>
}

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
  //     return navigate(`/teams/none`); //TODO: redirect back frm here to registration
  //   }
  // }, [user]);
  const getActivePrompt = () => {
    console.log(tournament)
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

    if (!user) return <PromptContainer>
      <Typography>Please sign in to proceed.</Typography>
    </PromptContainer>

    if (!user.team) return <NoTeamPage></NoTeamPage>;

    if (participantStatus !== "success") return <LoadingBackdrop open={true}></LoadingBackdrop>

    if (participant) {
      const terms = ["Revoke registration", "Deregister", "Unregister", "Undo registration", "Delete registration", "Remove registration"]
      const random = Math.floor(Math.random() * terms.length);

      return (
        <PromptContainer>
          <Typography variant="h5">Congratulations! {team.name} is already registered.</Typography>
          <Button sx={{ mt: 3 }} variant="outlined" onClick={() => unregisterTeam.mutate({ id: participant.id })}>
            {terms[random]}
          </Button>
        </PromptContainer>
      );
    }

    if (!team) return <LoadingBackdrop open={true}></LoadingBackdrop>

    //FIXME: manager context
    if (team.manager === user.id) {
      return <RegistrationForm></RegistrationForm>;
    }

    return <>
      <div>
        <p>You are currently a member of {user?.team?.name}</p>
        <p>Please ask the leader of your team to register.</p>
        <p>
          If you wish to play in another team, please leave the current one and
          join/create a new team.
        </p>
      </div>
    </>
  }

  if (userStatus !== "success" || !tournament) return <LoadingBackdrop open={true}></LoadingBackdrop>

  return (
    <BannerPage title={"Register"}>
      {getActivePrompt()}
    </BannerPage>
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
          <Typography variant="h6" sx={{ mb: 1 }}>Please verify the information below</Typography>
          <Stack direction="column" spacing={1}>
            <MyTextField name="name" label="team name"></MyTextField>
            <MyTextField label="phone number" name="phoneNumber"></MyTextField>
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

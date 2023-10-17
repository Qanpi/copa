import { Button, Container, ContainerOwnProps, ContainerProps, MenuItem, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import MySelect from "../inputs/mySelect.js";
import MyTextField from "../inputs/myTextField.tsx";
import { teamValidationSchema } from "../team/CreateTeam.tsx";
import { useTeam, useUpdateTeam } from "../team/hooks.ts";
import { useUser } from "../user/hooks.ts";
import { useDivisions, useTournament } from "../viewer/hooks.ts";
import { useParticipants } from "./hooks.ts";
import { LoadingBackdrop } from "../viewer/header.tsx";
import { GoogleSignInButton } from "../user/userMenu/userpanel.tsx";
import NoTeamPage from "../team/NoTeamPage.tsx";
import BannerPage from "../viewer/BannerPage.tsx";

//team member -> ask manager
//team manager -> register
//teamless -> join/create team
//registered -> alr registered
export const PromptContainer = (props: ContainerProps) => {
  const { children, ...rest } = props;

  return <Container sx={{ minHeight: "400px", justifyContent: "center", alignItems: "center", display: "flex" }} maxWidth="md" {...rest}>
    {children}
  </Container>
}

function RegistrationPage() {
  const { data: tournament } = useTournament("current");
  const { data: user, status: userStatus } = useUser("me");
  const { data: team } = useTeam(user?.team?.name);

  const unregisterTeam = useDeleteParticipant();

  const { data: participants } = useParticipants(tournament?.id, {
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
    const from = tournament?.registration?.from;
    const to = tournament?.registration?.to;

    if (!from || from > new Date()) {
      return (
        <PromptContainer>

          <Typography>Slow down. Registration hasn't begun yet.</Typography>
        </PromptContainer>
      );
    }

    if (to && to < new Date()) {
      return (
        <PromptContainer>
          <Typography>Dang, the registration has ended. You can try contacting the organizer.</Typography>
        </PromptContainer>
      );
    }

    if (userStatus !== "success") return <LoadingBackdrop open={true}></LoadingBackdrop>;

    if (!user) return <PromptContainer>
      <Typography>Please sign in to proceed.</Typography>
    </PromptContainer>

    if (!user.team) return <NoTeamPage></NoTeamPage>;

    if (participant) {
      return (
        <>
          <div>Congratulations! Your team is already registered.</div>
          <Button onClick={() => unregisterTeam.mutate({ id: participant.id })}>
            Unregister
          </Button>
        </>
      );
    }

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
    mutationFn: async (values) => {
      const res = await axios.post(
        `/api/tournaments/${tournament.id}/participants`,
        values
      );

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participation"]);
    },
  });

  return (
    <>
      <Typography variant="h6">Please verify the information below</Typography>
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
          <MyTextField name="name" label="name"></MyTextField>
          <MyTextField label="Phone number" name="phoneNumber"></MyTextField>
          <MySelect label="Division" name="division">
            {divisions?.map((d) => (
              <MenuItem value={d.name} key={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </MySelect>
          <Typography>
            To update more info, head over to your team profile.
          </Typography>
          <Button type="submit">Register</Button>
        </Form>
      </Formik>
    </>
  );
}

export const useDeleteParticipant = () => {
  const tournament = useTournament("current");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.delete(
        `/api/tournaments/${tournament.id}/participants/${values.id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participations"]);
    },
  });
};

export default RegistrationPage;

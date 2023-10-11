import { Button, MenuItem, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { useTeam, useUpdateTeam } from "../team/hooks.ts";
import { useUser } from "../user/hooks.ts";
import { useDivisions, useTournament } from "../viewer/hooks.ts";
import MyTextField from "../inputs/mytextfield.js";
import MySelect from "../inputs/mySelect.js";
import { teamValidationSchema } from "../team/CreateTeam.js";
import * as Yup from "yup";
import { useParticipants } from "./hooks.ts";
import { useContext, useEffect, useLayoutEffect } from "react";

//team member -> ask manager
//team manager -> register
//teamless -> join/create team
//registered -> alr registered

function RegistrationPage() {
  const { data: tournament } = useTournament("current");
  const { data: user } = useUser("me");
  const { data: team } = useTeam(user?.team?.name);

  const unregisterTeam = useDeleteParticipant();

  const { data: participants } = useParticipants(tournament?.id, {
    team: user?.team?.id,
  });
  const participant = participants?.[0];

  //FIXME: no redirect if the user is not logged in
  const navigate = useNavigate();
  useLayoutEffect(() => {
    if (user && !user.team) {
      return navigate(`/teams/none`); //TODO: redirect back frm here to registration
    }
  }, [user]);

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
  if (team && team.manager === user.id) {
    return <RegistrationForm></RegistrationForm>;
  }

  return (
    <>
      <div>
        <p>You are currently a member of {user?.team?.name}</p>
        <p>Please ask the leader of your team to register.</p>
        <p>
          If you wish to play in another team, please leave the current one and
          join/create a new team.
        </p>
      </div>
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
                phoneNumber: team.phoneNumber
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

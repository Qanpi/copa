import { Button, MenuItem, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { useTeam, useUpdateTeam } from "../hooks.ts";
import { useUser } from "../../user/hooks.ts";
import { useDivisions, useTournament } from "../../tournament/hooks.ts";
import MyTextField from "../../inputs/mytextfield.js";
import MySelect from "../../inputs/mySelect.js";
import { teamValidationSchema } from "../create/CreateTeam.js";
import * as Yup from "yup";
import { useParticipants } from "../../participant/hooks.ts";
import { useContext, useEffect } from "react";

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

  const navigate = useNavigate();
  useEffect(() => {
    if (user && !user.team) {
      return navigate(`/teams/none`);
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
  if (team?.manager === user.id) {
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
  const registerTeam = useMutation({
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
          updateTeam.mutate(values);

          const selected = divisions.find((d) => d.name === values.division);

          registerTeam.mutate({
            division: selected.id,
            team: team.id,
          });
        }}
      >
        <Form>
          <MyTextField name="name" label="name"></MyTextField>
          <MyTextField label="Phone number" name="phoneNumber"></MyTextField>
          <MySelect name="division">
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

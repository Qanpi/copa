import { Button, MenuItem, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { Link } from "react-router-dom";
import { useTeam, useUpdateTeam } from "../hooks.ts";
import { useUser } from "../../user/hooks.ts";
import { useTournament } from "../../tournament/hooks.ts";
import MyTextField from "../../inputs/mytextfield.js";
import MySelect from "../../inputs/mySelect.js";
import { teamValidationSchema } from "../create/CreateTeam.js";
import * as Yup from "yup";

export const useUnregisterTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      const res = await axios.delete(`/api/participants/${values.id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participations"]);
    },
  });
};

function RegistrationPage() {
  const { status: userStatus, data: user } = useUser("me");
  const { status: teamStatus, data: team } = useTeam(user?.team?.name, {
    enabled: userStatus === "success",
  });
  const { status: tournamentStatus, data: tournament } =
    useTournament("current");

  //team member -> ask manager
  //team manager -> register
  //teamless -> join/create team
  //registered -> alr registered
  const queryClient = useQueryClient();
  const updateTeam = useUpdateTeam();

  const registerTeam = useMutation({
    mutationFn: async (bool) => {
      const res = await axios.post(`/api/participants`, {
        teamId: team.id,
        tournamentId: tournament.id,
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participation"]);
    },
  });

  const { data: participation } = useQuery({
    queryKey: ["participation"],
    queryFn: async () => {
      const res = await axios.get(
        `/api/participants?team=${team.id}&tournament=${tournament.id}`
      );
      return res.data[0] || null; //assumed it's a singular value
    },
    enabled: !!team && !!tournament,
  });

  const unregisterTeam = useUnregisterTeam(); 

  if (team) {
    if (participation) {
      return (
        <>
          <div>Congratulations! Your team is already registered.</div>
          <Button onClick={() => unregisterTeam.mutate({id: team.id})}>Unregister</Button>
        </>
      );
    } else if (team.manager === user.id) {
      return (
        <>
          <Typography variant="h6">
            Please verify the information below
          </Typography>
          <Formik
            initialValues={{
              id: team.id,
              name: team.name,
              phoneNumber: "",
              division: "",
            }}
            validationSchema={Yup.object({
              ...teamValidationSchema,
              division: Yup.string().required()
            })}
            onSubmit={(values) => updateTeam.mutate(values)}
          >
            {({ dirty, submitForm, isValid }) => (
              <Form>
                <MyTextField name="name" label="name"></MyTextField>
                <MyTextField
                  label="Phone number"
                  name="phoneNumber"
                ></MyTextField>
                <MySelect name="division">
                  <MenuItem value="Men's">Men's</MenuItem>
                  <MenuItem value="Women's">Women's</MenuItem>
                </MySelect>
                <Typography>
                  To update more info, head over to your team profile.
                </Typography>
                <Button
                  onClick={async () => {
                    if (dirty) await submitForm();
                    if (isValid) registerTeam.mutate();
                  }}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </>
      );
    } else {
      return (
        <>
          <div>
            <p>You are currently a member of {team.name}</p>
            <p>Please ask the leader of your team to register.</p>
            <p>
              If you wish to play in another team, please leave the current one
              and join/create a new team.
            </p>
          </div>
        </>
      );
    }
  } else {
    return (
      <>
        <div>You are not currently in a team.</div>
        <p>Please join or create a team in order to participate.</p>
        <Link to="/teams/join">Join a team</Link>
        <Link to="/teams/new">Create a team</Link>
      </>
    );
  }
}

export default RegistrationPage;

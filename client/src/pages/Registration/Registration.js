import { useContext } from "react";
import { AuthContext, TeamContext, TournamentContext } from "../..";
import { Button, MenuItem, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import MyTextField from "../../components/MyTextField/mytextfield";
import MyStepper from "../../components/MyStepper/mystepper";
import MySelect from "../../components/MySelect/mySelect";
import {
  phoneValidationSchema,
  teamValidationSchema,
} from "../CreateTeam/CreateTeam";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

function RegistrationPage() {
  const [userStatus, user] = useCurrentUser();
  const [teamStatus, team] = useTeam(user?.team);;
  const [tournamentStatus, tournament] = useCurrentTournament();;

  //team member -> ask manager
  //team manager -> register
  //teamless -> join/create team
  //registered -> alr registered
  const queryClient = useQueryClient();
  const updateTeamInfo = useMutation({
    mutationFn: async (values) => {
      const res = await axios.patch(`/api/teams/${team.id}`, values);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["teams", team.id], data);
    },
  });

  const registerTeam = useMutation({
    mutationFn: async (bool) => {
      const res = await axios.post(`/api/participations`, {
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
        `/api/participations?team=${team.id}&tournament=${tournament.id}`
      );
      return res.data[0] || null; //assumed it's a singular value
    },
    enabled: !!team && !!tournament,
  });

  const unregisterTeam = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/participations/${participation.id}`);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["participation"]);
    },
  });

  if (team) {
    if (participation) {
      return (
        <>
          <div>Congratulations! Your team is already registered.</div>
          <Button onClick={unregisterTeam.mutate}>Unregister</Button>
        </>
      );
    } else if (team.manager == user.id) {
      return (
        <>
          <Typography variant="h6">
            Please verify the information below
          </Typography>
          <Formik
            initialValues={team}
            validationSchema={teamValidationSchema}
            onSubmit={(values) => updateTeamInfo.mutate(values)}
          >
            {({ dirty, submitForm, isValid }) => (
              <Form>
                <MyTextField name="name" label="name"></MyTextField>
                <MyTextField
                  label="Phone number"
                  name="phoneNumber"
                  type="tel"
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

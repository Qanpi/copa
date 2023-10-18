import {
  Stack,
  Container,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box,
  Card,
  CardActionArea,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useUser } from "../user/hooks.ts";
import MyFileInput from "../inputs/MyFileInput.tsx";
import MyTextField from "../inputs/myTextField.tsx";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";
import { useCreateTeam } from "./hooks.ts";
import GradientTitle from "../viewer/gradientTitle.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Camera } from "@mui/icons-material";
import { PromptContainer } from "../participant/registration.tsx";

export const teamValidationSchema = {
  name: Yup.string().max(20).trim().required(),
  about: Yup.string().max(100).optional(),
  phoneNumber: Yup.string()
    .matches(
      /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/
    )
    .required(),
  instagramUrl: Yup.string()
    .url()
    .matches(/https:\/\/www\.instagram\.com\/\S+\/?/)
    .optional(), //TODO: maybe be even stricter than \S
  banner: Yup.string().optional(),
  picture: Yup.string().optional(),
};

function NewTeamPage() {
  const { status: userStatus, data: user } = useUser("me");

  const navigate = useNavigate();
  const createTeam = useCreateTeam();

  if (userStatus !== "success") return <div>User loading.</div>;

  return (
    <BannerPage header={
      <Typography variant="h2" sx={{fontWeight: 500}}>This is where it begins</Typography>
    }>
      <LeaveTeamDialog
        onStay={(u) => navigate(`/teams/${u.team.name}`)}
      ></LeaveTeamDialog>

      <Formik
        initialValues={{
          name: "",
          manager: user.id,
          about: "",
          phoneNumber: "",
          instagramUrl: "",
          banner: "",
          picture: "",
        }}
        validationSchema={Yup.object(teamValidationSchema)}
        onSubmit={(values) => {
          createTeam.mutate(values, {
            onSuccess: (newTeam) => {
              console.log(newTeam);
              navigate(`/teams/${newTeam.name}`);
            },
          });
        }}
      >
        <Form>
          <PromptContainer sx={{ gap: 7 }} maxWidth="sm">
            <Stack direction="row" spacing={5} sx={{ width: "100%", justifyContent: "center" }}>
              <Stack direction="column" spacing={2}>
                <MyTextField label="Team name *" name="name"></MyTextField>
                <MyTextField label="Slogan" name="about" variant="standard"></MyTextField>

                <MyTextField label="Phone number" name="phoneNumber" variant="standard"></MyTextField>
                <MyTextField label="Instagram page" name="instagramUrl" variant="standard"></MyTextField>
              </Stack>
              <Card>
                <CardActionArea sx={{ width: "200px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MyFileInput name="banner" sx={{ opacity: 1, position: "absolute" }}></MyFileInput>
                  <Camera></Camera>
                </CardActionArea>
              </Card>
            </Stack>

            <Button type="submit" variant="contained" sx={{ width: "50%" }}>Submit</Button>
          </PromptContainer>
        </Form>
      </Formik>
    </BannerPage >
  );
}

export default NewTeamPage;

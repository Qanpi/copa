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
  Tooltip,
  TextareaAutosize,
  TextField,
  Backdrop,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik, useField, useFormikContext } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAuth } from "../user/hooks.ts";
import MyFileInput from "../inputs/MyFileInput.tsx";
import MyTextField from "../inputs/myTextField.tsx";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";
import { useCreateTeam } from "./hooks.ts";
import GradientTitle from "../viewer/gradientTitle.tsx";
import BannerPage from "../viewer/BannerPage.tsx";
import Grid2 from "@mui/material/Unstable_Grid2";
import { AddAPhoto, Camera, ChangeCircle } from "@mui/icons-material";
import { PromptContainer } from "../layout/PromptContainer.tsx";
import { useState } from "react";

export const teamValidationSchema = {
  name: Yup.string().max(20).trim().matches(/^[^.]*$/, "Dot ('.') is reserved, sorry.").required(""),
  about: Yup.string().max(200).optional(),
  phoneNumber: Yup.string()
    .matches(
      /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/,
      "unrecognized format"
    )
    .required(""),
  instagramUrl: Yup.string()
    .url()
    .matches(/https:\/\/www\.instagram\.com\/\S+\/?/)
    .optional(), //TODO: maybe be even stricter than \S
  banner: Yup.string().optional(),
  picture: Yup.string().optional(),
};

export const TeamBannerInput = ({ name, edit, sx, ...props }: { name: string, edit: boolean } & BoxProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const [bannerDialog, showBannerDialog] = useState(false);

  return (
    <>
      <Dialog open={bannerDialog}>
        <DialogTitle>Enter image link</DialogTitle>
        <DialogContent>
          <Tooltip placement="top" arrow title="Why link? As of now, it's too costly and time-consuming to setup a server dedicated to image uploads.">
            <DialogContentText>
              Please provide a link to an image service provider (e.g. imgur) to display a banner on your team page.
            </DialogContentText>
          </Tooltip>
          <MyTextField autoFocus margin="dense" label="Image link" fullWidth variant="standard" name="bannerUrl"></MyTextField>
          <Typography variant="body2" color="lightgray">Recommended dimensions are 400x400 pixels.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setFieldValue(field.name, field.value); showBannerDialog(false) }}>Cancel</Button>
          <Button onClick={() => showBannerDialog(false)}>Ok</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ maxWidth: "400px", maxHeight: "400px", display: "flex", alignItems: "center", ...sx }} {...props}>
        {field.value ?
          <Box sx={{ position: "relative"}}>
            <Box sx={{ objectFit: "contain", width: "100%", height: "100%" }} component="img" src={field.value}></Box>
            <Backdrop open={edit} sx={{ position: "absolute" }} onClick={() => showBannerDialog(true)}>
              <CardActionArea sx={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* <MyFileInput name="banner" sx={{ opacity: 1, position: "absolute" }}></MyFileInput> */}
                <ChangeCircle fontSize="large"></ChangeCircle>
              </CardActionArea>
            </Backdrop>
          </Box>
          : (edit ?
            <Card onClick={() => showBannerDialog(true)} sx={{ height: "100%", width: "100%" }}>
              <CardActionArea sx={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* <MyFileInput name="banner" sx={{ opacity: 1, position: "absolute" }}></MyFileInput> */}
                <AddAPhoto fontSize="large"></AddAPhoto>
              </CardActionArea>
            </Card>
            : null)}
      </Box>
    </>
  )
}

function NewTeamPage() {
  const { status: userStatus, data: user } = useAuth();

  const navigate = useNavigate();
  const createTeam = useCreateTeam();


  if (userStatus !== "success") return <div>User loading.</div>;

  return (
    <BannerPage header={
      <Typography variant="h2" sx={{ fontWeight: 500 }}>It begins here</Typography>
    }>
      <LeaveTeamDialog
        onStay={(u) => navigate(`/teams/${encodeURIComponent(u.team!.name!)}`)}
      ></LeaveTeamDialog>

      <Formik
        initialValues={{
          name: "",
          manager: user.id,
          about: "",
          phoneNumber: "",
          bannerUrl: "",
          picture: "",
        }}
        validationSchema={Yup.object(teamValidationSchema)}
        onSubmit={(values) => {
          createTeam.mutate(values, {
            onSuccess: (newTeam) => {
              navigate(`/teams/${encodeURIComponent(newTeam.name)}`);
            },
          });
        }}
      >
        {({ values, setFieldValue }) =>
          <Form>

            <PromptContainer sx={{ gap: 10, pt: 5 }} maxWidth="md">
              <Stack direction={{ xs: "column-reverse", md: "row" }} spacing={5} sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                <Box display="flex" flexDirection="column" gap={1} sx={{ width: "45vmin", minWidth: "250px" }}>
                  <MyTextField label="Team name *" name="name"></MyTextField>
                  <Tooltip arrow title="Your phone number will only be visible to the organizer.">
                    <MyTextField label="Phone number *" name="phoneNumber"></MyTextField>
                  </Tooltip>
                  <MyTextField label="About" name="about" minRows={4} multiline maxRows={8} sx={{ mt: 3 }}></MyTextField>
                  <Typography sx={{ mt: 1 }}>You will be able to modify these values later on too.</Typography>
                </Box>
                <TeamBannerInput edit name={"bannerUrl"} sx={{ width: "50vmin", height: "50vmin", minWidth: "250px", minHeight: "250px" }}></TeamBannerInput>
              </Stack>

              <Stack direction="row" spacing={2} minWidth="45vmin">
                <Link to="/team/none">
                  <Button type="submit" variant="outlined" color="secondary" fullWidth>Cancel</Button>
                </Link>
                <Button type="submit" variant="contained" fullWidth>Create</Button>
              </Stack>
            </PromptContainer>
          </Form>
        }
      </Formik>
    </BannerPage >
  );
}

export default NewTeamPage;

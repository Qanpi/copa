import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useUser } from "../user/hooks.ts";
import MyFileInput from "../inputs/MyFileInput.js";
import MyTextField from "../inputs/mytextfield.js";
import LeaveTeamDialog from "./LeaveTeamDialog.tsx";

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

  const queryClient = useQueryClient();

  const createTeam = useMutation({
    mutationFn: async (values) => {
      const res = await axios.post("/api/teams", values);
      return res.data;
    },
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["user", "me"]);
      navigate(`/teams/${newTeam.name}`);
    },
  });

  if (userStatus !== "success") return <div>User loading.</div>;

  return (
    <>
      <LeaveTeamDialog
        onLeave={() => navigate(`/teams/none`)}
        onStay={() => navigate(`/teams/none`)}
      ></LeaveTeamDialog>

      <h1>Create new team</h1>
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
          createTeam.mutate(values);
        }}
      >
        <Form>
          <MyTextField label="Team name" name="name"></MyTextField>
          <MyTextField label="About" name="about"></MyTextField>

          <MyTextField label="PHone number" name="phoneNumber"></MyTextField>

          <MyTextField label="Instagram page" name="instagramUrl"></MyTextField>
          {/* <MySelect name="division" label="Division">
            <MenuItem value="Men's">Men's</MenuItem>
            <MenuItem value="Women's">Women's</MenuItem>
          </MySelect> */}
          <MyFileInput name="banner" label="Team banner"></MyFileInput>
          <MyFileInput name="picture" label="Team picture"></MyFileInput>
          <Button type="submit">Submit</Button>
        </Form>
      </Formik>
    </>
  );
}

export default NewTeamPage;

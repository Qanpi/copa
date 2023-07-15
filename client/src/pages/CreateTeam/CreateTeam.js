import { useContext } from "react";
import { AuthContext, TeamContext } from "../..";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  MenuItem,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import MyTextField from "../../components/MyTextField/mytextfield";
import MySelect from "../../components/MySelect/mySelect";
import MyFileInput from "../../components/MyFileInput/myFileInput";

export const teamValidationSchema = Yup.object({
  name: Yup.string().max(20).trim().required(),
  about: Yup.string().max(100).optional(),
  phoneNumber: Yup.string()
    .matches(
      /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/
    )
    .required(),
  instagramPage: Yup.string()
    .url()
    .matches(/https:\/\/www\.instagram\.com\/\S+\/?/), //TODO: maybe be even stricter than \S
  division: Yup.string().oneOf(["Men's", "Women's"]).required(),
  banner: Yup.string().optional(),
  picture: Yup.string().optional(),
});

function CreateTeamPage() {
  const user = useContext(AuthContext);
  const team = useContext(TeamContext);

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
      navigate(`/teams/${newTeam.id}`);
    },
  });

  const leaveTeam = useMutation({
    mutationFn: () => {
      return axios.delete(`/api/teams/${team.id}/players/${user.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", team.id] });
    },
  });

  const handleDialogResponse = (isConfirmed) => {
    if (isConfirmed) {
      leaveTeam.mutate();
    } else {
      //or maybbe just show error again for submitting but allow to view creation form
      return navigate(`/teams/${team.id}`);
      //return
    }
  };

  return (
    <>
      <Dialog open={Boolean(team)}>
        <DialogTitle>{"Leave current team?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            In order to create a team of your own, you must first leave your
            current team.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => handleDialogResponse(false)}>
            No
          </Button>
          <Button onClick={() => handleDialogResponse(true)}>Yes</Button>
        </DialogActions>
      </Dialog>
      <h1>Create new team</h1>
      <Formik
        initialValues={{
          name: "",
          manager: user.id,
          about: "",
          phoneNumber: "",
          instagramPage: "",
          banner: "",
          picture: "",
        }}
        validationSchema={teamValidationSchema}
        onSubmit={(values) => {
          createTeam.mutate(values);
        }}
      >
        <Form>
          <MyTextField label="Team name" name="name"></MyTextField>
          <MyTextField label="About" name="about"></MyTextField>
          <MyTextField
            label="Phone number"
            name="phoneNumber"
            type="tel"
          ></MyTextField>
          <MyTextField
            label="Instagram page"
            name="instagramPage"
          ></MyTextField>
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

export default CreateTeamPage;

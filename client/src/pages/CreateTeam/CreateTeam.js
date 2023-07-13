import { useContext } from "react";
import { AuthContext } from "../..";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import MyTextField from "../../components/MyTextField/mytextfield";

function CreateTeamPage() {
  const user = useContext(AuthContext);

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
      return axios.delete(`/api/teams/${user.team.id}/players/${user.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", user.team.id] });
    },
  });

  const handleDialogResponse = (isConfirmed) => {
    if (isConfirmed) {
      leaveTeam.mutate();
    } else {
      //or maybbe just show error again for submitting but allow to view creation form
      return navigate(`/teams/${user.team.id}`);
      //return
    }
  };

  return (
    <>
      <Dialog open={user.isMember}>
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
          division: "",
          banner: "",
          picture: "",
        }}
        validationSchema={Yup.object({
          name: Yup.string().max(20),
          about: Yup.string().max(100),
          contacts: Yup.object({
            phoneNumber: Yup.string().required(), //TODO: phone validation
            instagramPage: Yup.string()
              .url()
              .matches(/https:\/\/www\.instagram\.com\/\S+\/?/), //TODO: maybe be even stricter than \S
          }),
          division: Yup.string(), 
          banner: Yup.string(),
          picture: Yup.string(),
        })}
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
          ></MyTextField>
          <MyTextField
            label="Instagram page"
            name="instagramPage"
          ></MyTextField>
          <Button type="submit">Submit</Button>
        </Form>
      </Formik>
    </>
  );
}

export default CreateTeamPage;

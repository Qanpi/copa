import { Form, Formik } from "formik";
import MyTextField from "../../components/MyTextField/mytextfield";
import { useContext } from "react";
import { AuthContext } from "../..";
import * as Yup from "yup";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@mui/material";

function TeamInfoForm() {
  const user = useContext(AuthContext);
  const team = user.team;
  const queryClient = useQueryClient();

  const createTeam = useMutation({
    mutationFn: async (values) => {
      const res = await axios.post("/api/teams", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["teams"]);
      queryClient.invalidateQueries(["user", "me"]);
    },
  });

  return (
    <Formik
      initialValues={team ? team : {
        name: "",
        leader: "",
        about: "",
        contacts: {
          phoneNumber: "",
          instagramPage: "",
        },
        divisionId: 0,
        banner: "",
        picture: "",
      }}
      validationSchema={Yup.object({
        name: Yup.string().max(20),
        about: Yup.string().max(100),
        contacts: Yup.object({
          phoneNumber: Yup.string(), //TODO: phone validation
          instagramPage: Yup.string()
            .url()
            .matches(/https:\/\/www\.instagram\.com\/\S+\/?/), //TODO: maybe be even stricter than \S
        }),
        divisionId: Yup.number(), //TODO: add nonbinary divs
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
          name="contacts.phoneNumber"
        ></MyTextField>
        <MyTextField
          label="Instagram page"
          name="contacts.instagramPage"
        ></MyTextField>
        <Button type="submit">Submit</Button>
      </Form>
    </Formik>
  );
}

export default TeamInfoForm;

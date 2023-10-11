import { Button } from "@mui/base";
import { Typography } from "@mui/material";
import { Formik, Form } from "formik";
import MyAutocomplete from "../inputs/MyAutocomplete";
import MyNumberSlider from "../inputs/myNumberSlider";
import MyTextField from "../inputs/mytextfield";
import * as Yup from "yup"
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { tournamentKeys, useCreateTournament } from "../viewer/hooks";

function CreateTournamentPage() {
    const queryClient = useQueryClient();
    const createTournament = useCreateTournament(); 

    return (
        <Formik
            initialValues={{
                organizer: {
                    name: "",
                    phoneNumber: "",
                },
                divisions: ["Men's", "Women's"],
            }}
            validationSchema={Yup.object({
                organizer: Yup.object({
                    name: Yup.string().required(),
                    phoneNumber: Yup.string().notRequired(),
                }),
                divisions: Yup.array().min(1).required().of(Yup.string()),
            })}
            onSubmit={(values) => {
                const divisions = values.divisions.map(d => ({ name: d }));

                createTournament.mutate({
                    ...values,
                    divisions
                });
            }}
        >
            <Form>
                <Typography variant="h3">KICKSTART COPA</Typography>

                <MyTextField
                    type="text"
                    name="organizer.name"
                    label="Organizer's name"
                ></MyTextField>
                <MyTextField
                    type="tel"
                    name="organizer.phoneNumber"
                    label="Phone number"
                ></MyTextField>
                <MyAutocomplete name="divisions" />

                <Button type="submit">Submit</Button>
            </Form>
        </Formik>
    )
}

export default CreateTournamentPage;
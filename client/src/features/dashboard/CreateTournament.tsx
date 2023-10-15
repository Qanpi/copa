import { Button, Container, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import MyAutocomplete from "../inputs/MyAutocomplete";
import MyNumberSlider from "../inputs/myNumberSlider";
import MyTextField from "../inputs/mytextfield";
import * as Yup from "yup"
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { tournamentKeys, useCreateTournament, useTournament } from "../viewer/hooks";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

function CreateTournamentPage() {
    const tournament = useTournament("current");
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
                    name: Yup.string().required(""),
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
                <Container sx={{ pt: 15 }} maxWidth="xs">

                    <Grid2 container spacing={2} alignItems={"center"} justifyContent="center">
                        <Grid2 xs={12} justifyContent="center" alignItems="center" display="flex">
                            <Typography variant="h3" fontWeight={600}>KICKSTART COPA{tournament.idx ? tournament.idx + 1 : ""} </Typography>
                        </Grid2>

                        <Grid2 xs={6}>
                            <MyTextField
                                type="text"
                                name="organizer.name"
                                label="Organizer's name"
                            ></MyTextField>
                        </Grid2>
                        <Grid2 xs={6}>

                            <MyTextField
                                type="tel"
                                name="organizer.phoneNumber"
                                label="Phone number"
                            ></MyTextField>
                        </Grid2>
                        <Grid2 xs={12}>
                            <MyAutocomplete name="divisions" />
                        </Grid2>
                        <Grid2 xs={12} display={"flex"} justifyContent={"center"} gap={6}>
                            <Button variant="outlined">Go back</Button>
                            <Button type="submit" variant="contained">Create</Button>
                        </Grid2>
                    </Grid2>
                </Container>
            </Form>
        </Formik >
    )
}

export default CreateTournamentPage;
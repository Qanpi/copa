import { Button, Container, Tooltip, Typography, Box, Backdrop, CircularProgress, Snackbar, Alert } from "@mui/material";
import { Formik, Form } from "formik";
import MyAutocomplete from "../inputs/MyAutocomplete";
import MyNumberSlider from "../inputs/myNumberSlider";
import MyTextField from "../inputs/myTextField";
import * as Yup from "yup"
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { tournamentKeys, useCreateTournament, useTournament } from "../viewer/hooks";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { LoadingBackdrop } from "../layout/LoadingBackdrop";

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
                    phoneNumber: Yup.string().matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Incorrect format").required(""),
                }),
                divisions: Yup.array().min(1, "You must create at least one division.").required().of(Yup.string()),
            })}
            onSubmit={(values) => {
                createTournament.mutate(values);
            }}
        >
            <Form>
                <Snackbar open={createTournament.isError} anchorOrigin={{vertical: "top", horizontal: "center"}}>
                    <Alert severity="error" sx={{width: "100%"}}>
                        {createTournament.error?.message}
                    </Alert>
                </Snackbar>
                <LoadingBackdrop open={createTournament.isLoading}></LoadingBackdrop>
                <Container sx={{ pt: 15 }} maxWidth="xs">
                    <Grid2 container spacing={2} alignItems={"center"} justifyContent="center">
                        <Grid2 xs={12} justifyContent="center" alignItems="center" display="flex">
                            <Typography variant="h3" fontWeight={600}>KICKSTART COPA{tournament.idx ? tournament.idx + 1 : ""} </Typography>
                        </Grid2>

                        <Grid2 xs={6}>
                            <MyTextField
                                type="text"
                                name="organizer.name"
                                label="Organizer's name *"
                            ></MyTextField>
                        </Grid2>
                        <Grid2 xs={6}>
                            <Tooltip arrow title="Your phone number will be visible to participants." placement="right">
                                <Box>

                                    <MyTextField
                                        type="tel"
                                        name="organizer.phoneNumber"
                                        label="Phone number *"
                                    ></MyTextField>
                                </Box>
                            </Tooltip>
                        </Grid2>
                        <Grid2 xs={12}>
                            <MyAutocomplete name="divisions" />
                        </Grid2>
                        <Grid2 xs={12} display={"flex"} justifyContent={"center"} gap={2} sx={{ mt: 1 }}>
                            <Button variant="outlined" fullWidth>Go back</Button>
                            <Button type="submit" variant="contained" fullWidth>Create</Button>
                        </Grid2>
                    </Grid2>
                </Container>
            </Form>
        </Formik >
    )
}

export default CreateTournamentPage;
import { Form, Formik, useField, useFormik, useFormikContext } from "formik";
import DivisionPanel from "../layout/DivisionPanel";
import { PromptContainer } from "../layout/PromptContainer";
import BannerPage from "./BannerPage";
import { Button, Stack, FormControlLabel, FormLabel, Input, InputAdornment, InputBaseProps, InputLabel, TextField, Typography, Box, styled } from "@mui/material";
import { useContext } from "react";
import { DivisionContext } from "../..";
import { InputProps } from "@mui/base";
import MyTextField from "../inputs/myTextField";
import { useAuth } from "../user/hooks";
import { useUpdateDivision } from "../tournament/hooks";
import { TDivision } from "@backend/models/division";

const MyNumberInput = ({ name, label, ...props }: InputProps & { name: string, label?: string }) => {
    const [field, meta] = useField(name);

    return (
        <Box>
            <InputLabel>{label}</InputLabel>
            <Input sx={{ textAlign: "right" }} type="number" {...field} {...meta} {...props}></Input>
        </Box>
    )
}

const RulesTextField = styled(MyTextField)({
    "& .MuiOutlinedInput-root": {
        "& fieldset": { border: 0 },
        color: "white !important",
    },
    "& .MuiInputBase-input": { "&.Mui-disabled": {
            color: "white !important",
            "-webkit-text-fill-color": "white"
        }
    }
})

function RulesPage() {
    const { data: user } = useAuth();
    const isAdmin = user?.role === "admin";

    const division = useContext(DivisionContext);
    const updateDivision = useUpdateDivision();

    const handleSubmit = (values: TDivision) => {
        updateDivision.mutate(values);
    }

    if (!division) return;

    return (
        <BannerPage title="Rules">
            <DivisionPanel>

                <Formik enableReinitialize initialValues={division} onSubmit={handleSubmit}>
                    {({ values }) => <Form>
                        <PromptContainer sx={{ p: 2, pt: 2 }}>
                            <Stack direction={{ xs: "column-reverse", md: "row" }} spacing={5} sx={{ width: "100%", justifyContent: "center" }}>
                                <RulesTextField disabled={!isAdmin} multiline minRows={5} name="rules" placeholder="Eh... rules are meant to be broken anyways i guess." sx={{ width: "100%" }}>
                                </RulesTextField>

                                <Stack spacing={2} sx={{ width: "150px" }}>
                                    <MyNumberInput disabled={!isAdmin} name="settings.playerCount" label="Players on field"></MyNumberInput>
                                    <MyNumberInput disabled={!isAdmin} name="settings.matchLength" label="Match duration" endAdornment={<InputAdornment position="end">seconds</InputAdornment>}></MyNumberInput>
                                </Stack>
                            </Stack>
                            {isAdmin ? <Button type="submit" sx={{ alignSelf: "start", mt: "auto" }}>Save</Button> : null}
                        </PromptContainer>
                    </Form>
                    }
                </Formik>
            </DivisionPanel>
        </BannerPage>
    )
}

export default RulesPage;
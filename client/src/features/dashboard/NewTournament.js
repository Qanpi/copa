import {
  Button,
  Typography
} from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import MyAutocomplete from "../inputs/MyAutocomplete.tsx";
import MyNumberSlider from "../inputs/myNumberSlider.js";
import MyTextField from "../inputs/mytextfield.js";

function NewTournamentPage() {
  return (
    <>
      <Formik
        initialValues={{
          settings: {
            playerCount: 4,
            matchLength: 6,
          },
          rules: "",
          organizer: {
            name: "",
            phoneNumber: "",
          },
        }}
        validationSchema={Yup.object({
          settings: Yup.object({
            playerCount: Yup.number().min(1).max(11).required(),
            matchLength: Yup.number().min(1).max(20).required(),
          }),
          divisions: Yup.array().min(1).required().of(Yup.string()),
          organizer: Yup.object({
            name: Yup.string().required(),
            phoneNumber: Yup.string().notRequired(),
          }),
          rules: Yup.string(), 
        })}
        onSubmit={(values) => {
          // createTournament.mutate(values);
        }}
      >
        <Form>
          <Typography variant="h3">KICKSTART COPA</Typography>
          <Typography>
            You can always modify these settings later on.
          </Typography>

          <MyNumberSlider
            label="Match length"
            name="settings.matchLength"
            units="mins"
            min={1}
            max={20}
            step={1}
            marks={[
              { value: 1, label: "1 min" },
              { value: 6, label: "6 min" },
              { value: 20, label: "20 min" },
            ]}
          />
          <MyNumberSlider
            label="Player count"
            name="settings.playerCount"
            units="players"
            required
            min={1}
            max={11}
            step={1}
            marks={[
              { value: 1, label: "1 p" },
              { value: 4, label: "4 p" },
              { value: 11, label: "11 p" },
            ]}
          />
          <MyAutocomplete name="divisions" />
          <MyTextField
            type="text"
            name="rules"
            label="Link to rules"
          ></MyTextField>
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

          <Button type="submit">Submit</Button>
        </Form>
      </Formik>
    </>
  );
}

export default NewTournamentPage;

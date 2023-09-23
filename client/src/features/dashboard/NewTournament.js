import {
  Button,
  Container,
  Step,
  StepButton,
  Stepper
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { useTournament } from "../tournament/hooks.ts";
import MyFileInput from "../inputs/MyFileInput.js";
import MyNumberSlider from "../inputs/myNumberSlider.js";
import MyTextField from "../inputs/mytextfield.js";
import MyAutocomplete from "../inputs/MyAutocomplete.tsx";
import { createTournament, useCreateTournament } from "../tournament/hooks.ts";

const Parameters = () => {
  return (
    <>
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
      <MyAutocomplete name="divisions"/>
    </>
  );
};

const Rules = () => {
  return <MyFileInput label="please enter rules" name="rules" />;
};

const ContactInfo = () => {
  return (
    <>
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
    </>
  );
};

function NewTournamentPage() {
  const createTournament = useCreateTournament();

  const [activeStep, setActiveStep] = useState(0);
  const steps = {
    Parameters: Parameters,
    Rules: Rules,
    "Contact Info": ContactInfo,
  };
  const lastStep = Object.keys(steps).length - 1;

  const handleClickStep = (i) => {
    setActiveStep(i);
  };

  return (
    <>
      <Stepper activeStep={activeStep}>
        {Object.keys(steps).map((label, i) => (
          <Step key={label}>
            <StepButton onClick={() => handleClickStep(i)}>{label}</StepButton>
          </Step>
        ))}
      </Stepper>

      <Formik
        initialValues={{
          settings: {
            playerCount: 4,
            matchLength: 6,
          },
          divisions: ["Men's", "Women's"],
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
          rules: Yup.string().required(), //TODO: at lfor time being
        })}
        onSubmit={(values) => {
          createTournament.mutate(values);
        }}
      >
        <Form>
          {/* Bit of a hack to ensure that the file input doesn't remount and as such reset */}
          {Object.values(steps).map((Section, i) => {
            return (
              <Container
                key={i}
                sx={{ display: activeStep === i ? undefined : "none" }}
              >
                <Section></Section>
              </Container>
            );
          })}
          {activeStep === lastStep ? (
            <Button type="submit">Submit</Button>
          ) : (
            <Button type="button" onClick={() => setActiveStep((s) => s + 1)}>
              Next
            </Button>
          )}
        </Form>
      </Formik>
    </>
  );
}

export default NewTournamentPage;

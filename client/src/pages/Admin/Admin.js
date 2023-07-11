import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./Admin.css";
import {
  Form,
  Formik,
  useField,
  useFormikContext,
  validateYupSchema,
} from "formik";
import * as Yup from "yup";
import { HashLink } from "react-router-hash-link";
import { useContext, useState } from "react";
import { TournamentContext } from "../..";
import {
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Stepper,
  StepLabel,
  Step,
  Button,
  Slider,
  Input,
  Grid,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AdminCalendar from "../../components/AdminCalendar/admincalendar";
import MyChecklist from "../../components/MyChecklist/mychecklist";
import { createContext } from "react";
import MyStepper from "../../components/MyStepper/mystepper";
import AdminRegistrationPage from "./Registration/Registration";
import KickstartPage from "./Kickstart/Kickstart";
import GroupStagePage from "./GroupStage/GroupStage";

// const Stage = Object.freeze({
//   Kickstart: 0,
//   Registration: 1,
//   "Group stage": 2,
//   "Play-offs": 3,
//   Finished: 4,
// });

const stages = [
  {
    name: "Kickstart",
    tasks: [
      {
        name: "Fill in tournament details.",
        description:
          "Head over to the 'settings' tab to provide information about the tournament, rules and your contact info.",
        isDone: false,
      },
    ],
  },
  {
    name: "Registration",
    tasks: [
      {
        name: "Configure registration dates.",
        description: "test",
        isDone: false,
      },
    ],
  },
  {
    name: "Group stage",
    tasks: [
      {
        name: "Draw groups",
        description: "test",
        isDone: false,
      },
      {
        name: "Schedule group matches",
        description: "test",
        isDone: false,
      },
    ],
  },
];

function AdminPage() {
  const {stageId} = useContext(TournamentContext);
  //const { tasks } = stages[stageId];

  const renderCurrentStage = () => {
    switch (stageId) {
      case 0:
        return <KickstartPage id={stageId}></KickstartPage>;
      case 1:
        return <AdminRegistrationPage id={stageId}></AdminRegistrationPage>;
    }
  };

  return (
    <>
      <div className="title">
        <h1>Copa I</h1>
        <h3>Autumn 2023</h3>
      </div>
      <div>
        <MyStepper
          steps={stages.map((s) => s.name)}
          activeStep={stageId}
        ></MyStepper>
        {renderCurrentStage()}
        {/* <MyChecklist items={tasks} heading="Checklist"></MyChecklist> */}
      </div>
    </>
  );
}

const MyRadioGroup = ({ children, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <>
      <RadioGroup {...field} {...props}>
        {children}
      </RadioGroup>
    </>
  );
};

export default AdminPage;

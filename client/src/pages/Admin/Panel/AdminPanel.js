import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./AdminPanel.css";
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
import { TournamentContext } from "../../..";
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
import AdminCalendar from "../../../components/AdminCalendar/admincalendar";
import MyChecklist from "../../../components/MyChecklist/mychecklist";
import { createContext } from "react";
import MyStepper from "../../../components/MyStepper/mystepper";
import AdminRegistrationPage from "./Registration/Registration";
import KickstartPage from "./Kickstart/Kickstart";
import GroupStagePage from "./GroupStage/GroupStage"

const Stage = Object.freeze({
  Kickstart: 0,
  Registration: 1,
  "Group stage": 2,
  "Play-offs": 3,
  Finished: 4,
});



function AdminPanelPage() {
  const {stageId} = useContext(TournamentContext);
  //const { tasks } = stages[stageId];

  const renderCurrentStage = () => {
    switch (stageId) {
      case Stage.Kickstart:
        return <KickstartPage id={stageId}></KickstartPage>;
      case Stage.Registration:
        return <AdminRegistrationPage id={stageId}></AdminRegistrationPage>;
      case Stage["Group stage"]:
        return <GroupStagePage id={stageId}></GroupStagePage>
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
          steps={Object.keys(Stage)}
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

export default AdminPanelPage;

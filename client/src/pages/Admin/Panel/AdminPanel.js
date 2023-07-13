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
import GroupStagePage from "./GroupStage/GroupStage";

function AdminPanelPage() {
  const { stage, stages, id } = useContext(TournamentContext);
  const stageId = stages.indexOf(stage);

  const queryClient = useQueryClient();

  const moveToNextStage = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`/api/tournaments/${id}`, {
        stage: stages[stageId + 1],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tournament", "current"]);
    },
  });

  if (!stage) {
    return <KickstartPage></KickstartPage>;
  }

  const renderCurrentStage = () => {
    switch (stage) {
      case "Registration":
        return (
          <AdminRegistrationPage
            moveToNextStage={moveToNextStage}
          ></AdminRegistrationPage>
        );
      case "Group stage":
        return (
          <GroupStagePage moveToNextStage={moveToNextStage}></GroupStagePage>
        );
    }
  };

  return (
    <>
      <div className="title">
        <h1>Copa I</h1>
        <h3>Autumn 2023</h3>
      </div>
      <div>
        <MyStepper steps={stages} activeStep={stageId}></MyStepper>
        {renderCurrentStage()}
        {/* <MyChecklist items={tasks} heading="Checklist"></MyChecklist> */}
      </div>
    </>
  );
}

export default AdminPanelPage;

import { TDivision } from "@backend/models/division.ts";
import { LoadingBackdrop } from "./features/layout/LoadingBackdrop.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import BracketStructure from "./features/dashboard/BracketStructure.tsx";
import DashboardPage from "./features/dashboard/Dashboard.tsx";
import DrawPage from "./features/dashboard/Draw.tsx";
import Scheduler from "./features/dashboard/Scheduler.tsx";
import MatchPage from "./features/match/MatchPage.tsx";
import MatchesPage from "./features/match/Matches.tsx";
import TeamsPage from "./features/participant/ParticipantsTable.tsx";
import RegistrationPage from "./features/participant/registration.tsx";
import BracketPage from "./features/stage/Bracket.tsx";
import GroupStagePage from "./features/stage/GroupStage.tsx";
import NewTeamPage from "./features/team/CreateTeam.tsx";
import JoinTeamPage from "./features/team/JoinTeam.tsx";
import NoTeamPage from "./features/team/NoTeamPage.tsx";
import TeamProfilePage from "./features/team/TeamProfile.tsx";
import ProfilePage from "./features/user/Profile.tsx";
import { useAuth } from "./features/user/hooks.ts";
import AboutPage from "./features/viewer/AboutPage.tsx";
import HallOfFame from "./features/viewer/AllTimePage.tsx";
import HomePage from "./features/viewer/Home.tsx";
import Header from "./features/viewer/header.tsx";
import { useDivisions, useTournament } from "./features/tournament/hooks.ts";
import "./index.css";
import { darkTheme } from "./themes.ts";
import NotFoundPage from "./features/layout/NotFoundPage.tsx";
import axios from "axios";
import { FeedbackSnackbar } from "./features/layout/FeedbackSnackbar.tsx";
import { TFeedback } from "./features/types.ts";
import AllTeams from "./features/team/AllTeams.tsx";
import BugReportPage from "./features/viewer/BugReport.tsx";
import ChangeLog from "./features/viewer/ChangeLog.tsx";
import RulesPage from "./features/viewer/RulesPage.tsx";

//allow users to change between divisions in view
export const DivisionContext = React.createContext<TDivision | null>(null);
export const DivisionDispatchContext = React.createContext<React.Dispatch<number> | null>(null);

function divisionReducer(prevId: number, newId: number) {
  localStorage.setItem("division", newId.toString());
  return newId;
}

function QueryProvider() {
  const [feedback, setFeedback] = React.useState<TFeedback>({});

  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          switch (error.response?.status) {
            case 429: setFeedback({
              severity: "error",
              message: "Hold up. You are sending too many requests."
            }); break;
            case 409: setFeedback({
              severity: "error",
              message: error.response?.data.message || "Something went wrong..."
            }); break;
            default:
              setFeedback({
                severity: "error",
                message: error.message
              })
          }
        } else {
          setFeedback({
            severity: "error",
            message: "Something went wrong..."
          })
        }
      },
      onSuccess: (data, variables, context, mutation) => {
        if (mutation.meta?.successMessage) {
          setFeedback({
            severity: "success",
            message: mutation.meta?.successMessage as string
          })
        }
      }
    })
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback({})}></FeedbackSnackbar>
      <App></App>
      <ReactQueryDevtools></ReactQueryDevtools>
    </QueryClientProvider>
  )
}

function App() {
  const { data: tournament } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);

  const initialDivision = parseInt(localStorage.getItem("division") || "0");
  const [selected, dispatch] = React.useReducer(divisionReducer, initialDivision);

  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline></CssBaseline>
        <DivisionContext.Provider value={divisions?.[selected]}>
          <DivisionDispatchContext.Provider value={dispatch}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <ChangeLog>
                <Header></Header>
                <Routes>
                  <Route path="/" element={<HomePage></HomePage>}></Route>
                  <Route path="/about" element={<AboutPage></AboutPage>}></Route>
                  <Route path="/hall-of-fame"
                    element={<HallOfFame></HallOfFame>}>
                  </Route>
                  <Route path="/teams" element={<AllTeams></AllTeams>}>
                  </Route>
                  <Route path="/bug-report" element={<BugReportPage></BugReportPage>}>
                  </Route>

                  <Route path="/tournament">
                    <Route
                      path="/tournament/register"
                      element={<RegistrationPage></RegistrationPage>}
                    ></Route>

                    <Route
                      path="/tournament/dashboard"
                      element={<DashboardPage></DashboardPage>}
                    ></Route>

                    <Route path="/tournament/groups"
                      element={<GroupStagePage></GroupStagePage>}></Route>

                    <Route path="/tournament/rules"
                      element={<RulesPage></RulesPage>}></Route>

                    <Route
                      path="/tournament/bracket"
                      element={<BracketPage></BracketPage>}
                    ></Route>

                    <Route path="/tournament/scheduler" element={<Scheduler></Scheduler>}></Route>

                    <Route path="/tournament/draw" element={<DrawPage></DrawPage>}>RR</Route>

                    <Route path="/tournament/structure" element={<BracketStructure></BracketStructure>}></Route>

                    <Route
                      path="/tournament/participants"
                      element={<TeamsPage></TeamsPage>}
                    ></Route>

                    <Route path="/tournament/matches">
                      <Route
                        path="/tournament/matches/:id"
                        element={<MatchPage></MatchPage>}
                      ></Route>

                      <Route
                        path="/tournament/matches"
                        element={<MatchesPage></MatchesPage>}
                      ></Route>
                    </Route>
                  </Route>

                  <Route path="/users">
                    <Route
                      path="/users/:id"
                      element={<ProfilePage></ProfilePage>}
                    ></Route>
                  </Route>

                  <Route path="/team">
                    <Route path="/team/none" element={<NoTeamPage></NoTeamPage>}></Route>
                    <Route
                      path="/team/join"
                      element={<JoinTeamPage></JoinTeamPage>}
                    ></Route>

                    <Route
                      path="/team/create"
                      element={<NewTeamPage></NewTeamPage>}
                    ></Route>
                  </Route>

                  <Route
                    path="/teams/:name"
                    element={<TeamProfilePage></TeamProfilePage>}
                  ></Route>

                  <Route path="*" element={<NotFoundPage></NotFoundPage>}></Route>
                </Routes>
              </ChangeLog>
            </LocalizationProvider>
          </DivisionDispatchContext.Provider>
        </DivisionContext.Provider>
      </ThemeProvider>
    </Router >
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <QueryProvider></QueryProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

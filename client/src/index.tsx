import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
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
import RegistrationPage from "./features/participant/registration.js";
import BracketPage from "./features/stage/Bracket.tsx";
import GroupStagePage from "./features/stage/GroupStage.tsx";
import NewTeamPage from "./features/team/CreateTeam.js";
import JoinTeamPage from "./features/team/JoinTeam.js";
import NoTeamPage from "./features/team/NoTeamPage.tsx";
import TeamPage from "./features/team/Team.js";
import SignInButtton from "./features/user/SignInPage.tsx";
import { useUser } from "./features/user/hooks.ts";
import ProfilePage from "./features/user/profile/Profile";
import HomePage from "./features/viewer/Home.tsx";
import Header from "./features/viewer/header.tsx";
import { useDivisions, useTournament } from "./features/viewer/hooks.ts";
import "./index.css";
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material";
import { TDivision } from "@backend/models/division.ts";

export const darkTheme = responsiveFontSizes(createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#242753"
    },
    primary: {
      main: "#4398B8"
    },
    secondary: {
      main: "#E12B69"
    },
  },
  typography: {
    h2: {
      fontWeight: 600
    }
  },
  components: {
    //TODO: custom styled component
    // MuiCard: {
    //   styleOverrides: {
    //     root: {
    //       background: "#FDFDFD",
    //       color: "black"
    //     },
    //   },
    // },
    // MuiAlert: {
    //   styleOverrides: {
    //     root: {
    //       background: "#FDFDFD"
    //     }
    //   }
    // }
  }
}));

export const lightTheme = responsiveFontSizes(createTheme({
  typography: {
    h2: {
      fontWeight: 600
    }
  },
}));

//allow users to change between divisions in view
export const DivisionContext = React.createContext<TDivision>(null);
export const DivisionDispatchContext = React.createContext<(prevId: number, newId: number) => number>(null);

function divisionReducer(prevId: number, newId: number) {
  return newId;
}

function App() {
  const { data: tournament } = useTournament("current");
  const { data: divisions } = useDivisions(tournament?.id);
  const [selected, dispatch] = React.useReducer(divisionReducer, 0);

  const { data: user, status: userStatus } = useUser("me");
  if (userStatus !== "success") return;

  return (
    <Router>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline></CssBaseline>
        <DivisionContext.Provider value={divisions?.[selected]}>
          <DivisionDispatchContext.Provider value={dispatch}>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Header></Header>
              <Routes>
                <Route path="/" element={<HomePage></HomePage>}></Route>

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

                  <Route
                    path="/tournament/bracket"
                    element={<BracketPage></BracketPage>}
                  ></Route>

                  <Route path="/tournament/scheduler" element={<Scheduler></Scheduler>}></Route>

                  <Route path="/tournament/draw" element={<DrawPage></DrawPage>}>RR</Route>

                  <Route path="/tournament/structure" element={<BracketStructure></BracketStructure>}></Route>

                  <Route
                    path="/tournament/teams"
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

                {/* //TODO: restrict possible team names */}
                <Route path="/teams">
                  <Route path="/teams/none" element={<NoTeamPage></NoTeamPage>}></Route>
                  <Route
                    path="/teams/join"
                    element={<JoinTeamPage></JoinTeamPage>}
                  >R</Route>

                  <Route
                    path="/teams/new"
                    element={<NewTeamPage></NewTeamPage>}
                  ></Route>

                  <Route
                    path="/teams/:name"
                    element={<TeamPage></TeamPage>}
                  ></Route>
                </Route>
              </Routes>
            </LocalizationProvider>
          </DivisionDispatchContext.Provider>
        </DivisionContext.Provider>
      </ThemeProvider>
    </Router >
  );
}

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <App></App>
    </React.StrictMode>
    <ReactQueryDevtools></ReactQueryDevtools>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

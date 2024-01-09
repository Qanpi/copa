import { Box, Typography, Container, Stack, CircularProgress, useTheme, Button, BoxProps, ImageListItem, ImageList } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useStandings } from "../stage/hooks";
import { useStages } from "../stage/hooks";
import { useTournament } from "../tournament/hooks";
import MatchesCalendar from "../match/MatchesCalendar";
import "./Home.css";
import { FinalStandingsItem } from "brackets-manager";
import brush from "./brush.png";
import brush2 from "./brush2.png"
import { LoadingBackdrop } from "../layout/LoadingBackdrop";
import { ArrowDropDown, } from "@mui/icons-material";
import { PromptContainer } from "../layout/PromptContainer";
import NumberCard from "../dashboard/NumberCard";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import Timeline from "@mui/lab/Timeline";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti';
import "./Home.css"

//COPA VI images (temp)
import copaVI1 from "./copaVI/20231201_125753.jpg"
import copaVI2 from "./copaVI/judges.png"
import copaVI3 from "./copaVI/draw_people.png"

import winner from "./copaVI/winners.png"

function WinnerPane({ stageId }: { stageId: string }) {
  //FIXME: needs to show all winners across divisions
  const { data: standings } = useStandings(stageId);

  if (!standings) return <>Loading...</>;

  const winner = (standings as FinalStandingsItem[])[0];
  return <>
    <Typography>
      Congratulations to {winner.name} for winning !
    </Typography>
  </>
}

function WinnersTribute() {
  const { data: tournament } = useTournament("current");
  const { data: stages } = useStages(tournament?.id, {
    type: "single_elimination"
  });

  return stages?.map(s => (<WinnerPane stageId={s.id} key={s.id}></WinnerPane>))

}

function CopaBanner({ children, sx }: BoxProps) {
  const { data: tournament } = useTournament("current");

  return (
    <PromptContainer sx={{ justifyContent: "center", pt: 0, pb: 0, minHeight: "none", mt: 3 }}>
      <Box component="img" src={brush} sx={{
        position: "absolute",
        width: "95vw",
        zIndex: -1,
        rotate: "-2deg",
      }}></Box>
      <Box sx={{
        backdropFilter: "blur(30px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "80vw",
        height: "42vw",
        maxHeight: "600px",
        ...sx
      }}>
        <Stack direction="row" alignItems={"center"} width="100%" spacing={0} justifyContent={"center"}>
          <Typography variant="h1" fontWeight={800} sx={{ fontSize: "15vw!important" }} noWrap>
            {tournament?.name?.toUpperCase()}
          </Typography>
          <Typography sx={{
            textOrientation: "upright",
            writingMode: "vertical-rl",
            fontSize: "2vw!important"
          }}>
            {dayjs().year()}
          </Typography>
        </Stack>
        {/* <Typography variant="subtitle1" sx={{mt: -2, mb: 5}}>is here!</Typography> */}

        {children}
      </Box>
    </PromptContainer>
  )
}

function HomePage() {
  const { data: tournament, status } = useTournament("current");
  const { width, height } = useWindowSize()

  if (status !== "success") {
    return <LoadingBackdrop open={true} sx={{ zIndex: 20 }}></LoadingBackdrop>
  }

  switch (tournament.state) {
    case undefined:
      return <Container maxWidth="md" sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "500px"
      }}>
        <Typography>No tournament yet. Stay tuned.</Typography>
      </Container>

    case "Complete":
      return <Stack sx={{ alignItems: "center" }} height={"100vh"}>
        <CopaBanner >
          <Typography color="primary" fontSize={"7vw"} fontWeight={1000} sx={{
            background: "var(--copa-pink)",
            letterSpacing: "1vw",
            paddingLeft: "1vw",
            pt: 0,
            pb: 0,
            maxWidth: "45vw",
            marginTop: "-0.3em",
            lineHeight: "65%"
          }}>WRAPPED</Typography>
        </CopaBanner>

        <Timeline sx={{ mt: "-5vw", display: "flex", alignItems: "center", position: "relative" }} position="alternate-reverse">
          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector></TimelineConnector>
              <TimelineDot></TimelineDot>
              <TimelineConnector></TimelineConnector>
            </TimelineSeparator>
            <TimelineContent sx={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "end" }}>
              What a journey! Over the period of Copa VI, we've amassed...
            </TimelineContent>
          </TimelineItem>


          <Box sx={{ m: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} color={"var(--copa-purple)"}>
              <NumberCard number={758}>users</NumberCard>
              <NumberCard number={16}>teams</NumberCard>
              <NumberCard number={28}>matches</NumberCard>
            </Stack>
          </Box>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector></TimelineConnector>
              <TimelineDot></TimelineDot>
              <TimelineConnector></TimelineConnector>
            </TimelineSeparator>
            <TimelineContent sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "start" }}>
              ...made countless memories...
            </TimelineContent>
          </TimelineItem>

          <Box position="relative" sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Box src={brush2} component="img" sx={{
              position: "absolute",
              width: "100%",
              filter: "blur(0.5px"
            }}></Box>
            <ImageList variant="masonry" cols={2} gap={8} sx={{ width: "70%", m: 5, minWidth: "300px" }}>
              <ImageListItem>
                <img alt="indoor hall" src={copaVI1}></img>
              </ImageListItem>
              <ImageListItem >
                <img alt="indoor hall" src={copaVI2}></img>
              </ImageListItem>
              <ImageListItem sx={{ pt: "30%" }}>
                <img alt="indoor hall" src={copaVI3}></img>
              </ImageListItem>
            </ImageList>
          </Box>

          <TimelineItem>
            <TimelineSeparator>
              <TimelineConnector></TimelineConnector>
              <TimelineDot></TimelineDot>
              <TimelineConnector></TimelineConnector>
            </TimelineSeparator>
            <TimelineContent sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "end" }}>
              ...and crowned the winners.
            </TimelineContent>
          </TimelineItem>

          <Confetti numberOfPieces={50} width={width} height={height}></Confetti>
          <Stack justifyContent={"center"} alignItems="center" sx={{ m: 5, width: "60%" }} gap={2}>
            <Box component="img" alt="indoor hall" src={winner} width="100%" sx={{
              boxShadow: "0 0 100px 10px var(--copa-aqua)",
            }}></Box>
            <Typography variant="h4">Congratulations to <Link color="primary" to="/teams/PiPo%20IF">PiPo IF</Link>!</Typography>
          </Stack>
        </Timeline>
      </Stack>
    case "Registration":
      if (!tournament.registration?.from)
        return <CopaBanner>
          <Typography variant="subtitle1" >
            Registration is just around the corner.
          </Typography>
        </CopaBanner>

      const now = new Date();
      const from = new Date(tournament.registration.from);

      if (now <= from)
        return (
          <CopaBanner>
            <Typography variant="subtitle1" >
              Registration begins {dayjs().to(tournament.registration.from)}.
            </Typography>
          </CopaBanner>
        )


      const to = tournament.registration?.to && new Date(tournament.registration.to);

      if (!to || now <= to) return (
        <>
          <CopaBanner>
            <Typography variant="body1" noWrap>
              {to ? `Registration closes ${dayjs().to(tournament.registration.to)}!` : "Hurry up! There is still time to register."}
            </Typography>
            <Link to="/tournament/register">
              <Box sx={{ display: "flex", position: "relative", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <Button variant="contained" sx={{ mt: 3, }} color="secondary">
                  Register
                </Button>
              </Box>
            </Link>
          </CopaBanner >
        </>
      );

      return (
        <CopaBanner>
          <Typography variant="body1" noWrap>
            {`Sorry, registration closed ${dayjs().to(tournament.registration.to)}. The tournament will begin soon.`}
          </Typography>
        </CopaBanner >
      )

    default:
      return (
        <Container sx={{ p: 5, pt: 10 }} maxWidth="xl">
          <Stack direction={{ xs: "column", md: "row" }} spacing={5} display="flex" justifyContent="center">
            <MatchesCalendar></MatchesCalendar>
            <Box display="flex" justifyContent="center">
              <Box sx={{
                background: "linear-gradient(150deg, var(--copa-aqua), 20%, var(--copa-purple) 55%, 80%, var(--copa-pink))",
                height: { xs: "90vmin", md: "55vmin", lg: "70vmin" },
                width: { xs: "90vmin", md: "55vmin", lg: "70vmin" },
              }}

                display="flex" justifyContent="center" alignItems="center" minHeight="100%"
              >
                <Typography>No instagram content to display.</Typography>
              </Box>
            </Box>
          </Stack >
        </Container >
      );
  }
}

export default HomePage;

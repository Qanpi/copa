import { useParams } from "react-router";
import { useMatch, useMatches, useUpdateMatch } from "../hooks";
import { useParticipant } from "../../../participant/hooks";
import { useTimer } from "react-timer-hook";
import dayjs from "dayjs";
import { Button } from "@mui/base";
import { useCallback } from "react";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";
import { Formik, Form } from "formik";
import ScoreCounter from "../../../inputs/ScoreCounter/ScoreCounter";

const MatchTimer = ({ min }: { min: number }) => {
  const getExpiryTimestamp = () => dayjs().add(min, "minutes").toDate();

  const { minutes, seconds, start, pause, resume, restart } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => console.log("epxciring"),
    autoStart: false,
  });

  return (
    <>
      <div>{`${minutes}:${seconds}`}</div>
      <div>
        <Button onClick={start}>Start</Button>
        <Button onClick={pause}>Pause</Button>
        <Button onClick={resume}>Resume</Button>
        <Button onClick={() => restart(getExpiryTimestamp(), false)}>
          Reset
        </Button>
      </div>
    </>
  );
};

function MatchPage() {
  const { id } = useParams();
  const { data: match, status } = useMatch(id);

  const { data: opp1 } = useParticipant(match?.opponent1.id);
  const { data: opp2 } = useParticipant(match?.opponent2.id);

  const updateMatch = useUpdateMatch();

  if (status === "loading") return <div>Loading...</div>;

  return (
    <Formik
      initialValues={{
        id,
        opponent1: {
          score: 0,
          result: undefined,
        },
        opponent2: {
          score: 0,
          result: undefined
        },
      }}
      onSubmit={(values) => updateMatch.mutate(values)}
    >
      <Form>
        <div>{opp1?.name}</div>
        <ScoreCounter name="opponent1.score"></ScoreCounter>
        <div>{opp2?.name}</div>
        <ScoreCounter name="opponent2.score"></ScoreCounter>
        <Button type="submit">Submit</Button>
        <MatchTimer min={match.duration}></MatchTimer>
      </Form>
    </Formik>
  );
}

export default MatchPage;

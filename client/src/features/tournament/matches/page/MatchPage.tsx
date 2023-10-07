import { useParams } from "react-router";
import { useMatch, useMatches, useUpdateMatch } from "../hooks";
import { useParticipant } from "../../../participant/hooks";
import { useTimer } from "react-timer-hook";
import dayjs from "dayjs";
import { Button } from "@mui/base";
import { useCallback, useContext, useEffect } from "react";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";
import { Formik, Form, useFormikContext } from "formik";
import ScoreCounter from "../../../inputs/ScoreCounter";
import { AdminContext } from "../../../..";

const MatchTimer = ({ duration }: { duration: number }) => {
  console.log(duration)
  const getExpiryTimestamp = () => dayjs().add(duration, "seconds").toDate();

  const { minutes, seconds, start, pause, resume, restart, isRunning, totalSeconds } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => console.log("epxciring"),
    autoStart: false,
  });

  const {setFieldValue, submitForm} = useFormikContext();

  useEffect(() => {
    const updateFrequency = 5;

    if (isRunning && seconds % updateFrequency === 0) {
      setFieldValue("elapsed", duration - totalSeconds);
      submitForm();
    }

  }, [seconds])

  const isAdmin = useContext(AdminContext);

  const handleReset = () => {
    setFieldValue("elapsed", 0);
    submitForm();
    //FIXME: restari gfter page reload doesn't worki
    restart(getExpiryTimestamp(), false);
  }

  return (
    <>
      <div>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
      {isAdmin ? <div>
        {isRunning ?
          <Button onClick={pause}>Pause</Button> :
          <Button onClick={resume}>Start</Button>
        }
        <Button onClick={handleReset}>
          Reset
        </Button>
      </div> : null}
    </>
  );
};

function MatchPage() {
  const { id } = useParams();
  const { data: match, status } = useMatch(id);
  console.log(match)

  //FIXME: auto-complete match if one of the articpns is BYE
  const { data: opp1 } = useParticipant(match?.opponent1?.id);
  const { data: opp2 } = useParticipant(match?.opponent2?.id);

  const updateMatch = useUpdateMatch();

  const isAdmin = useContext(AdminContext);

  if (status === "loading") return <div>Loading...</div>;

  const duration = match.duration * 60 - match.elapsed;

  return (
    <Formik
      initialValues={{
        ...match,
        opponent1: {
          ...match.opponent1,
          score: 0
        },
        opponent2: {
          ...match.opponent2,
          score: 0
        }
      }}
      onSubmit={(values) => updateMatch.mutate(values)}
    >
      {({ values, submitForm, setFieldValue }) => (
        <Form>
          <div>{opp1?.name}</div>
          <ScoreCounter name="opponent1.score"></ScoreCounter>
          <div>{opp2?.name}</div>
          <ScoreCounter name="opponent2.score"></ScoreCounter>
          {values.elapsed}
          {isAdmin ? <Button onClick={
            () => {
              const s1 = values.opponent1.score;
              const s2 = values.opponent2.score;

              if (s1 > s2) setFieldValue("opponent1.result", "win");
              else if (s1 === s2) setFieldValue("opponent1.result", "draw"); //FIXME: deal with this properly
              else setFieldValue("opponent2.result", "win");

              submitForm();
            }
          }>Submit</Button> : null}
          <MatchTimer duration={duration}></MatchTimer>
        </Form>
      )
      }
    </Formik>
  );
}

export default MatchPage;

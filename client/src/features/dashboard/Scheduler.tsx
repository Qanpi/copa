import { Box, Button } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Form, Formik } from 'formik';
import { ReactNode, useState } from 'react';
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { useMatches, useUpdateMatch } from '../match/hooks';
import { useTournament } from '../viewer/hooks';
import { groupBy } from "lodash-es"
import { useParticipants } from '../participant/hooks';

const useMatchScheduler = () => {
  const { data: tournament } = useTournament("current");
  const { data: participants } = useParticipants(tournament?.id);
  const updateMatch = useUpdateMatch();

  return (start: Dayjs, adminBlocked: Dayjs[], matches: any[]) => {
    const byRound = groupBy(matches, (m) => {
      const round = tournament?.rounds.find((r: any) => r.id === m.round);
      return round.number;
    });
    const matchesByRound = Object.values(byRound);

    let day = start.subtract(1, "day");
    let round = 0;

    while (round < matchesByRound.length) {
      day = day.add(1, "day");

      if (day.day() === 0 || day.day() === 6) continue;
      if (adminBlocked.some((b) => b.isSame(day, "day"))) continue;

      //check if it's blocked by teams
      for (const m of matchesByRound[round]) {
        const opponents = participants.filter(
          (p: any) => p.id === m.opponent1.id || p.id === m.opponent2.id
        );

        let blocked = false;
        opponents.forEach((o: any) => {
          if (o.blocked?.some((b: any) => b.isSame(day, "day"))) {
            blocked = true;
          }
        });

        if (blocked) {
          matchesByRound[round + 1] =
            round + 1 < matchesByRound.length ? matchesByRound[round + 1] : [];
          matchesByRound[round + 1].unshift(m);
          continue;
        }

        updateMatch.mutate({ ...m, start: day.toDate() });
      }

      round++;
    }
  };
};

const Scheduler = () => {
  const [ranges, setRanges] = useState({
    play: {
      startDate: new Date(),
      endDate: new Date(),
      key: 'play',
    } as Range
  });

  const { data: tournament } = useTournament("current");

  const { data: unscheduledMatches } = useMatches(tournament?.id, {
    scheduled: "false",
    state: "Groups"
  });

  const [blockedDates, setBlockedDates] = useState([])

  const handleScheduleMatches = useMatchScheduler();

  const handleChangeRange = ({ play }: RangeKeyDict) => {
    const start = dayjs(play.startDate);
    const end = play.endDate;


    if (start.isSame(end, "day")) {
      const filtered = blockedDates.filter((d) => !d.isSame(start, "day"));

      if (filtered.length < blockedDates.length) {
        setBlockedDates(filtered);
      } else {
        setBlockedDates([...blockedDates, start])
      }
    } else {
      setRanges({ ...ranges, play });
    }
  }

  const blockedDayRenderer = (day) => {
    const date = dayjs(day);

    if (date.day() !== 0 && date.day() !== 6) { //if weekday
      if (!blockedDates.some((d) => d.isSame(date))) return; //if not blocked
    }

    return <Box sx={{
      color: "red"
    }}>
      {date.date()}
    </Box>
  }

  return <Formik
    initialValues={{
      start: dayjs().day(8), //next Monday
      blocked: [], //next Monday
    }}
    onSubmit={(values) =>
      handleScheduleMatches(
        values.start,
        values.blocked,
        unscheduledMatches
      )
    }
  >
    <Form>
      <DateRange
        ranges={Object.values(ranges)}
        months={2}
        direction='vertical'
        minDate={dayjs().toDate()}
        maxDate={dayjs().add(6, 'months').toDate()}
        scroll={{ enabled: true }}
        onChange={handleChangeRange}
        focusedRange={[0, 0]}
        dayContentRenderer={blockedDayRenderer}
      />

      <Button type="submit">
        Automatically schedule group stage matches
      </Button>
    </Form>
  </Formik>

}

export default Scheduler;
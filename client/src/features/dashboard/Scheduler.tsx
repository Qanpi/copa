import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from "react-date-range"
import { useState } from 'react';
import dayjs from 'dayjs';
import { Box, Button, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useMatchScheduler, useMatches } from '../tournament/matches/hooks';
import { useTournament } from '../tournament/hooks';

const Scheduler = () => {
  const [ranges, setRanges] = useState({
    play: {
      startDate: new Date(),
      endDate: new Date(),
      key: 'play',
    }
  });

  const {data: tournament} = useTournament("current");
  const {groupStage} = tournament;

  const { data: unscheduledMatches } = useMatches({
    stage_id: groupStage?.id,
    scheduled: false
  });

  const [blockedDates, setBlockedDates] = useState([])

  const handleScheduleMatches = useMatchScheduler();

  const handleChangeRange = (updated) => {
    const start = dayjs(updated["play"].startDate);
    const end = updated["play"].endDate;


    if (start.isSame(end, "day")) {
      const filtered = blockedDates.filter((d) => !d.isSame(start, "day"));

      if (filtered.length < blockedDates.length) {
        setBlockedDates(filtered);
      } else {
        setBlockedDates([...blockedDates, start])
      }
      return;
    }

    setRanges({ ...ranges, ...updated })
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
      <DateRange ranges={Object.values(ranges)} onChange={handleChangeRange} focusedRange={[0, 0]} dayContentRenderer={blockedDayRenderer} />

      <Button type="submit">
        Automatically schedule group stage matches
      </Button>
    </Form>
  </Formik>

}

export default Scheduler;
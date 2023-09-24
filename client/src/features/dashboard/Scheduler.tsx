import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRange } from "react-date-range"
import { useState } from 'react';
import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';

const Scheduler = () => {
  const [ranges, setRanges] = useState({
    play: {
      startDate: new Date(),
      endDate: new Date(),
      key: 'play',
    }
  });

  const [blockedDates, setBlockedDates] = useState([])

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

  return <>
    <DateRange ranges={Object.values(ranges)} onChange={handleChangeRange} focusedRange={[0, 0]} dayContentRenderer={blockedDayRenderer} />
  </>

}

export default Scheduler;
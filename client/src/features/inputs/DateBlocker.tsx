import { PickersDayProps, PickersDay, DateCalendarProps, DateCalendar } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useField, useFormikContext } from "formik";
import { memo } from "react";

const CustomPickersDay = (
  props: PickersDayProps<Dayjs> & { blockedDays: Dayjs[] }
) => {
  const { blockedDays: blocked, ...rest } = props;

  const isBlocked = blocked.some((b) => b.isSame(props.day));

  return (
    <PickersDay
      {...rest}
      selected={isBlocked}
      sx={{
        "&.Mui-selected": {
          background: "red",
          "&:focus": {
            background: "#c00",
          },
        },
        "&:hover": {
          background: "#8e060624",
        },
      }}
    ></PickersDay>
  );
};

const DateBlocker = (
  props: DateCalendarProps<Dayjs> & { name: string; blockedDays: Dayjs[] }
) => {
  const { blockedDays, ...rest } = props;
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext();

  return (
    <DateCalendar
      {...rest}
      value={null}
      disablePast
      disableHighlightToday
      onChange={(date: Dayjs) => {
        if (field.value.some((d: Dayjs) => d.isSame(date))) {
          setFieldValue(
            field.name,
            meta.value.filter((d: Dayjs) => !d.isSame(date))
          );
        } else {
          setFieldValue(field.name, [...meta.value, date]);
        }
      }}
      slots={{
        day: CustomPickersDay,
      }}
      slotProps={{
        day: {
          blockedDays,
        } as PickersDayProps<Dayjs> & { blockedDays: Dayjs[] },
      }}
    ></DateCalendar>
  );
};

 export default memo(DateBlocker);
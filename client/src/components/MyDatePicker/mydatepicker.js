import { DatePicker } from "@mui/x-date-pickers";
import { useField, useFormikContext } from "formik";

const MyDatePicker = ({ ...props }) => {
  const [field, meta] = useField(props);
  const { setFieldValue } = useFormikContext();

  return (
      <DatePicker
        {...props}
        {...field}
        slotProps={{
          textField: {
            helperText: meta.error,
          },
        }}
        onChange={(value) => setFieldValue(field.name, value)}
      />
  );
};

export default MyDatePicker;
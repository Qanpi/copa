import { DatePicker } from "@mui/x-date-pickers";
import { useField, useFormikContext } from "formik";

const MyDatePicker = ({ ...props }) => {
  const [field, meta] = useField(props);
  const { setFieldValue, setFieldTouched, handleChange } = useFormikContext();

  return (
      <DatePicker
        slotProps={{
          textField: {
            helperText: meta.touched && meta.error,
            error: meta.error && meta.touched
          },
        }}

        {...field}
        onChange={(value) => {
            setFieldValue(field.name, value)
        }}
        onClose={()=> {
            //disable validation because of out-of-sync issues
            //see: https://github.com/jaredpalmer/formik/issues/2059
            setFieldTouched(field.name, true, false)         }}

        {...props}
      />
  );
};

export default MyDatePicker;
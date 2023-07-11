import { DatePicker } from "@mui/x-date-pickers";
import { useField, useFormikContext } from "formik";

const MyDatePicker = ({ ...props }) => {
  const [field, meta] = useField(props);
  const { setFieldValue, setFieldTouched, handleChange } = useFormikContext();

  return (
      <DatePicker
        {...props}
        {...field}
        slotProps={meta.touched ? {
          textField: {
            helperText: meta.error,
          },
        } : null}
        
        onChange={(value) => {
            setFieldValue(field.name, value)
        }}
        onClose={()=> {
            //disable validation because of out-of-sync issues
            //see: https://github.com/jaredpalmer/formik/issues/2059
            setFieldTouched(field.name, true, false)         }}
      />
  );
};

export default MyDatePicker;
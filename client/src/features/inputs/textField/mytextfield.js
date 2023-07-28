import { useField, useFormikContext } from "formik";
import { TextField } from "@mui/material";

const MyTextField = ({ ...props }) => {
  const [field, meta] = useField(props);
  const {setFieldTouched} = useFormikContext();

  return (
    <TextField
      error={meta.error && meta.touched}
      helperText={meta.touched && meta.error}
      {...field}
      {...props}
      onInput={() => setFieldTouched(field.name, true)}
    ></TextField>
  );
};

export default MyTextField;

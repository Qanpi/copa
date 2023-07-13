import { useField } from "formik";
import { TextField } from "@mui/material";

const MyTextField = ({ ...props }) => {
  const [field, meta] = useField(props);

  return (
    <TextField
      error={meta.error && meta.touched}
      helperText={meta.touched && meta.error}
      {...field}
      {...props}
    ></TextField>
  );
};

export default MyTextField;

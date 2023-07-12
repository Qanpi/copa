import { useField } from "formik";
import { TextField } from "@mui/material";

const MyTextField = ({ ...props }) => {
  const [field, meta] = useField(props);

  console.log(meta)
  return (
  <TextField error={meta.touched && meta.error ? true : false} helperText={meta.error} {...field} {...props}></TextField>);
};

export default MyTextField;

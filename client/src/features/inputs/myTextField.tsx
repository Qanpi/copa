import { useField, useFormikContext } from "formik";
import { TextField, TextFieldProps } from "@mui/material";

const MyTextField = ({...props } : TextFieldProps) => {
  const [field, meta] = useField(props);
  const {setFieldTouched} = useFormikContext();

  const handleInput = () => {
    setFieldTouched(field.name, true);
  }

  return (
    <TextField
      error={meta.error !== undefined && meta.touched}
      helperText={meta.touched && meta.error}
      {...field}
      {...props}
      // onInput={handleInput}
    ></TextField>
  );
};

export default MyTextField;

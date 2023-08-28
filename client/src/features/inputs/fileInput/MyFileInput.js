import { useField } from "formik";
import { InputLabel, Input } from "@mui/material";

const MyFileInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  //not allowed to set value on input type="file" for security reasons
  const {value, ...rest} = field;
  return (
    <>
      <InputLabel>{label}</InputLabel>
      <Input
        type="file"
        {...props}
        {...rest}
        error={meta.error && meta.touched}
      ></Input>
    </>
  );
};

export default MyFileInput;

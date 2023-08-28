import { useField } from "formik";
import { InputLabel, Input } from "@mui/material";

const MyFileInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  const {value, ...rest} = field;
  console.log(rest)
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

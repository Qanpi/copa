import { useField } from "formik";
import { InputLabel, Input } from "@mui/material";

const MyFileInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <>
      <InputLabel>{label}</InputLabel>
      <Input
        type="file"
        {...props}
        {...field}
        error={meta.error && meta.touched}
      ></Input>
    </>
  );
};

export default MyFileInput;

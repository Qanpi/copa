import { useField } from "formik";
import { InputLabel, Input, InputProps } from "@mui/material";

const MyFileInput = ({ label, ...props }: {label?: string, name: string} & InputProps) => {
  const [field, meta] = useField(props.name);

  //not allowed to set value on input type="file" for security reasons
  const { value, ...rest } = field;

  return (
    <>
      {label ? <InputLabel>{label}</InputLabel>: null}
      <Input
        type="file"
        {...props}
        {...rest}
        error={meta.error !== undefined && meta.touched}
      ></Input>
    </>
  );
};

export default MyFileInput;

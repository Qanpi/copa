import { FormControl, FormHelperText, InputLabel, Select } from "@mui/material";
import { useField } from "formik";

const MySelect = ({ children, label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select error={meta.error && meta.touched} label={label} {...field} {...props}>
        {children}
      </Select>
      <FormHelperText>{meta.touched && meta.error}</FormHelperText>
    </FormControl>
  );
};

export default MySelect;

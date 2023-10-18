import { FormControl, FormHelperText, InputLabel, Select, SelectProps } from "@mui/material";
import { useField } from "formik";

const MySelect = ({name, children, label, sx, ...props }: SelectProps & {name: string}) => {
  const [field, meta] = useField(name);

  return (
    <FormControl sx={{minWidth: "100px", ...sx}}>
      <InputLabel>{label}</InputLabel>
      <Select error={meta.error !== undefined && meta.touched} label={label} {...field} {...props}>
        {children}
      </Select>
      <FormHelperText>{meta.touched && meta.error}</FormHelperText>
    </FormControl>
  );
};

export default MySelect;

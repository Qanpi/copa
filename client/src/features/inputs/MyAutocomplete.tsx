import { Autocomplete, TextField } from "@mui/material";
import { useField, useFormikContext } from "formik";

type MyAutocompleteProps = {
    name: string
}

const MyAutocomplete = ({ ...props } : MyAutocompleteProps) => {
  const [field, meta] = useField(props);
  const { setFieldValue, setFieldTouched } = useFormikContext();

  return (
    <Autocomplete
      multiple
      options={meta.initialValue}
      freeSolo
      {...field}
      onChange={(_, value, reason) => {
        setFieldValue(field.name, value);
        setFieldTouched(field.name, true, false);
      } }
      renderInput={(params) => {
        return (
          <TextField
            error={meta.error && meta.touched}
            helperText={meta.touched && meta.error}
            {...params}
            label="Divisions"
            placeholder="Type any name..."
            InputProps={{
              ...params.InputProps,
              type: "search",
            }} />
        );
      } }
    ></Autocomplete>
  );
};

export default MyAutocomplete;

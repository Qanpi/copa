import { useField } from "formik";
import { InputLabel, Grid, Input, Slider } from "@mui/material";

const MyNumberSlider = ({ units, label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <>
      <InputLabel htmlFor={props.name || props.id}>{label}</InputLabel>
      <Grid container spacing={5}>
        <Grid item>
          <Input type="number" {...field} inputProps={props}></Input>
          <span> {units}</span>
        </Grid>
        <Grid item xs>
          <Slider sx={{ width: 200 }} {...field} {...props}></Slider>
        </Grid>
        <Grid item>
            {meta.error && meta.touched ? meta.error : null}
        </Grid>
      </Grid>
    </>
  );
};

export default MyNumberSlider;
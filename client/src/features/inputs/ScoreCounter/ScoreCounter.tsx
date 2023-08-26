import {
  Unstable_NumberInput as NumberInput,
  NumberInputDecrementButtonSlotProps,
  NumberInputInputSlotProps,
  NumberInputProps,
  numberInputClasses,
} from "@mui/base/Unstable_NumberInput";
import { styled } from "@mui/system";
import React, { ForwardedRef, ReactNode, forwardRef } from "react";
import { Button, ButtonBaseProps, Input } from "@mui/material";
import { useField, useFormikContext } from "formik";

const CustomButton = ({
  children,
  ...props
}: NumberInputDecrementButtonSlotProps & ButtonBaseProps) => {
  const { ownerState, ...rest } = props;
  return (
    <button type="button" {...rest}>
      {children}
    </button>
  );
};

const ScoreInput = (props: NumberInputInputSlotProps & { name: string }) => {
  const { ownerState, ...rest } = props;

  return <Input type="number" {...rest}></Input>;
};

const ScoreCounter = forwardRef(function CustomNumberInput(
  props: NumberInputProps & { name: string },
  ref: ForwardedRef<HTMLInputElement>
) {
  const [field, meta] = useField(props.name);
  const { setFieldValue, submitForm } = useFormikContext();

  return (
    <NumberInput
      slots={{
        input: ScoreInput,
        incrementButton: CustomButton,
        decrementButton: CustomButton,
      }}
      slotProps={{
        incrementButton: {
          children: "▴",
          name: field.name,
        },
        decrementButton: {
          children: "▾",
          name: field.name,
        },
        input: {
          name: field.name,
        },
      }}
      min={0}
      {...field}
      {...props}
      onChange={(e, v) => {
        setFieldValue(field.name, v);
        submitForm();
      }} //for some reason default breaks
      ref={ref}
    />
  );
});

export default ScoreCounter; //FIXME: ref issues

const StyledInputRoot = styled("div")(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-weight: 400;
  border-radius: 8px;

  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;


  &.${numberInputClasses.focused} {

  }

  &:hover {

  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`
);

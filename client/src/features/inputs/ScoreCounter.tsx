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

const ScoreInput = forwardRef((props: NumberInputInputSlotProps & { name: string }, ref) => {
  const { ownerState, ...rest } = props;

  return <Input type="number" {...rest} ref={ref}></Input>;
});

const ScoreCounter = function CustomNumberInput(
  props: NumberInputProps & { name: string },
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

      onChange={(e, v) => {
        setFieldValue(field.name, v);
        submitForm();
      }}
    />
  );
};

export default ScoreCounter; //FIXME: ref issues
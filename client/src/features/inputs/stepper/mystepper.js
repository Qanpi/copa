import { StepLabel, Stepper, Step } from "@mui/material";
import { useState } from "react";


function MyStepper({steps, activeStep}) {
  return (
    <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map(s => {
            return <Step key={s}>
                <StepLabel>
                    {s}
                </StepLabel>
            </Step>
        })}
    </Stepper>
  );
}

export default MyStepper;

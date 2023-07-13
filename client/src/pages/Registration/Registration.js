import { useContext } from "react";
import { AuthContext, TeamContext } from "../..";
import { MenuItem, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import MyTextField from "../../components/MyTextField/mytextfield";
import MyStepper from "../../components/MyStepper/mystepper";
import MySelect from "../../components/MySelect/mySelect";

function RegistrationPage() {
  const user = useContext(AuthContext);
  const team = useContext(TeamContext);

  //team member -> ask manager
  //team manager -> register
  //teamless -> join/create team
  //registered -> alr registered

  if (team) {
    if (team.isRegistered) {
        return (
            <div>
                Your team is already registered.
            </div>
        )
    }
    else if (team.manager == user.id) {
      return (
        <>
            <Typography variant="h6">Please verify the information below</Typography>
            <Formik 
            initialValues={team}>
                <Form>
                    <MyTextField name="name" label="name"></MyTextField>
                    <MyTextField name="phoneNumber"></MyTextField>
                    <MySelect name="division">
                        <MenuItem value="Men's">Men's</MenuItem>
                        <MenuItem value="Women's">Women's</MenuItem>
                    </MySelect>
                </Form>
            </Formik>
        </>
      );
    } else {
      return (
        <>
          <div>
            <p>You are currently a member of {team.name}</p>
            <p>Please ask the leader of your team to register.</p>
            <p>
              If you wish to play in another team, please leave the current one
              and join/create a new team.
            </p>
          </div>
        </>
      );
    }
  } else {
    return (
      <>
        <div>You are not currently in a team.</div>
        <p>Please join or create a team in order to participate.</p>
      </>
    );
  }
}

export default RegistrationPage;

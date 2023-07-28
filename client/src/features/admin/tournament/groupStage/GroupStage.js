import { Backdrop, Typography } from "@mui/material";
import MyChecklist from "../../../inputs/checklist/MyChecklist";
import "./GroupStage.css"
import { ClockIcon } from "@mui/x-date-pickers";

const tasks = [{ name: "Draw teams", description: "Allocate into groups" }];
function GroupStage() {
  return (
    <>
      {/* maybe show groups and other related data */}
      {/* <AdminCalendar></AdminCalendar> */}
        {/* <MyChecklist items={tasks}></MyChecklist> */}
      {/* <Backdrop open={true} className="backdrop">
        <ClockIcon></ClockIcon>
        <Typography>Please wait for the registration period to end.</Typography>
      </Backdrop> */}
    </>
  );
}

export default GroupStage;

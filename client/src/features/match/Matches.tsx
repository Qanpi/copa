
import type { } from "@mui/lab/themeAugmentation";
import type { } from "@mui/x-date-pickers/themeAugmentation";
import BannerPage from "../viewer/BannerPage";
import MatchesCalendar from "./MatchesCalendar";

function MatchesPage() {
  return (
    <BannerPage title="Fixtures">
      <MatchesCalendar></MatchesCalendar>
    </BannerPage>
  );
}

//TODO: time-blocking for teams

export default MatchesPage;

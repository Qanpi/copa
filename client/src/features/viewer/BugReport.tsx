import { Box, Stack, Typography } from "@mui/material";
import DevFeature from "../layout/DevelopmentFeature";
import { PromptContainer } from "../layout/PromptContainer";
import { QAndA } from "./AboutPage";
import { Link } from "react-router-dom";

function BugReportPage() {
    return (
        <PromptContainer sx={{ alignItems: "center", justifyContent: "left" }}>
            <Stack direction="column" spacing={4}>
                <QAndA q="Something is broken :(">
                    <Typography>If the issue is somewhat urgent, please feel free to reach out to either me or Urho directly (contact info below). In other cases, it might be more beneficial for you to fill out <Link style={{ textDecoration: "underline" }} to="https://forms.office.com/e/9AyLJXiJQ8">this form</Link>, in as much detail as possible.</Typography>
                </QAndA>
                <QAndA q="I have a cool suggestion">
                    <Typography>Again, don't hesitate to reach out to me about it. Alternatively, you can fill out <Link style={{ textDecoration: "underline" }} to="https://forms.office.com/e/6RQ6UBzrm2">this form.</Link></Typography>
                </QAndA>
                <QAndA q="Becoming an alpha tester" a="'Alpha' testing means that you will get access to a separately run, mock Copa tournament. This will allow you to explore features and note weird behaviours before they would happen in the actual Copa VI. In case you are indeed willing to sacrifice some time for the greater good, please reach out to me directly and we'll sort it out.">
                </QAndA>
                <QAndA q="I want to contribute" a="Finally, if you are interested in how the webapp was made or you want to contribute to it, the source code is publicly available on GitHub. I can aid with the setup and introduction, if necessary.">
                </QAndA>
                <Box>
                    <Typography variant="h5" color="secondary">Contact details</Typography>
                    <Typography>+358 45 2077 333 - Aleksei IB2</Typography>
                </Box>
            </Stack>
        </PromptContainer>
    )
}

export default BugReportPage;
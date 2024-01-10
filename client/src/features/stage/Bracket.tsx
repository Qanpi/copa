import BracketStructure from "../dashboard/BracketStructure";
import { useBracketsViewer } from "./hooks";
import { useStageData } from "./hooks";
import { useTournament } from "../tournament/hooks";
import { useStages } from "./hooks";
import DivisionPanel from "../layout/DivisionPanel";
import { useContext } from "react";
import { DivisionContext } from "../..";
import BannerPage from "../viewer/BannerPage";
import { Container, Skeleton, Typography } from "@mui/material";
import { PromptContainer } from "../layout/PromptContainer";

function BracketPage() {
    const { data: tournament } = useTournament("current");
    const division = useContext(DivisionContext);

    const { data: stages } = useStages(tournament?.id, {
        type: "single_elimination",
        division: division?.id
    })
    const { data: stageData, isLoading } = useStageData(stages?.[0]?.id);

    const bracketsRef = useBracketsViewer(stageData, "#bracket");

    const bracket = stageData ?
        <div
            ref={bracketsRef}
            className="brackets-viewer"
            id="bracket"
        ></div> : <PromptContainer>
            <Typography>Hang on, we're not there yet.</Typography>
        </PromptContainer>


    return <BannerPage title={"Bracket"}>
        <DivisionPanel>
            {isLoading ? <Skeleton variant="rounded" height="50vh"></Skeleton>: bracket}
        </DivisionPanel>
    </BannerPage>
}

export default BracketPage;
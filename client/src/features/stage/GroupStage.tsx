import { useTournament } from "../tournament/hooks";
import GroupStageStructure from "../dashboard/GroupStage";
import { ViewerData } from "ts-brackets-viewer";
import { useContext, useLayoutEffect } from "react";
import DrawPage from "../dashboard/Draw";
import { DivisionContext } from "../..";
import { useGroupStageData, useStages } from "./hooks";
import DivisionPanel from "../layout/DivisionPanel";
import { useStageData } from "./hooks";
import { useBracketsViewer } from "./hooks";
import { Container, Typography } from "@mui/material";
import BannerPage from "../viewer/BannerPage";
import "ts-brackets-viewer/dist/style.css"
import { PromptContainer } from "../layout/PromptContainer";

function GroupStagePage() {
    const { data: tournament } = useTournament("current");
    const division = useContext(DivisionContext);

    const { data: stages } = useStages(tournament?.id, {
        type: "round_robin",
        division: division?.id
    })
    const { data: stageData } = useStageData(stages?.[0]?.id);

    const bracketsRef = useBracketsViewer(stageData, "#group-stage");

    return <BannerPage title={"Groups"}>
        <DivisionPanel>
            {stageData ?
                <div
                    ref={bracketsRef}
                    className="brackets-viewer"
                    id="group-stage"
                ></div>
                : <PromptContainer>
                    <Typography>Groups will appear here once we get there.</Typography>
                </PromptContainer>}
        </DivisionPanel>
    </BannerPage>
}

export default GroupStagePage;

import { C } from "@fullcalendar/core/internal-common";
import BracketStructure from "../../dashboard/BracketStructure";
import { useBracketsViewer, useStageData } from "../groupStage/GroupStage";
import { useTournament } from "../hooks";
import { useStages } from "../../stage/hooks";
import DivisionPanel from "../../dashboard/DivisionPanel";
import { useContext } from "react";
import { DivisionContext } from "../../..";

function BracketPage() {
    const { data: tournament } = useTournament("current");
    const division = useContext(DivisionContext);

    const { data: stages } = useStages(tournament?.id, {
        type: "single_elimination",
        division: division?.id
    })
    const { data: stageData } = useStageData(stages?.[0]?.id);

    const bracketsRef = useBracketsViewer(stageData, "#bracket");

    return <>
        <DivisionPanel>
            {stageData ?
                <div
                    ref={bracketsRef}
                    className="brackets-viewer"
                    id="bracket"
                ></div> : <>
                    Bracket not defined yet</>}
        </DivisionPanel>
    </>
}

export default BracketPage;
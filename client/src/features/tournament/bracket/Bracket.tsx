import { C } from "@fullcalendar/core/internal-common";
import BracketStructure from "../../dashboard/BracketStructure";
import { useBracketsViewer, useStageData } from "../groupStage/GroupStage";
import { useTournament } from "../hooks";

function BracketPage() {
    const { data: tournament } = useTournament("current");
    const {data: stageData } = useStageData(tournament?.bracket?.id);

    const bracketsRef = useBracketsViewer(stageData);

    if (!stageData) return <>
        Bracket not defined yet
    </>

    return <>
        <div
            ref={bracketsRef}
            className="brackets-viewer bracket"
        ></div>
    </>
}

export default BracketPage;
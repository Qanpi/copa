import { useQuery } from "@tanstack/react-query";
import { finalRoundNames, useTournament } from "../hooks";
import GroupStageStructure from "../../dashboard/GroupStageStructure";
import axios from "axios";

//1 div into groups
//2 draw teams into groups
//3 display groups normally
import { BracketsViewer } from "ts-brackets-viewer";
import { useEffect, useRef } from "react";
import DrawPage from "../../dashboard/Draw";
import { Id } from "brackets-model";
const bracketsViewer = new BracketsViewer();

export const useStageData = (stageId: Id) => {
    const { data: tournament } = useTournament("current");

    return useQuery({
        queryKey: ["brackets", "tournament"], //FIXME:
        queryFn: async () => {
            const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${stageId}`);
            return res.data;
        },
        enabled: !!tournament
    });
}

export const useBracketsViewer = (stageData) => {
    const ref = useRef(null);

    useEffect(() => {
        if (stageData) {
            const viewerData = {
                stages: stageData.stage,
                matches: stageData.match,
                matchGames: stageData.match_game,
                participants: stageData.participant,
            }

            bracketsViewer.render(viewerData,
                {
                    // selector: ".group-stage",
                    customRoundName: finalRoundNames,
                }
            );

            const local = ref.current;

            return () => {
                local.innerHTML = ""; //clear past bracket
            }
        }

    }, [stageData]);

    return ref;
}
function GroupStagePage() {
    const {data: tournament} = useTournament("current");
    const { data: stageData } = useStageData(tournament?.groupStage.id);

    const bracketsRef = useBracketsViewer(stageData);

    if (!stageData) return <>
        Gro p stage not defined yet
    </>

    return <>
        <div
            ref={bracketsRef}
            className="brackets-viewer group-stage"
        ></div>
    </>
}

export default GroupStagePage;

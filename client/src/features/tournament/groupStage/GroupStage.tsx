import { useQuery } from "@tanstack/react-query";
import { finalRoundNames, useTournament } from "../hooks";
import GroupStageStructure from "../../dashboard/GroupStage";
import axios from "axios";
import { BracketsViewer, ViewerData } from "ts-brackets-viewer";
import { useEffect, useLayoutEffect, useRef } from "react";
import DrawPage from "../../dashboard/Draw";
import { Id } from "brackets-model";
import { DataTypes, ValueToArray } from "brackets-manager";
import { useNavigate } from "react-router";

const bracketsViewer = new BracketsViewer();

export const useStageData = (stageId: Id) => {
    const { data: tournament } = useTournament("current");

    return useQuery({
        queryKey: ["brackets", "tournament", stageId], //FIXME:
        queryFn: async () => {
            const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${stageId}`);
            return res.data;
        },
        enabled: Boolean(tournament) && Boolean(stageId)
    });
}

export const useBracketsViewer = (stageData: ValueToArray<DataTypes>, selector: string) => {
    const ref = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (stageData && ref.current) {
            const viewerData = {
                stages: stageData.stage,
                matches: stageData.match,
                matchGames: stageData.match_game,
                participants: stageData.participant,
            }

            bracketsViewer.render(viewerData,
                {
                    selector,
                    customRoundName: finalRoundNames,
                    onMatchClick: (match) =>{
                        //TODO: maybe make popover and the link
                        navigate(`/tournament/matches/${match.id}`)
                    },
                }
            );

            const local = ref.current;

            return () => {
                local.innerHTML = ""; //clear past bracket
            }
        }

    }, [stageData, ref]);

    return ref;
}
function GroupStagePage() {
    const {data: tournament} = useTournament("current");
    const { data: stageData } = useStageData(tournament?.groupStage?.id);

    const bracketsRef = useBracketsViewer(stageData, "#group-stage");

    if (!stageData) return <>
        Gro p stage not defined yet
    </>

    return <>
        <div
            ref={bracketsRef}
            className="brackets-viewer"
            id="group-stage"
        ></div>
    </>
}

export default GroupStagePage;

import { useQuery } from "@tanstack/react-query";
import { finalRoundNames, useTournament } from "../helpers";
import GroupStageStructure from "./GroupStageStructure";
import axios from "axios";

//1 div into groups
//2 draw teams into groups
//3 display groups normally
import { BracketsViewer } from "ts-brackets-viewer";
import { useEffect, useRef } from "react";
import DrawPage from "../../team/draw/Draw";
const bracketsViewer = new BracketsViewer();

const useGroupStage = () => {
    const { data: tournament } = useTournament("current");

    return useQuery({
        queryKey: ["brackets", "tournament"], //FIXME:
        queryFn: async () => {
            const stageId = tournament?.groupStage.id;
            const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${stageId}`);

            return res.data;
        },
        enabled: !!tournament
    });
}

function GroupStagePage() {
    const { data: stage } = useGroupStage();

    console.log(stage);

    const bracketsRef = useRef(null);

    useEffect(() => {
        if (stage.participant.length !== 0) {
            bracketsViewer.render(
                {
                    stages: stage.stage,
                    matches: stage.match,
                    matchGames: stage.match_game,
                    participants: stage.participant,
                },
                {
                    selector: ".group-stage",
                    customRoundName: finalRoundNames,
                }
            );
        }

        const local = bracketsRef.current;

        return () => {
            if (local) local.innerHTML = ""; //clear past bracket
        };
    }, [stage]);

    if (!stage) {
        return <GroupStageStructure></GroupStageStructure>
    } else if (stage.participant.length === 0) {
        return <DrawPage></DrawPage> 
    }

    return <>

        <div
            ref={bracketsRef}
            className="brackets-viewer group-stage"
        ></div>
    </>
}

export default GroupStagePage;
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

    const bracketsRef = useRef(null);

    useEffect(() => {
        if (stage) {
            console.log(stage)
            const stageData = {
                stages: stage.stage,
                matches: stage.match,
                matchGames: stage.match_game,
                participants: stage.participant,
            }

            bracketsViewer.render(stageData,
                {
                    selector: ".group-stage",
                    customRoundName: finalRoundNames,
                }
            );


            const local = bracketsRef.current;

            return () => {
                local.innerHTML = ""; //clear past bracket
            }
        }

    }, [stage]);

    if (!stage) return <>
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

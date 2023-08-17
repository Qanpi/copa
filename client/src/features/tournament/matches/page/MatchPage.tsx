import { useParams } from "react-router";
import { useMatch, useMatches } from "../hooks";
import { useParticipant } from "../../../participant/hooks";

function MatchPage() {
    const {id} = useParams();
    const {data: match, status} = useMatch(id);

    const {data: opp1} = useParticipant(match?.opponent1.id)
    const {data: opp2} = useParticipant(match?.opponent2.id)

    if (status === "loading") return <div>Loading...</div>

    return <>
        <div>{opp1?.name}</div>
        <div>{opp2?.name}</div>
    </>

}

export default MatchPage;
import { useContext } from "react";
import { TournamentContext } from "../../../../..";

function RegisteredPage() {
    const tournament = useContext(TournamentContext);
    console.log(tournament.teams);

    return (
        
    )
}

export default RegisteredPage;
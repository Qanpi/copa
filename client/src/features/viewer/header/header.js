import { useLocation } from "react-router-dom";
import {HashLink as Link} from "react-router-hash-link"
import "./header.css"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"
import UserPanel from "../../user/userMenu/userpanel";
import { useUser } from "../../..";

//TODO:
//move route names to a config file

//FIXME: repetitive and probably redundant way of storing headers
const sublinks = {
    "": [{
        name: "This week",
        to: "/#weekly"
    }, {
        name: "Group stage",
        to: "/#test"
    }, {
        name: "Bracket",
        to: "/#bracket"
    }],
    tables: [{
        name: "Teams",
        to: "/tables/teams",
    }, {
        name: "Matches",
        to: "/tables/matches"
    },{
        name: "Gamblers",
        to: "/tables/matches"
    }],
    admin: [
        {name: "Scheduling"},
        {name: "Settings"},
        {name: "announcements"}
    ]
}

function Header() {
    const {pathname} = useLocation();
    const parentPath = pathname.split("/")[1];

    const {status: userStatus, data: user} = useUser("me");

    if (userStatus !== "success") return <div>Loading...</div>

    const generateSublinks = (path) => {
        switch(path) {
            case "": return ["1"]
            case "tables": return ["Teams", "Matches", "Group stage", "Bracket", "Gamblers"]
            default: return []
        }
    }

    return (
        <header>
                <div className="top-bar">
                    <div className="links">
                        <Link to="/">Home</Link>
                        <Link to="/tables/teams">Tables</Link> 
                        <span>All-time</span>
                        <span>Fantasy</span>
                        <span>About</span>
                        {user ? <Link to="/admin/dashboard">Admin</Link> : null}
                    </div>
                    <UserPanel></UserPanel>
                </div>

                <div className="bottom-bar">
                    <div className="weird-triangle">
                    </div>
                    <div className="sublinks">
                        {generateSublinks(parentPath).map(p => <Link to={`${parentPath}/${p.toLowerCase()}`} key={p}>{p}</Link>)}
                    </div>
                </div>

        </header>
    )
}

export default Header;  
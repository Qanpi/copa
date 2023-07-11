import { useLocation } from "react-router-dom";
import {HashLink as Link} from "react-router-hash-link"
import "./header.css"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"
import UserPanel from "../UserPanel/userpanel";
import { useContext } from "react";
import { AuthContext } from "../..";

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
    const nest = pathname.slice(1).split("/")[0];

    const user = useContext(AuthContext);

    return (
        <header>
                <div className="top-bar">
                    <div className="links">
                        <Link to="/">Home</Link>
                        <Link to="/tables/teams">Tables</Link> 
                        <span>All-time</span>
                        <span>Fantasy</span>
                        <span>About</span>
                        {user ? <Link to="/admin">Admin</Link> : null}
                    </div>
                    <UserPanel></UserPanel>
                </div>

                <div className="bottom-bar">
                    <div className="weird-triangle">
                    </div>
                    <div className="sublinks">
                        {sublinks.hasOwnProperty(nest) ? sublinks[nest].map(link => { //FIXME: looks janky, at the very least explain with comment
                            return <Link smooth to={link.to} key={link.name}>{link.name}</Link> //FIXME: repalce hash link with simple scrolling 
                        }) : null }
                    </div>
                </div>

        </header>
    )
}

export default Header;  
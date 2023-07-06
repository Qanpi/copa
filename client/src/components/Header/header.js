import { Link } from "react-router-dom";
import "./header.css"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"
import UserPanel from "../UserPanel/userpanel";


function Header() {


    return (
        <header>
            <div className="settings-bar">
                <span>Eng</span>
                <span> | </span>
                <span> Dark </span>
            </div>
            <div className="bottom-bar">
                <div className="logo">
                </div>
                <div className="links">
                    <Link to="/">Home</Link>
                    <Link to="/tables">Tables</Link>
                    <span>All-time</span>
                    <span>Fantasy</span>
                    <span>About</span>
                </div>

                <UserPanel></UserPanel>
            </div>
        </header>
    )
}

export default Header;  
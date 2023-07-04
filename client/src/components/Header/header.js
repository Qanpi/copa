import { Link } from "react-router-dom";
import "./header.css"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"


function Header() {
    const queryClient = useQueryClient();

    const {status, data: user, error, isFetching} = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await axios.get("/me");
            return res.data;
        }
    });

    const logout = useMutation({
        mutationFn: () => {
            return axios.post("/logout");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["me"]});
        }
    });

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
                <span onClick={user ? logout.mutate : handleSignIn}>{user ? "Sign out" : "Sign in"}</span>
            </div>
        </header>
    )
}

function handleSignIn() {
    //axios.get("login/federated/google")
    window.open("http://localhost:3001/login/federated/google", "_self");
}


export default Header;  
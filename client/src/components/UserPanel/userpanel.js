import "./userpanel.css"
import axios from "axios"
import {useQueryClient, useQuery, useMutation} from "@tanstack/react-query"

function UserPanel({userData}) { 
    const queryClient = useQueryClient();

    const {status, data: user, error, isFetching} = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await axios.get("/me");
            return res.data;
        },
    });

    const logout = useMutation({
        mutationFn: () => {
            return axios.post("/logout");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["me"]});
        }
    }); 

    if (status === "loading") return <span>Loading...</span>

    return user ? (
        <div className="user-panel">
            <div className="profile">
                <img src={user.image} referrerPolicy="no-referrer" alt="user avatar"/>
                <p>{user.name}</p>
            </div>
            <div className="dropdown">
                <p>Profile</p>
                <p>My team</p>
                <p>Settings</p>
                <p onClick={logout.mutate}>Log out</p>
            </div>
        </div>
    ) : (
        <span onClick={handleSignIn}>{"Sign in"}</span>
    )
}

function handleSignIn() {
    //axios.get("login/federated/google")
    window.open("http://localhost:3001/login/federated/google", "_self");
}

export default UserPanel;
import { useQuery } from "@tanstack/react-query";
import "./Tables.css"
import axios from "axios"

function Tables() {
    const {status, error, data, isFetching } = useQuery({
        queryKey: "matches",
        queryFn: async () => {
            const res = await axios.get("/api/matches", {
                params: {
                }
            });
            console.log(res.data)
            return res.data;
        }
    })
    
    return status === "loading" ? (
        <div>Loading...</div>
    ) : (
        <div className="tables">
            {data[0].date}
        </div>
    )
}

export default Tables;
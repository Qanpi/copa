import { useQuery } from "@tanstack/react-query";
import "./Tables.css";
import axios from "axios";
import { Route, Routes } from "react-router";

function Table({ queryKey, columns }) {
  const { status, error, data, isFetching } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await axios.get("/api/" + queryKey);
      return res.data;
    },
  });

  if (status === "loading") return <p>Loading...</p>;

  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => {
            return <th key={c}>{c}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((t) => {
          return (
            <TableRow
              key={t._id}
              queryKey={queryKey}
              id={t._id}
              columns={columns}
            ></TableRow>
          );
        })}
      </tbody>
    </table>
  );
}

function TableRow({ queryKey, id, columns }) {
  const { status, error, data, isFetching } = useQuery({
    queryKey: [queryKey.slice(0, -1), id], //FIXME: relies on queryKey being in plural
    queryFn: async () => {
      const { data } = await axios.get(`/api/${queryKey}/${id}`);
      return data;
    },
  });

  if (status === "loading")
    return (
      <tr>
        <td>Loading...</td>
      </tr>
    );

  return (
    <tr>
      {columns.map((c) => {
        return <th key={c}>{data[c]}</th>;
      })}
    </tr>
  );
}

export function TeamsTable() {
  return <Table queryKey={"teams"} columns={["name"]}></Table>;
}

export function MatchesTable() {
  return (
    <>
      <Table queryKey={"teams"} columns={["name"]}></Table>
      <Table queryKey={"teams"} columns={["name"]}></Table>
    </>
  );
}

import { Typography } from "@mui/material";
import { useMatches, useUpdateMatch } from "./hooks.ts";
import { DataGrid, DataGridProps, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useDivisions, useTournament } from "../tournament/hooks.ts";
import { useParticipants } from "../participant/hooks.ts";
import { notStrictEqual } from "assert";
import { TMatch } from "@backend/models/match.ts";
import { useGroups } from "../group/hooks.ts";
import { useStages } from "../stage/hooks.ts";
import { useRounds } from "../round/hooks.ts";
import dayjs from "dayjs";
import { Launch } from "@mui/icons-material";
import { useNavigate } from "react-router";

export const MatchesTable = ({ matches, ...props }: Partial<DataGridProps> & { matches?: TMatch[] }) => {
  const { data: tournament } = useTournament("current");
  const { data: participants } = useParticipants(tournament?.id);
  // const { data: matches } = useMatches(tournament?.id);

  const { data: divisions } = useDivisions(tournament?.id);
  const { data: groups } = useGroups(tournament?.id);
  const { data: rounds } = useRounds(tournament?.id);
  const { data: stages } = useStages(tournament?.id);

  const updateMatch = useUpdateMatch();

  const navigate = useNavigate();
  const cols: GridColDef[] = [
    {
      field: "actions",
      type: "actions",
      getActions: (p) => [
        <GridActionsCellItem icon={<Launch></Launch>} label={"Browse"} onClick={() => navigate(`/tournament/matches/${p.row.id}`)}></GridActionsCellItem>,
        // <GridActionsCellItem></GridActionsCellItem>
      ]
    },
    {
      field: "start",
      headerName: "Date",
      editable: true,
      type: "date",
      valueGetter({ value }) {
        return value ? new Date(value) : undefined;
      },
    },
    {
      field: "time",
      headerName: "Time",
      valueGetter(p) {
        return p.row.start ? dayjs(p.row.start).format('HH:mm') : undefined;
      }
    },
    {
      field: "duration",
      headerName: "Duration (min)",
      type: "number",
      valueGetter(p) {
        if (!p.row?.end || !p.row?.start) return;
        return dayjs(p.row.end).diff(p.row.start, "minutes");
      }
    },
    {
      field: "opponent1",
      headerName: "Home",
      valueGetter: (p) => {
        if (p.value === null) return "BYE";

        const participant = participants?.find(part => part.id === p.value.id);
        return participant?.name || "TBD";
      }
    },
    {
      field: "opponent2",
      headerName: "Away",
      valueGetter: (p) => {
        if (p.value === null) return "BYE";

        const participant = participants?.find(part => part.id === p.value.id);
        return participant?.name || "TBD";
      }
    },
    {
      field: "group_id",
      headerName: "Group",
      valueGetter: (p) => {
        const group = groups?.find((g) => g.id === p.value)
        return group?.name;
      },
    },
    {
      field: "round_id",
      headerName: "Round",
      valueGetter: (p) => {
        const round = rounds?.find((g) => g.id === p.value)
        return round?.number;
      }
    },
    {
      field: "verboseStatus",
      headerName: "Status",
    },
    {
      field: "stage_id",
      headerName: "Stage",
      valueGetter: (p) => {
        const stage = stages?.find((g) => g.id === p.value)
        return stage?.name;
      }
    },
    {
      field: "division",
      headerName: "Division",
      valueGetter: (p) => {
        const stage = stages?.find((g) => g.id === p.row.stage_id)

        const division = divisions?.find(d => d.id === stage?.division);
        return division?.name;
      }
    }
  ];

  if (!matches) return <>LOading</>;

  const handleRowUpdate = (newRow: TMatch, og: TMatch) => {
    //auto-set end date if start was updated
    let end;
    if (newRow.start) {
      const stage = stages?.find((g) => g.id === newRow.stage_id?.toString())
      const division = divisions.find(d => d.id === stage?.division);
      const duration = division?.settings?.matchLength;

      if (!duration) throw new Error("Failed to set end date for match.")
      end = dayjs(newRow.start).add(duration, "seconds").toDate();
    }

    updateMatch.mutate({
      ...newRow,
      end
    });

    return newRow;
  }

  if (!matches) return <>Loading...</>

  //FIXME: better error handling
  return <DataGrid {...props} rows={matches} columns={cols} processRowUpdate={handleRowUpdate} onProcessRowUpdateError={(err) => console.error(err)} ></DataGrid>;
};

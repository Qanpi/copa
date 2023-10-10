import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTypes, ValueToArray } from "brackets-manager";
import { Id } from "brackets-model";
import { TMatch } from "brackets-mongo-db";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { BracketsViewer } from "ts-brackets-viewer";
import { finalRoundNames, tournamentKeys, useTournament } from "../viewer/hooks";
import { QueryKeyObject, queryKeyFactory } from "../types";

const stageKeys = {
  ...queryKeyFactory("stage"),
  detail: function (this: QueryKeyObject<any>, id: string, detail: string) {
    return [...this.id(id), detail]
  }
};

export const useStages = (
  tournamentId: string,
  query?: Partial<TMatch> & { scheduled?: boolean }
) => {
  return useQuery({
    queryKey: stageKeys.list(query),
    queryFn: async () => {
      let url = `/api/${tournamentKeys.all[0]}/${tournamentId}/stages`;

      if (query) {
        url += "?";
        for (const [k, v] of Object.entries(query)) {
          url += `${k}=${v}&`; //FIXME: appends & at the end
        }
      }

      const res = await axios.get(url);
      return res.data;
    },
    enabled: Boolean(tournamentId) && (query ? Object.values(query).every(v => v) : true)
  });
};

export const useStageData = (stageId: string) => {
  const { data: tournament } = useTournament("current");

  return useQuery({
    queryKey: stageKeys.detail(stageId, "data"),
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${stageId}`);
      return res.data;
    },
    enabled: Boolean(tournament) && Boolean(stageId)
  });
};


export const useBracketsViewer = (stageData: ValueToArray<DataTypes>, selector: string) => {
  const ref = useRef(null);

  const bracketsViewer = new BracketsViewer();
  const navigate = useNavigate();

  useEffect(() => {
    if (stageData && ref.current) {
      const viewerData = {
        stages: stageData.stage,
        matches: stageData.match,
        matchGames: stageData.match_game,
        participants: stageData.participant,
      };

      bracketsViewer.render(viewerData,
        {
          selector,
          customRoundName: finalRoundNames,
          onMatchClick: (match) => {
            //TODO: maybe make popover and the link
            navigate(`/tournament/matches/${match.id}`);
          },
        }
      );

      const local = ref.current;

      return () => {
        local.innerHTML = ""; //clear past bracket
      };
    }

  }, [stageData, ref]);

  return ref;
};

export const useStandings = (stageId: string) => {
  const { data: tournament } = useTournament("current");

  return useQuery({
    queryKey: stageKeys.detail(stageId, "standings"),
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/${tournament.id}/stages/${stageId}/standings`);
      return res.data;
    },
    enabled: Boolean(tournament) && Boolean(stageId)
  });
};

export const useCreateStage = () => {
  const { data: tournament } = useTournament("current");

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: any) => {
      const res = await axios.post(`/api/tournaments/${tournament.id}/stages`, {
        ...values,
        tournamentId: values.division,
      });

      return res.data;
    },
    onSuccess: (stage) => {
      queryClient.setQueryData(stageKeys.id(stage.id), stage);
      queryClient.setQueryData(stageKeys.lists, (previous: any[]) => {
        return previous.map(prev => prev.id === stage.id ? stage : prev);
      })
    }
  });
};


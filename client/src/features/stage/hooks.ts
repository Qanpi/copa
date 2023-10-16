import { UseMutationResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTypes, FinalStandingsItem, ValueToArray } from "brackets-manager";
import { Id, InputStage } from "brackets-model";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { BracketsViewer } from "ts-brackets-viewer";
import { finalRoundNames, tournamentKeys, useTournament } from "../viewer/hooks";
import { QueryKeyObject, queryKeyFactory } from "../types";
import { TStage } from "@backend/models/stage.ts"

const stageKeys = {
  ...queryKeyFactory("stage"),
  detail: function (this: QueryKeyObject<any>, id: string, detail: string) {
    return [...this.id(id), detail]
  }
};

export const useStages = (
  tournamentId?: string,
  query?: Partial<TStage>
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
      return res.data as TStage[];
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
      return res.data as ValueToArray<DataTypes>;
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
      return res.data as FinalStandingsItem[] | FinalStandingsItem[][];
    },
    enabled: Boolean(tournament) && Boolean(stageId)
  });
};

export const useCreateStage = () => {
  const { data: tournament } = useTournament("current");

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: Partial<InputStage>) => {
      const res = await axios.post(`/api/tournaments/${tournament.id}/stages`, variables);

      return res.data as TStage;
    },
    onSuccess: (stage) => {
      queryClient.setQueriesData({ queryKey: stageKeys.id(stage.id) }, stage);
      queryClient.setQueriesData(
        stageKeys.list({
          division: stage.tournament_id,
          type: stage.type
        })
        , (previous?: TStage[]) => {
          return [...(previous || []), stage];
        })
    }
  });
};

export const useDeleteStage = () => {
  const {data: tournament} = useTournament("current");

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stageId: string) => {
      const res = await axios.delete(`/api/tournaments/${tournament!.id}/stages/${stageId}`);

      return res.data as TStage;
    },
    onSuccess: (_, stageId) => {
      queryClient.setQueriesData({ queryKey: stageKeys.id(stageId) }, null);
      queryClient.setQueriesData(
        stageKeys.lists
        , (previous?: TStage[]) => {
          return previous?.filter(s => s.id !== stageId);
        })
    }
  });
}


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBuilds, saveBuildAPI, deleteBuildAPI } from "@/lib/api";
import type { PCComponent, ComponentType } from "@/lib/pc-data";

export function useBuilds() {
  return useQuery({
    queryKey: ["builds"],
    queryFn: fetchBuilds,
  });
}

export function useSaveBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      build: Record<ComponentType, PCComponent | null>;
      bottleneckPercentage: number;
    }) => {
      await saveBuildAPI({
        name: params.name,
        cpuId: params.build.cpu?.id ?? null,
        gpuId: params.build.gpu?.id ?? null,
        ramId: params.build.ram?.id ?? null,
        motherboardId: params.build.motherboard?.id ?? null,
        bottleneckPercentage: params.bottleneckPercentage,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["builds"] }),
  });
}

export function useDeleteBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBuildAPI(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["builds"] }),
  });
}

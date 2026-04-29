import { useQuery } from "@tanstack/react-query";
import { fetchCompatibleComponents } from "@/lib/api";

/**
 * When a CPU is selected, fetches only motherboards and RAM
 * that are compatible (matching socket + memory type).
 */
export function useCompatibleComponents(cpuId: string | null | undefined) {
  return useQuery({
    queryKey: ["compatible-components", cpuId],
    queryFn: () => fetchCompatibleComponents(cpuId!),
    enabled: !!cpuId,
  });
}


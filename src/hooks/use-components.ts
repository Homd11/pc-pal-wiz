import { useQuery } from "@tanstack/react-query";
import { fetchComponents } from "@/lib/api";

export function useComponents() {
  return useQuery({
    queryKey: ["components"],
    queryFn: fetchComponents,
  });
}

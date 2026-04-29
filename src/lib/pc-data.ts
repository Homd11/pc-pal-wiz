export type ComponentType = "cpu" | "gpu" | "ram" | "motherboard";

export interface PCComponent {
  id: string;
  name: string;
  type: ComponentType;
  performanceScore: number;
  price: number;
  imageUrl?: string;
  // CPU-specific
  socket?: string | null;
  memoryType?: string | null;
  // Motherboard-specific
  chipset?: string | null;
  formFactor?: string | null;
  maxMemory?: number | null;
  // RAM-specific
  speed?: number | null;
  capacity?: string | null;
  modules?: string | null;
  latency?: string | null;
}

export interface PCBuild {
  id: string;
  name: string;
  cpu: PCComponent | null;
  gpu: PCComponent | null;
  ram: PCComponent | null;
  motherboard: PCComponent | null;
  bottleneckPercentage: number;
  createdAt: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  warnings: string[];
}

export interface BottleneckAnalysis {
  percentage: number;
  bottleneckComponent: string;
  message: string;
  alternatives: PCComponent[];
  compatibility: CompatibilityResult;
}

const API_BASE = "https://pc-builder-backend-olive-phi.vercel.app/api";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function calculateBottleneckFromAPI(build: {
  cpu: PCComponent | null;
  gpu: PCComponent | null;
  ram: PCComponent | null;
  motherboard: PCComponent | null;
}): Promise<BottleneckAnalysis> {
  const cpuId = build.cpu?.id;
  const gpuId = build.gpu?.id;
  const ramId = build.ram?.id;
  const motherboardId = build.motherboard?.id;

  const body = cpuId && gpuId
    ? { cpuId, gpuId, ramId: ramId ?? undefined, motherboardId: motherboardId ?? undefined }
    : { cpuScore: build.cpu?.performanceScore ?? 0, gpuScore: build.gpu?.performanceScore ?? 0 };

  const response = await fetch(`${API_BASE}/calculate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to calculate bottleneck");
  }

  const data = await response.json();

  const alternatives: PCComponent[] = (data.alternatives ?? []).map(
    (alt: { name?: string; price?: string | number; benchmark?: number; matchScore?: number }, i: number) => ({
      id: `alt-${i}`,
      name: alt.name ?? "Unknown",
      type: (data.culprit ?? "cpu").toLowerCase() as ComponentType,
      performanceScore: alt.benchmark ?? alt.matchScore ?? 0,
      price: typeof alt.price === "string"
        ? parseFloat(alt.price.replace(/[^0-9.]/g, "")) || 0
        : alt.price ?? 0,
    })
  );

  return {
    percentage: data.bottleneckPercent ?? 0,
    bottleneckComponent: data.culprit ?? "",
    message: data.message ?? "",
    alternatives,
    compatibility: data.compatibility ?? { compatible: true, warnings: [] },
  };
}

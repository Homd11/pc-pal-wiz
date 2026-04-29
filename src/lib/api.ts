import type { ComponentType, PCComponent, PCBuild } from "./pc-data";

const API_BASE = "https://pc-builder-backend-olive-phi.vercel.app/api";

// ─── Auth helpers ─────────────────────────────────────────
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

// ─── Auth API ─────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  token: string;
  refreshToken: string;
  message?: string;
  error?: string;
  errors?: string[];
}

export async function signupAPI(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.errors?.[0] || "Signup failed");
  }
  return json;
}

export async function loginAPI(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || json.errors?.[0] || "Login failed");
  }
  return json;
}

export async function logoutAPI(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
    });
  } catch {
    // Ignore — we clear local state anyway
  }
}

export async function getMeAPI(): Promise<{ success: boolean; user: AuthUser }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

export async function refreshTokenAPI(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    throw new Error("Token refresh failed");
  }
  const json = await res.json();
  return { token: json.token, refreshToken: json.refreshToken };
}

// ─── Components ───────────────────────────────────────────

/** Normalise a single raw component from the backend into a PCComponent */
function normaliseComponent(raw: Record<string, unknown>): PCComponent {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? "Unknown"),
    type: (String(raw.type ?? "cpu").toLowerCase()) as ComponentType,
    performanceScore: Number(raw.performanceScore ?? raw.benchmark ?? 0),
    price: typeof raw.price === "string"
      ? parseFloat((raw.price as string).replace(/[^0-9.]/g, "")) || 0
      : Number(raw.price ?? 0),
    imageUrl: (raw.imageUrl as string) ?? undefined,
    socket: (raw.socket as string) ?? undefined,
    memoryType: (raw.memoryType as string) ?? (raw.memory_type as string) ?? undefined,
    chipset: (raw.chipset as string) ?? undefined,
    formFactor: (raw.formFactor as string) ?? (raw.form_factor as string) ?? undefined,
    maxMemory: raw.maxMemory != null ? Number(raw.maxMemory) : raw.max_memory != null ? Number(raw.max_memory) : undefined,
    speed: raw.speed != null ? Number(raw.speed) : undefined,
    capacity: raw.capacity != null ? String(raw.capacity) : undefined,
    modules: raw.modules != null ? String(raw.modules) : undefined,
    latency: raw.latency != null ? String(raw.latency) : undefined,
  };
}

export async function fetchComponents(): Promise<Record<ComponentType, PCComponent[]>> {
  const res = await fetch(`${API_BASE}/components`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch components");
  const json = await res.json();
  const raw = json.data ?? {};
  // Backend may use lowercase keys (cpu, gpu, ram, motherboard)
  const result: Record<ComponentType, PCComponent[]> = {
    cpu: (raw.cpu ?? raw.CPU ?? []).map(normaliseComponent),
    gpu: (raw.gpu ?? raw.GPU ?? []).map(normaliseComponent),
    ram: (raw.ram ?? raw.RAM ?? []).map(normaliseComponent),
    motherboard: (raw.motherboard ?? raw.Motherboard ?? []).map(normaliseComponent),
  };
  return result;
}

/** Fetch only motherboards + RAM compatible with the selected CPU */
export async function fetchCompatibleComponents(
  cpuId: string
): Promise<{ cpu: PCComponent; compatibleMotherboards: PCComponent[]; compatibleRam: PCComponent[] }> {
  const res = await fetch(`${API_BASE}/components/compatible?cpuId=${encodeURIComponent(cpuId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch compatible components");
  const json = await res.json();
  const data = json.data ?? json;
  return {
    cpu: normaliseComponent(data.cpu ?? {}),
    compatibleMotherboards: (data.compatibleMotherboards ?? []).map(normaliseComponent),
    compatibleRam: (data.compatibleRam ?? []).map(normaliseComponent),
  };
}

// ─── Builds ───────────────────────────────────────────────
function normaliseBuild(raw: Record<string, unknown>): PCBuild {
  const norm = (v: unknown) => (v && typeof v === "object" ? normaliseComponent(v as Record<string, unknown>) : null);
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? raw.build_name ?? ""),
    cpu: norm(raw.cpu),
    gpu: norm(raw.gpu),
    ram: norm(raw.ram),
    motherboard: norm(raw.motherboard),
    bottleneckPercentage: Number(raw.bottleneckPercentage ?? raw.bottleneck_percentage ?? 0),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
  };
}

export async function fetchBuilds(): Promise<PCBuild[]> {
  const token = getToken();
  if (!token) return []; // Not logged in — no builds to show
  const res = await fetch(`${API_BASE}/builds`, { headers: authHeaders() });
  if (!res.ok) {
    if (res.status === 401) return []; // Not authenticated
    throw new Error("Failed to fetch builds");
  }
  const json = await res.json();
  return (json.data ?? []).map((b: Record<string, unknown>) => normaliseBuild(b));
}

export async function saveBuildAPI(params: {
  name: string;
  cpuId: string | null;
  gpuId: string | null;
  ramId: string | null;
  motherboardId: string | null;
  bottleneckPercentage: number;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/builds`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please log in to save builds");
    const err = await res.json().catch(() => ({ error: "Save failed" }));
    throw new Error(err.error ?? "Failed to save build");
  }
}

export async function deleteBuildAPI(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/builds/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Please log in to delete builds");
    const err = await res.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(err.error ?? "Failed to delete build");
  }
}

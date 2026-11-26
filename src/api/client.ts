// Resilient API Base URL: handles both root url (e.g. https://api.railway.app) and subpath (/api/v1)
const rawBase = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const API_BASE = rawBase.endsWith("/api/v1") ? rawBase : `${rawBase}/api/v1`;

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("vb_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 12-second resilient network timeout
  const signal = options.signal || (AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined);

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    signal,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ access_token: string; refresh_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (payload: { email: string; password: string; full_name: string; phone_number?: string }) =>
    apiRequest<{ access_token: string; refresh_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMe: () => apiRequest<any>("/auth/me"),
};

// Projects API
export const projectsApi = {
  list: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return apiRequest<any[]>(`/projects?${params.toString()}`);
  },
  create: (data: { name: string; domain: string; preferred_structure?: string; accent_color?: string }) =>
    apiRequest<any>("/projects", { method: "POST", body: JSON.stringify(data) }),
  get: (id: string) => apiRequest<any>(`/projects/${id}`),
  update: (id: string, data: any) =>
    apiRequest<any>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  duplicate: (id: string) =>
    apiRequest<any>(`/projects/${id}/duplicate`, { method: "POST" }),
  delete: (id: string) =>
    apiRequest<any>(`/projects/${id}`, { method: "DELETE" }),
};

// Validation & Pre-screening API
export const validationApi = {
  prescreenName: (name: string, legal_structure: string) =>
    apiRequest<any>("/validation/name-prescreen", {
      method: "POST",
      body: JSON.stringify({ name, legal_structure }),
    }),
  recommendStructure: (data: any) =>
    apiRequest<any>("/validation/structure-recommendation", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  runProjectValidation: (projectId: string) =>
    apiRequest<any>(`/validation/project/${projectId}/run`, { method: "POST" }),
};

// Questionnaires API
export const questionnairesApi = {
  getSchema: () => apiRequest<any>("/questionnaires/schema"),
  getProjectAnswers: (projectId: string) =>
    apiRequest<any>(`/questionnaires/projects/${projectId}`),
  saveAnswers: (projectId: string, step_id: string, answers: any) =>
    apiRequest<any>(`/questionnaires/projects/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ step_id, answers }),
    }),
};

// Regulations & Domains API
export const regulationsApi = {
  getSources: () => apiRequest<any[]>("/regulations/sources"),
  getRules: (params?: { category?: string; structure?: string; domain?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiRequest<any[]>(`/regulations/rules?${q}`);
  },
  getDomains: () => apiRequest<any[]>("/regulations/domains"),
};

// Compliance & Tasks API
export const complianceApi = {
  assess: (projectId: string) =>
    apiRequest<any>(`/compliance/projects/${projectId}/assess`, { method: "POST" }),
  getAssessment: (projectId: string) =>
    apiRequest<any>(`/compliance/projects/${projectId}/assessment`),
  getTasks: (projectId: string) =>
    apiRequest<any[]>(`/compliance/projects/${projectId}/tasks`),
  createTask: (projectId: string, task: any) =>
    apiRequest<any>(`/compliance/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(task),
    }),
  updateTask: (taskId: string, update: any) =>
    apiRequest<any>(`/compliance/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(update),
    }),
  getRoles: (projectId: string) =>
    apiRequest<any[]>(`/compliance/projects/${projectId}/roles`),
};

// Documents API
export const documentsApi = {
  list: (projectId: string) =>
    apiRequest<any[]>(`/documents/projects/${projectId}`),
  generate: (projectId: string, document_type: string, file_format: "pdf" | "docx" = "pdf") =>
    apiRequest<any>(`/documents/projects/${projectId}/generate`, {
      method: "POST",
      body: JSON.stringify({ document_type, file_format }),
    }),
  getDownloadUrl: (docId: string) => {
    const token = localStorage.getItem("vb_token");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${API_BASE}/documents/download/${docId}${query}`;
  },
  downloadFile: async (docId: string, filename: string) => {
    const token = localStorage.getItem("vb_token");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/documents/download/${docId}${query}`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Download failed" }));
      throw new Error(err.detail || `Download failed with status ${res.status}`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  },
};

// Admin API
export const adminApi = {
  getStats: () => apiRequest<any>("/admin/stats"),
  getUsers: () => apiRequest<any[]>("/admin/users"),
  getAuditLogs: (limit = 50) => apiRequest<any[]>(`/admin/audit-logs?limit=${limit}`),
  transitionRule: (ruleId: string, action: string, comments?: string) =>
    apiRequest<any>(`/admin/rules/${ruleId}/transition`, {
      method: "POST",
      body: JSON.stringify({ action, comments }),
    }),
  getHealth: () => apiRequest<any>("/admin/health"),
};

// Consultations API
export interface ConsultationItem {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone_number: string;
  company_name?: string;
  pillar: "CS" | "CA" | "LAW" | "GENERAL";
  topic: string;
  preferred_date?: string;
  preferred_time_slot?: string;
  status: "Requested" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  assigned_expert?: string;
  expert_role?: string;
  notes?: string;
  meeting_link?: string;
  meeting_platform?: string;
  resolution_summary?: string;
  created_at: string;
  updated_at: string;
}

export const consultationsApi = {
  create: (data: {
    full_name?: string;
    email?: string;
    phone_number: string;
    company_name?: string;
    pillar?: "CS" | "CA" | "LAW" | "GENERAL";
    topic: string;
    preferred_date?: string;
    preferred_time_slot?: string;
    notes?: string;
  }) => apiRequest<ConsultationItem>("/consultations", { method: "POST", body: JSON.stringify(data) }),
  list: () => apiRequest<ConsultationItem[]>("/consultations"),
  get: (id: string) => apiRequest<ConsultationItem>(`/consultations/${id}`),
  cancel: (id: string) => apiRequest<ConsultationItem>(`/consultations/${id}/cancel`, { method: "PATCH" }),
};

// Complaints & Grievances API
export interface ComplaintItem {
  id: string;
  user_id?: string;
  company_name: string;
  email?: string;
  phone_number?: string;
  pillar: "CS" | "CA" | "LAW" | "GENERAL";
  category: string;
  priority: "Low" | "Standard" | "High" | "Critical";
  status: "Registered" | "In Review by Expert" | "Action In Progress" | "Resolved";
  assigned_expert: string;
  expert_role?: string;
  description: string;
  resolution_note?: string;
  created_at: string;
  updated_at: string;
}

export const complaintsApi = {
  create: (data: {
    company_name?: string;
    email?: string;
    phone_number?: string;
    pillar?: "CS" | "CA" | "LAW" | "GENERAL";
    category: string;
    priority?: "Low" | "Standard" | "High" | "Critical";
    description: string;
  }) => apiRequest<ComplaintItem>("/complaints", { method: "POST", body: JSON.stringify(data) }),
  list: () => apiRequest<ComplaintItem[]>("/complaints"),
  get: (id: string) => apiRequest<ComplaintItem>(`/complaints/${id}`),
};

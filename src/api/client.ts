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
export interface ProjectItem {
  id: string;
  name: string;
  domain: string;
  preferred_structure?: string;
  status: string;
  completion_percentage: number;
  current_step?: string;
  accent_color?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  business_profile?: {
    business_description?: string;
    products_and_services?: string;
    target_audience?: string;
    business_stage?: string;
    business_model?: string;
    state?: string;
    city?: string;
    country?: string;
    proposed_authorized_capital?: number;
    proposed_paid_up_capital?: number;
  };
  founders?: {
    full_name: string;
    email?: string;
    phone?: string;
    proposed_shareholding_percentage?: number;
    is_director?: boolean;
    executive_role?: string;
    din_number?: string;
    pan_number?: string;
  }[];
  directors?: any[];
  user_id?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  documents_count?: number;
  generated_documents?: {
    id: string;
    title: string;
    document_type: string;
    file_format: string;
    status: string;
    generated_at?: string;
  }[];
}

export const projectsApi = {
  list: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return apiRequest<ProjectItem[]>(`/projects?${params.toString()}`);
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
export interface ClientServiceDossier {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  joined_at: string;
  active_pillars: ("CS" | "CA" | "LAW" | "GENERAL")[];
  primary_company_name?: string;
  company_names: string[];
  preferred_structures: string[];
  projects_count: number;
  projects: {
    id: string;
    name: string;
    domain: string;
    structure?: string;
    completion_percentage: number;
    status: string;
    created_at: string;
  }[];
  has_generated_documents: boolean;
  generated_documents_count: number;
  generated_documents: {
    id: string;
    title: string;
    document_type: string;
    file_format: string;
    project_id: string;
    status: string;
    generated_at: string;
  }[];
  ca_inquiries_count: number;
  ca_consultations: {
    id: string;
    topic: string;
    status: string;
    preferred_time_slot?: string;
    preferred_date?: string;
    assigned_expert?: string;
    created_at: string;
  }[];
  law_inquiries_count: number;
  law_consultations: {
    id: string;
    topic: string;
    status: string;
    preferred_time_slot?: string;
    preferred_date?: string;
    assigned_expert?: string;
    created_at: string;
  }[];
  activity_timeline: {
    id: string;
    action: string;
    entity_type?: string;
    details?: any;
    timestamp: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "info" | "success" | "warning" | "danger" | "admin_alert" | string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface PlatformSettings {
  platform_name: string;
  tagline: string;
  support_phone: string;
  support_email: string;
  support_hours: string;
  office_address: string;
  announcement_banner: string;
  consultation_turnaround: string;
}

export interface UserActivityItem {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  is_online: boolean;
  activity_state: "online" | "recently_active" | "inactive";
  last_login_at?: string;
  last_active_at?: string;
  created_at: string;
  projects_count: number;
  consultations_count: number;
}

export interface UserActivityOverview {
  total_users: number;
  online_count: number;
  recently_active_count: number;
  inactive_count: number;
  users: UserActivityItem[];
}

export interface ClientEnquiryItem {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone_number: string;
  company_name?: string;
  service_pillar: "CS" | "CA" | "LAW" | "GENERAL" | string;
  topic: string;
  message?: string;
  source: string;
  status: "New" | "Contacted" | "Converted" | "Closed" | string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const platformApi = {
  getSettings: () => apiRequest<PlatformSettings>("/platform-settings"),
};

export const enquiriesApi = {
  create: (data: {
    full_name: string;
    email: string;
    phone_number: string;
    company_name?: string;
    service_pillar?: string;
    topic: string;
    message?: string;
    source?: string;
  }) => apiRequest<ClientEnquiryItem>("/enquiries", { method: "POST", body: JSON.stringify(data) }),
};

export const adminApi = {
  getStats: () => apiRequest<any>("/admin/stats"),
  getUsers: () => apiRequest<any[]>("/admin/users"),
  getPlatformSettings: () => apiRequest<PlatformSettings>("/admin/platform-settings"),
  updatePlatformSettings: (payload: PlatformSettings) =>
    apiRequest<PlatformSettings>("/admin/platform-settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getUserActivity: (params?: { search?: string; filter_status?: string }) => {
    const p = new URLSearchParams();
    if (params?.search) p.append("search", params.search);
    if (params?.filter_status) p.append("filter_status", params.filter_status);
    return apiRequest<UserActivityOverview>(`/admin/user-activity?${p.toString()}`);
  },
  getEnquiries: (params?: { pillar?: string; status_filter?: string }) => {
    const p = new URLSearchParams();
    if (params?.pillar) p.append("pillar", params.pillar);
    if (params?.status_filter) p.append("status_filter", params.status_filter);
    return apiRequest<ClientEnquiryItem[]>(`/admin/enquiries?${p.toString()}`);
  },
  updateEnquiryStatus: (id: string, payload: { status?: string; admin_notes?: string }) =>
    apiRequest<ClientEnquiryItem>(`/admin/enquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getServiceTracker: (params?: { search?: string; service_filter?: string }) => {
    const p = new URLSearchParams();
    if (params?.search) p.append("search", params.search);
    if (params?.service_filter) p.append("service_filter", params.service_filter);
    return apiRequest<ClientServiceDossier[]>(`/admin/service-tracker?${p.toString()}`);
  },
  getAuditLogs: (limit = 50) => apiRequest<any[]>(`/admin/audit-logs?limit=${limit}`),
  transitionRule: (ruleId: string, action: string, comments?: string) =>
    apiRequest<any>(`/admin/rules/${ruleId}/transition`, {
      method: "POST",
      body: JSON.stringify({ action, comments }),
    }),
  getHealth: () => apiRequest<any>("/admin/health"),
};

export const notificationsApi = {
  list: (limit = 25) => apiRequest<NotificationItem[]>(`/notifications?limit=${limit}`),
  markAsRead: (id: string) => apiRequest<any>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiRequest<any>("/notifications/read-all", { method: "PATCH" }),
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
  status: "Requested" | "Scheduled" | "In Progress" | "Consulted" | "Not Accepted" | "Completed" | "Cancelled" | string;
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
  updateStatus: (id: string, data: {
    status?: string;
    assigned_expert?: string;
    expert_role?: string;
    notes?: string;
    resolution_summary?: string;
  }) => apiRequest<ConsultationItem>(`/consultations/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
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

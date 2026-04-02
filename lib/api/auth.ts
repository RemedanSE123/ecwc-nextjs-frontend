import { apiUrl } from "@/lib/api-client";
import { getAuthHeaders } from "@/lib/auth";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile_image?: string | null;
    roles?: string[];
    permissions?: string[];
  };
}

export async function loginAuth(identifier: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(apiUrl("/api/v1/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status >= 500) throw new Error("Server error during login. Please try again.");
      const detail = body?.detail;
      const detailMessage = typeof detail === "string" ? detail : detail?.message;
      const detailCode = typeof detail === "object" ? detail?.code : undefined;
      if (res.status === 401) {
        if (detailCode === "USER_NOT_FOUND") throw new Error("This phone/email is not registered.");
        if (detailCode === "WRONG_PASSWORD") throw new Error("Incorrect password.");
        throw new Error(detailMessage || "Invalid phone or password.");
      }
      if (res.status === 403) throw new Error(detailMessage || "Account is not active yet. Please wait for admin approval.");
      throw new Error(detailMessage || "Login failed");
    }
    return body as LoginResponse;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot reach backend API. Check backend server, API URL, and CORS.");
    }
    throw err;
  }
}

export async function registerAuth(payload: {
  full_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  employee_id?: string;
  department_id?: string;
  position_id?: string;
  work_location_id?: string;
  site_location?: string;
  supervisor_name?: string;
  job_title?: string;
  password: string;
  agreed_to_terms: boolean;
}): Promise<{ message: string }> {
  try {
    const res = await fetch(apiUrl("/api/v1/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.detail || "Registration failed");
    return body as { message: string };
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot reach backend API. Check backend server, API URL, and CORS.");
    }
    throw err;
  }
}

export async function uploadUserImage(file: File): Promise<{ path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(apiUrl("/api/v1/auth/upload-user-image"), {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to upload user image");
  return body as { path: string };
}

export function getUserImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/uploads/")) return apiUrl(trimmed);
  if (trimmed.startsWith("uploads/")) return apiUrl(`/${trimmed}`);
  if (trimmed.startsWith("/")) return apiUrl(trimmed);
  return null;
}

export async function fetchDepartments(workLocationId?: string): Promise<Array<{ id: string; name: string; work_location_id?: string | null }>> {
  const params = new URLSearchParams();
  if (workLocationId) params.set("work_location_id", workLocationId);
  const q = params.toString();
  const res = await fetch(apiUrl(`/api/v1/hr/departments${q ? `?${q}` : ""}`));
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function fetchPositions(departmentId?: string): Promise<Array<{ id: string; title: string; department_id: string; department_name: string }>> {
  const params = new URLSearchParams();
  if (departmentId) params.set("department_id", departmentId);
  const q = params.toString();
  const res = await fetch(apiUrl(`/api/v1/hr/positions${q ? `?${q}` : ""}`));
  if (!res.ok) throw new Error("Failed to fetch positions");
  return res.json();
}

export async function fetchWorkLocations(): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(apiUrl("/api/v1/hr/work-locations"));
  if (!res.ok) throw new Error("Failed to fetch work locations");
  return res.json();
}

export async function fetchProjectsForLocation(): Promise<Array<{ id: string; project_name: string; status: string }>> {
  const res = await fetch(apiUrl("/api/v1/projects"));
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchSupervisors(
  departmentId?: string,
  workLocationId?: string
): Promise<Array<{ id: string; full_name: string; department_id?: string | null; work_location_id?: string | null; job_title?: string | null }>> {
  const params = new URLSearchParams();
  if (departmentId) params.set("department_id", departmentId);
  if (workLocationId) params.set("work_location_id", workLocationId);
  const q = params.toString();
  const res = await fetch(apiUrl(`/api/v1/hr/supervisors${q ? `?${q}` : ""}`));
  if (!res.ok) throw new Error("Failed to fetch supervisors");
  return res.json();
}

export async function forgotPassword(identifier: string): Promise<{ ok: boolean; message: string; reset_url?: string | null }> {
  const res = await fetch(apiUrl("/api/v1/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to request password reset");
  return body;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(apiUrl("/api/v1/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to reset password");
  return body;
}

export interface ManagedEmployee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_image?: string | null;
  employee_id?: string | null;
  job_title?: string | null;
  is_active: boolean;
  created_at: string;
  department_id?: string | null;
  department_name?: string | null;
  position_id?: string | null;
  position_title?: string | null;
  work_location_id?: string | null;
  work_location_name?: string | null;
  supervisor_id?: string | null;
  supervisor_name?: string | null;
}

export async function fetchManagedEmployees(filters?: {
  q?: string;
  department_id?: string;
  work_location_id?: string;
  position_id?: string;
  supervisor_id?: string;
  is_active?: "all" | "true" | "false";
}): Promise<ManagedEmployee[]> {
  const params = new URLSearchParams();
  if (filters?.q) params.set("q", filters.q);
  if (filters?.department_id) params.set("department_id", filters.department_id);
  if (filters?.work_location_id) params.set("work_location_id", filters.work_location_id);
  if (filters?.position_id) params.set("position_id", filters.position_id);
  if (filters?.supervisor_id) params.set("supervisor_id", filters.supervisor_id);
  if (filters?.is_active && filters.is_active !== "all") params.set("is_active", filters.is_active);
  const q = params.toString();

  const res = await fetch(apiUrl(`/api/v1/hr/employees${q ? `?${q}` : ""}`), {
    headers: { ...getAuthHeaders() },
  });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(body?.detail || "Failed to fetch employees");
  return body as ManagedEmployee[];
}

export async function approveEmployee(employeeId: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl("/api/v1/auth/admin/approve"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ employee_id: employeeId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to approve employee");
  return body as { ok: boolean; message: string };
}

export type EmployeeCrudPayload = {
  full_name: string;
  email: string;
  phone: string;
  employee_id?: string;
  profile_image?: string;
  department_id?: string;
  position_id?: string;
  work_location_id?: string;
  site_location?: string;
  supervisor_id?: string;
  job_title?: string;
  is_active?: boolean;
  password?: string;
};

export async function createEmployee(payload: EmployeeCrudPayload): Promise<{ ok: boolean; id: string; message: string }> {
  const res = await fetch(apiUrl("/api/v1/hr/employees"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to create employee");
  return body as { ok: boolean; id: string; message: string };
}

export async function updateEmployee(employeeId: string, payload: EmployeeCrudPayload): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl(`/api/v1/hr/employees/${employeeId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to update employee");
  return body as { ok: boolean; message: string };
}

export async function deleteEmployee(employeeId: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl(`/api/v1/hr/employees/${employeeId}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to delete employee");
  return body as { ok: boolean; message: string };
}

export async function createWorkLocation(name: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl("/api/v1/hr/work-locations"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to create work location");
  return body;
}

export async function updateWorkLocation(id: string, name: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/hr/work-locations/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to update work location");
  return body;
}

export async function deleteWorkLocation(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/hr/work-locations/${id}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to delete work location");
  return body;
}

export async function createDepartment(name: string, work_location_id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl("/api/v1/hr/departments"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, work_location_id }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to create department");
  return body;
}

export async function updateDepartment(id: string, name: string, work_location_id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/hr/departments/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, work_location_id }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to update department");
  return body;
}

export async function deleteDepartment(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/hr/departments/${id}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to delete department");
  return body;
}

export async function createPosition(title: string, department_id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl("/api/v1/hr/positions"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ title, department_id }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to create job title");
  return body;
}

export async function updatePosition(id: string, title: string, department_id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/hr/positions/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ title, department_id }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to update job title");
  return body;
}

export async function deletePosition(id: string): Promise<{ ok: boolean }> {
  const res = await fetch(apiUrl(`/api/v1/hr/positions/${id}`), {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to delete job title");
  return body;
}

export interface MyProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id?: string | null;
  profile_image?: string | null;
  job_title?: string | null;
  is_active: boolean;
  department_name?: string | null;
  position_title?: string | null;
  work_location_name?: string | null;
  supervisor_name?: string | null;
}

export async function fetchMyProfile(): Promise<MyProfile> {
  const res = await fetch(apiUrl("/api/v1/auth/me"), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to fetch profile");
  return body as MyProfile;
}

export async function updateMyProfile(payload: {
  full_name: string;
  email: string;
  phone: string;
  profile_image?: string | null;
}): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl("/api/v1/auth/me"), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to update profile");
  return body as { ok: boolean; message: string };
}

export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl("/api/v1/auth/change-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to change password");
  return body as { ok: boolean; message: string };
}

export interface AuthzSnapshot {
  employee_id?: string;
  roles: string[];
  permissions: string[];
  denied_permissions: string[];
  scopes: Array<Record<string, unknown>>;
}

export async function fetchMyAuthorization(): Promise<AuthzSnapshot> {
  const res = await fetch(apiUrl("/api/v1/authz/me"), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to load authorization");
  return body as AuthzSnapshot;
}

export async function checkPermission(permission: string): Promise<boolean> {
  const res = await fetch(apiUrl("/api/v1/authz/check"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ permission }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.detail || "Failed to check permission");
  return Boolean(body?.allowed);
}

export async function fetchAuthzRoles(): Promise<Array<{ id: string; name: string; description?: string | null }>> {
  const res = await fetch(apiUrl("/api/v1/authz/roles"), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to load roles");
  return body as Array<{ id: string; name: string; description?: string | null }>;
}

export async function fetchAuthzPermissions(): Promise<Array<{ id: string; code: string; description?: string | null }>> {
  const res = await fetch(apiUrl("/api/v1/authz/permissions"), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to load permissions");
  return body as Array<{ id: string; code: string; description?: string | null }>;
}

export async function fetchAuthzMatrix(): Promise<{
  roles: Array<{ id: string; name: string }>;
  permissions: Array<{ id: string; code: string }>;
  grants: Array<{ role_id: string; permission_id: string }>;
}> {
  const res = await fetch(apiUrl("/api/v1/authz/matrix"), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to load matrix");
  return body as {
    roles: Array<{ id: string; name: string }>;
    permissions: Array<{ id: string; code: string }>;
    grants: Array<{ role_id: string; permission_id: string }>;
  };
}

export async function setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/authz/roles/${roleId}/permissions`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ permission_ids: permissionIds }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to save role permissions");
}

export async function fetchUserRoles(employeeId: string): Promise<Array<{ role_id: string; name: string }>> {
  const res = await fetch(apiUrl(`/api/v1/authz/users/${employeeId}/roles`), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to load user roles");
  return body as Array<{ role_id: string; name: string }>;
}

export async function setUserRoles(employeeId: string, roleIds: string[]): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/authz/users/${employeeId}/roles`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ role_ids: roleIds }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to save user roles");
}

export async function fetchUserOverrides(employeeId: string): Promise<Array<{ permission_id: string; code: string; effect: "allow" | "deny" }>> {
  const res = await fetch(apiUrl(`/api/v1/authz/users/${employeeId}/overrides`), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to load user overrides");
  return body as Array<{ permission_id: string; code: string; effect: "allow" | "deny" }>;
}

export async function setUserOverrides(
  employeeId: string,
  overrides: Array<{ permission_id: string; effect: "allow" | "deny" }>
): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/authz/users/${employeeId}/overrides`), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ overrides }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to save user overrides");
}

export async function fetchScopePolicies(): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(apiUrl("/api/v1/authz/policies"), { headers: { ...getAuthHeaders() } });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to load scope policies");
  return body as Array<Record<string, unknown>>;
}

export async function replaceScopePolicies(policies: Array<Record<string, unknown>>): Promise<void> {
  const res = await fetch(apiUrl("/api/v1/authz/policies"), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ policies }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.detail || "Failed to save scope policies");
}

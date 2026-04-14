import { apiUrl } from "@/lib/api-client";
import { getAuthHeaders } from "@/lib/auth";

async function handleApiError(res: Response, fallback: string): Promise<never> {
  let detail = fallback;
  try {
    const body = await res.json();
    if (body.detail) detail = `${fallback}: ${body.detail}`;
    else if (body.error) detail = `${fallback}: ${body.error}`;
  } catch {
    detail = `${fallback} (${res.status} ${res.statusText})`;
  }
  throw new Error(detail);
}

export async function uploadAgreementPdf(file: File): Promise<{ key: string; name: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(apiUrl("/api/v1/rental-agreements/upload-pdf"), {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!res.ok) return handleApiError(res, "Failed to upload agreement PDF");
  return res.json();
}

export async function createRentalAgreement(payload: Record<string, unknown>) {
  const res = await fetch(apiUrl("/api/v1/rental-agreements"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, "Failed to create rental agreement");
  return res.json();
}

export async function listRentalAgreements() {
  const res = await fetch(apiUrl("/api/v1/rental-agreements"), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch rental agreements");
  return res.json();
}

export async function getRentalAgreement(id: string) {
  const res = await fetch(apiUrl(`/api/v1/rental-agreements/${encodeURIComponent(id)}`), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch rental agreement");
  return res.json();
}

export async function deleteRentalAgreement(id: string) {
  const res = await fetch(apiUrl(`/api/v1/rental-agreements/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) return handleApiError(res, "Failed to delete rental agreement");
  return res.json();
}

export async function updateRentalAgreement(id: string, payload: Record<string, unknown>) {
  const res = await fetch(apiUrl(`/api/v1/rental-agreements/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, "Failed to update rental agreement");
  return res.json();
}

export async function createDailyStatusChangeRequest(payload: Record<string, unknown>) {
  const res = await fetch(apiUrl("/api/v1/daily-status-changes"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, "Failed to submit status change request");
  return res.json();
}

export async function listDailyStatusChangeRequests(approvalStatus?: string) {
  const q = approvalStatus ? `?approval_status=${encodeURIComponent(approvalStatus)}` : "";
  const res = await fetch(apiUrl(`/api/v1/daily-status-changes${q}`), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch status requests");
  return res.json();
}

export async function approveDailyStatusChangeRequest(id: string, approvalNote?: string) {
  const res = await fetch(apiUrl(`/api/v1/daily-status-changes/${encodeURIComponent(id)}/approve`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ approval_note: approvalNote ?? "" }),
  });
  if (!res.ok) return handleApiError(res, "Failed to approve request");
  return res.json();
}

export async function rejectDailyStatusChangeRequest(id: string, approvalNote?: string) {
  const res = await fetch(apiUrl(`/api/v1/daily-status-changes/${encodeURIComponent(id)}/reject`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ approval_note: approvalNote ?? "" }),
  });
  if (!res.ok) return handleApiError(res, "Failed to reject request");
  return res.json();
}

export async function updateDailyStatusChangeRequest(id: string, payload: Record<string, unknown>) {
  const res = await fetch(apiUrl(`/api/v1/daily-status-changes/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, "Failed to update status request");
  return res.json();
}

export async function createUtilizationRegister(payload: Record<string, unknown>) {
  const res = await fetch(apiUrl("/api/v1/utilization-registers"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, "Failed to submit utilization register");
  return res.json();
}

export async function listUtilizationRegisters() {
  const res = await fetch(apiUrl("/api/v1/utilization-registers"), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch utilization registers");
  return res.json();
}

export async function getUtilizationRegister(id: string) {
  const res = await fetch(apiUrl(`/api/v1/utilization-registers/${encodeURIComponent(id)}`), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch utilization register");
  return res.json();
}

export async function deleteUtilizationRegister(id: string) {
  const res = await fetch(apiUrl(`/api/v1/utilization-registers/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) return handleApiError(res, "Failed to delete utilization register");
  return res.json();
}

export async function updateUtilizationRegister(id: string, payload: Record<string, unknown>) {
  const res = await fetch(apiUrl(`/api/v1/utilization-registers/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleApiError(res, "Failed to update utilization register");
  return res.json();
}

export async function listOperators() {
  const res = await fetch(apiUrl("/api/v1/operator-master"), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch operators");
  return res.json();
}

export async function createOperator(operatorValue: string) {
  const res = await fetch(apiUrl("/api/v1/operator-master"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ operator_value: operatorValue }),
  });
  if (!res.ok) return handleApiError(res, "Failed to create operator");
  return res.json();
}

export async function listTypeOfWork() {
  const res = await fetch(apiUrl("/api/v1/type-of-work-master"), { headers: getAuthHeaders() });
  if (!res.ok) return handleApiError(res, "Failed to fetch type of work");
  return res.json();
}

export async function createTypeOfWork(typeValue: string) {
  const res = await fetch(apiUrl("/api/v1/type-of-work-master"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ type_value: typeValue }),
  });
  if (!res.ok) return handleApiError(res, "Failed to create type of work");
  return res.json();
}

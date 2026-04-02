"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAuthzMatrix,
  fetchManagedEmployees,
  fetchScopePolicies,
  fetchUserOverrides,
  fetchUserRoles,
  replaceScopePolicies,
  setRolePermissions,
  setUserOverrides,
  setUserRoles,
} from "@/lib/api/auth";
import { can } from "@/lib/auth";

type Matrix = {
  roles: Array<{ id: string; name: string }>;
  permissions: Array<{ id: string; code: string }>;
  grants: Array<{ role_id: string; permission_id: string }>;
};

export default function AccessControlPage() {
  const canManage = can("authz:manage");
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [overridePermissionId, setOverridePermissionId] = useState("");
  const [overrideEffect, setOverrideEffect] = useState<"allow" | "deny">("deny");
  const [overrides, setOverrides] = useState<Array<{ permission_id: string; effect: "allow" | "deny"; code?: string }>>([]);
  const [policyJson, setPolicyJson] = useState("[]");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  async function refreshAll() {
    setError("");
    const [m, e] = await Promise.all([fetchAuthzMatrix(), fetchManagedEmployees({ q: search || undefined })]);
    setMatrix(m);
    setEmployees(e.map((x) => ({ id: x.id, full_name: x.full_name, email: x.email })));
  }

  useEffect(() => {
    if (!canManage) return;
    refreshAll().catch((err) => setError(err instanceof Error ? err.message : "Failed to load access control"));
  }, [canManage]);

  useEffect(() => {
    if (!selectedEmployeeId || !canManage) return;
    fetchUserRoles(selectedEmployeeId)
      .then((rows) => setSelectedRoleIds(rows.map((r) => r.role_id)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load user roles"));
    fetchUserOverrides(selectedEmployeeId)
      .then((rows) => setOverrides(rows))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load user overrides"));
  }, [selectedEmployeeId, canManage]);

  useEffect(() => {
    if (!canManage) return;
    fetchScopePolicies()
      .then((rows) => setPolicyJson(JSON.stringify(rows, null, 2)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load scope policies"));
  }, [canManage]);

  const grantSet = useMemo(() => {
    const set = new Set<string>();
    for (const g of matrix?.grants ?? []) set.add(`${g.role_id}:${g.permission_id}`);
    return set;
  }, [matrix]);

  async function toggleGrant(roleId: string, permissionId: string) {
    if (!matrix) return;
    const current = matrix.grants.filter((g) => g.role_id === roleId).map((g) => g.permission_id);
    const next = current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId];
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await setRolePermissions(roleId, next);
      await refreshAll();
      setSuccess("Role permission matrix updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update matrix");
    } finally {
      setSaving(false);
    }
  }

  async function saveUserRoles() {
    if (!selectedEmployeeId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await setUserRoles(selectedEmployeeId, selectedRoleIds);
      setSuccess("User role assignment updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user roles");
    } finally {
      setSaving(false);
    }
  }

  async function saveOverrides() {
    if (!selectedEmployeeId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await setUserOverrides(
        selectedEmployeeId,
        overrides.map((o) => ({ permission_id: o.permission_id, effect: o.effect }))
      );
      setSuccess("User overrides updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save overrides");
    } finally {
      setSaving(false);
    }
  }

  async function savePolicies() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const parsed = JSON.parse(policyJson);
      if (!Array.isArray(parsed)) throw new Error("Policies must be a JSON array.");
      await replaceScopePolicies(parsed as Array<Record<string, unknown>>);
      setSuccess("Scope policies updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scope policies");
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertDescription>You do not have permission to manage access control.</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Access Control Matrix</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            {!matrix ? (
              <p className="text-sm text-muted-foreground">Loading matrix...</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-2 min-w-[260px]">Permission</th>
                    {matrix.roles.map((role) => (
                      <th key={role.id} className="text-left py-2 pr-2 whitespace-nowrap">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.permissions.map((permission) => (
                    <tr key={permission.id} className="border-b">
                      <td className="py-2 pr-2 font-mono">{permission.code}</td>
                      {matrix.roles.map((role) => {
                        const checked = grantSet.has(`${role.id}:${permission.id}`);
                        return (
                          <td key={role.id} className="py-2 pr-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={saving || role.name === "super_admin"}
                              onChange={() => void toggleGrant(role.id, permission.id)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Role Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Search employee by name/email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button variant="outline" onClick={() => void refreshAll()}>
                Search
              </Button>
            </div>

            <select
              className="w-full h-9 rounded-md border px-2 bg-background text-sm"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.email})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(matrix?.roles ?? []).map((role) => {
                const checked = selectedRoleIds.includes(role.id);
                return (
                  <label key={role.id} className="flex items-center gap-2 text-sm border rounded px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSelectedRoleIds((prev) =>
                          e.target.checked ? [...prev, role.id] : prev.filter((id) => id !== role.id)
                        )
                      }
                    />
                    {role.name}
                  </label>
                );
              })}
            </div>

            <Button disabled={!selectedEmployeeId || saving} onClick={() => void saveUserRoles()}>
              Save User Roles
            </Button>

            <div className="pt-2 border-t space-y-2">
              <p className="text-sm font-medium">Individual Overrides</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  className="w-full h-9 rounded-md border px-2 bg-background text-sm"
                  value={overridePermissionId}
                  onChange={(e) => setOverridePermissionId(e.target.value)}
                >
                  <option value="">Select permission</option>
                  {(matrix?.permissions ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full h-9 rounded-md border px-2 bg-background text-sm"
                  value={overrideEffect}
                  onChange={(e) => setOverrideEffect(e.target.value as "allow" | "deny")}
                >
                  <option value="deny">deny</option>
                  <option value="allow">allow</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!overridePermissionId) return;
                    const permission = matrix?.permissions.find((p) => p.id === overridePermissionId);
                    setOverrides((prev) => [
                      ...prev.filter((x) => x.permission_id !== overridePermissionId),
                      { permission_id: overridePermissionId, effect: overrideEffect, code: permission?.code },
                    ]);
                  }}
                >
                  Add Override
                </Button>
              </div>
              <div className="space-y-1">
                {overrides.map((o) => (
                  <div key={o.permission_id} className="text-xs border rounded px-2 py-1 flex items-center justify-between">
                    <span className="font-mono">{o.code || o.permission_id}</span>
                    <span className={o.effect === "deny" ? "text-red-600" : "text-green-600"}>{o.effect}</span>
                  </div>
                ))}
              </div>
              <Button disabled={!selectedEmployeeId || saving} onClick={() => void saveOverrides()}>
                Save Overrides
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PBAC Scope Policies (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <textarea
              value={policyJson}
              onChange={(e) => setPolicyJson(e.target.value)}
              rows={12}
              className="w-full rounded-md border px-3 py-2 text-xs font-mono bg-background"
            />
            <Button disabled={saving} onClick={() => void savePolicies()}>
              Save Scope Policies
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


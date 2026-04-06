"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAuthzMatrix,
  fetchManagedEmployees,
  fetchUserOverrides,
  fetchUserRoles,
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

type EmployeeOption = { id: string; full_name: string; email: string };
type RoleRow = { role_id: string; name: string };
type OverrideRow = { permission_id: string; effect: "allow" | "deny"; code?: string };

const ALLOWED_SINGLE_ROLES = ["user", "manager", "admin", "super_admin"] as const;

function pickSingleRoleId(rows: RoleRow[]): string {
  if (rows.length === 0) return "";
  if (rows.length === 1) return rows[0].role_id;
  const priority = ["super_admin", "admin", "manager", "user"];
  for (const name of priority) {
    const hit = rows.find((r) => r.name === name);
    if (hit) return hit.role_id;
  }
  return rows[0].role_id;
}

export default function AccessControlPage() {
  const canManage = can("authz:manage");
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [overridePermissionId, setOverridePermissionId] = useState("");
  const [overrideEffect, setOverrideEffect] = useState<"allow" | "deny">("deny");
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supportedRoleRows = useMemo(() => {
    const roleSet = new Set(ALLOWED_SINGLE_ROLES);
    return (matrix?.roles ?? []).filter((r) => roleSet.has(r.name as (typeof ALLOWED_SINGLE_ROLES)[number]));
  }, [matrix]);

  const unsupportedRoleNames = useMemo(() => {
    return (matrix?.roles ?? [])
      .map((r) => r.name)
      .filter((name) => !ALLOWED_SINGLE_ROLES.includes(name as (typeof ALLOWED_SINGLE_ROLES)[number]));
  }, [matrix]);

  const grantSet = useMemo(() => {
    const set = new Set<string>();
    for (const g of matrix?.grants ?? []) set.add(`${g.role_id}:${g.permission_id}`);
    return set;
  }, [matrix]);

  const refreshAll = useCallback(
    async (opts?: { preserveSelection?: boolean; query?: string }) => {
      setError("");
      setIsLoadingList(true);
      try {
        const query = (opts?.query ?? "").trim();
        const [m, e] = await Promise.all([
          fetchAuthzMatrix(),
          fetchManagedEmployees({ q: query || undefined }),
        ]);
        const nextEmployees = e.map((x) => ({ id: x.id, full_name: x.full_name, email: x.email }));
        setMatrix(m);
        setEmployees(nextEmployees);

        const keepSelection = opts?.preserveSelection !== false;
        if (keepSelection && selectedEmployeeId) {
          const stillExists = nextEmployees.some((emp) => emp.id === selectedEmployeeId);
          if (!stillExists) {
            setSelectedEmployeeId("");
            setSelectedRoleId("");
            setOverrides([]);
          }
        }
      } finally {
        setIsLoadingList(false);
      }
    },
    [selectedEmployeeId]
  );

  const reloadSelectedEmployeeAuth = useCallback(async () => {
    if (!selectedEmployeeId || !canManage) {
      setSelectedRoleId("");
      setOverrides([]);
      return;
    }
    setIsLoadingUserDetail(true);
    setError("");
    try {
      let roleErr: string | null = null;
      let overrideErr: string | null = null;

      await Promise.all([
        fetchUserRoles(selectedEmployeeId)
          .then((rows) => setSelectedRoleId(pickSingleRoleId(rows)))
          .catch((err) => {
            roleErr = err instanceof Error ? err.message : "Failed to load user roles";
          }),
        fetchUserOverrides(selectedEmployeeId)
          .then((rows) => setOverrides(rows))
          .catch((err) => {
            overrideErr = err instanceof Error ? err.message : "Failed to load user overrides";
          }),
      ]);

      if (roleErr && overrideErr) {
        setError(`${roleErr}. ${overrideErr}.`);
      } else if (roleErr) {
        setError(roleErr);
      } else if (overrideErr) {
        setError(overrideErr);
      }
    } finally {
      setIsLoadingUserDetail(false);
    }
  }, [selectedEmployeeId, canManage]);

  useEffect(() => {
    if (!canManage) return;
    refreshAll({ preserveSelection: true, query: "" }).catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load access control")
    );
  }, [canManage, refreshAll]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setSelectedRoleId("");
      setOverrides([]);
      setOverridePermissionId("");
      setOverrideEffect("deny");
      return;
    }
    reloadSelectedEmployeeAuth().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load user authorization")
    );
  }, [selectedEmployeeId, reloadSelectedEmployeeAuth]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!canManage) return;
    void refreshAll({ preserveSelection: true, query: searchDebounced }).catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to search employees")
    );
  }, [canManage, refreshAll, searchDebounced]);

  async function toggleGrant(roleId: string, permissionId: string) {
    if (!matrix) return;
    const current = matrix.grants.filter((g) => g.role_id === roleId).map((g) => g.permission_id);
    const next = current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId];
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await setRolePermissions(roleId, next);
      await refreshAll({ preserveSelection: true });
      setSuccess("Role permission matrix updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update matrix");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveUserRoles() {
    if (!selectedEmployeeId) return;
    if (!selectedRoleId) {
      setError("Choose exactly one role: user, manager, admin, or super_admin.");
      return;
    }
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await setUserRoles(selectedEmployeeId, [selectedRoleId]);
      await reloadSelectedEmployeeAuth();
      setSuccess("User role assignment updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user roles");
    } finally {
      setIsSaving(false);
    }
  }

  function upsertOverride() {
    if (!overridePermissionId) {
      setError("Choose a permission for override.");
      return;
    }
    const permission = matrix?.permissions.find((p) => p.id === overridePermissionId);
    if (!permission) {
      setError("Selected permission is not available.");
      return;
    }
    setError("");
    setSuccess("");
    setOverrides((prev) => {
      const next = [
        ...prev.filter((x) => x.permission_id !== overridePermissionId),
        { permission_id: overridePermissionId, effect: overrideEffect, code: permission.code },
      ];
      return next.sort((a, b) => (a.code || a.permission_id).localeCompare(b.code || b.permission_id));
    });
  }

  function removeOverride(permissionId: string) {
    setOverrides((prev) => prev.filter((x) => x.permission_id !== permissionId));
  }

  function clearOverrides() {
    setOverrides([]);
  }

  async function saveOverrides() {
    if (!selectedEmployeeId) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await setUserOverrides(
        selectedEmployeeId,
        overrides.map((o) => ({ permission_id: o.permission_id, effect: o.effect }))
      );
      const latest = await fetchUserOverrides(selectedEmployeeId);
      setOverrides(latest);
      setOverridePermissionId("");
      setOverrideEffect("deny");
      setSuccess("User overrides updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save overrides");
    } finally {
      setIsSaving(false);
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
                              disabled={isSaving || role.name === "super_admin"}
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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>User Role Assignment</CardTitle>
              <div className="w-full md:max-w-sm">
                <Input
                  placeholder="Search employee by name/email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Search updates automatically while you type.
            </p>

            <select
              className="w-full h-9 rounded-md border px-2 bg-background text-sm"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={isLoadingList}
            >
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.email})
                </option>
              ))}
            </select>

            <p className="text-xs text-muted-foreground">
              Each user has exactly one role. Supported roles: user, manager, admin, super_admin.
            </p>
            {unsupportedRoleNames.length > 0 && (
              <p className="text-xs text-amber-600">
                Hidden custom roles in matrix: {unsupportedRoleNames.join(", ")}.
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="radiogroup" aria-label="User role">
              {supportedRoleRows.map((role) => (
                <label
                  key={role.id}
                  className="flex cursor-pointer items-center gap-2 text-sm border rounded px-2 py-1.5 has-[:checked]:border-[#70c82a] has-[:checked]:bg-[#70c82a]/10"
                >
                  <input
                    type="radio"
                    name="access-user-role"
                    className="accent-[#70c82a]"
                    checked={selectedRoleId === role.id}
                    onChange={() => setSelectedRoleId(role.id)}
                    disabled={!selectedEmployeeId || isLoadingUserDetail}
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>

            <Button
              disabled={!selectedEmployeeId || !selectedRoleId || isSaving || isLoadingUserDetail}
              onClick={() => void saveUserRoles()}
            >
              Save User Roles
            </Button>

            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Individual Overrides</p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectedEmployeeId || overrides.length === 0 || isSaving}
                  onClick={clearOverrides}
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  className="w-full h-9 rounded-md border px-2 bg-background text-sm"
                  value={overridePermissionId}
                  onChange={(e) => setOverridePermissionId(e.target.value)}
                  disabled={!selectedEmployeeId}
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
                  disabled={!selectedEmployeeId}
                >
                  <option value="deny">deny</option>
                  <option value="allow">allow</option>
                </select>
                <Button variant="outline" disabled={!selectedEmployeeId} onClick={upsertOverride}>
                  Add / Update Override
                </Button>
              </div>

              <div className="space-y-1">
                {overrides.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No overrides for this user.</p>
                ) : (
                  overrides.map((o) => (
                    <div key={o.permission_id} className="text-xs border rounded px-2 py-1 flex items-center justify-between gap-2">
                      <span className="font-mono truncate">{o.code || o.permission_id}</span>
                      <div className="flex items-center gap-2">
                        <span className={o.effect === "deny" ? "text-red-600" : "text-green-600"}>{o.effect}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeOverride(o.permission_id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Button disabled={!selectedEmployeeId || isSaving || isLoadingUserDetail} onClick={() => void saveOverrides()}>
                Save Overrides
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

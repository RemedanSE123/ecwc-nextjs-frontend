"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { changeMyPassword, fetchMyProfile, updateMyProfile, uploadUserImage, type MyProfile } from "@/lib/api/auth";
import { MapPin, ShieldCheck, UserRound } from "lucide-react";
import { updateSessionUser } from "@/lib/auth";
import ProfilePopup from "@/components/ProfilePopup";

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", profile_image: "" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    let mounted = true;
    fetchMyProfile()
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
        setForm({
          full_name: p.full_name || "",
          email: p.email || "",
          phone: p.phone || "",
          profile_image: p.profile_image || "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateMyProfile({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profile_image: form.profile_image.trim() || null,
      });
      setSuccess(res.message || "Profile updated");
      const p = await fetchMyProfile();
      setProfile(p);
      updateSessionUser({ name: p.full_name, phone: p.phone, email: p.email });
      setPopupTitle("Profile Updated");
      setPopupMessage(res.message || "Your profile data has been updated successfully.");
      setPopupOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      setError(msg);
      setPopupTitle("Update Failed");
      setPopupMessage(msg);
      setPopupOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChanging(true);
    setError("");
    setSuccess("");
    try {
      if (pwd.next !== pwd.confirm) throw new Error("New password and confirm password do not match");
      const res = await changeMyPassword(pwd.current, pwd.next);
      setSuccess(res.message || "Password changed");
      setPwd({ current: "", next: "", confirm: "" });
      setPopupTitle("Password Changed");
      setPopupMessage(res.message || "Your password has been changed successfully.");
      setPopupOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to change password";
      setError(msg);
      setPopupTitle("Password Change Failed");
      setPopupMessage(msg);
      setPopupOpen(true);
    } finally {
      setChanging(false);
    }
  }

  async function onUploadProfileImage(file: File | null) {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const uploaded = await uploadUserImage(file);
      setForm((p) => ({ ...p, profile_image: uploaded.path }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4">
        <ProfilePopup open={popupOpen} title={popupTitle} message={popupMessage} onClose={() => setPopupOpen(false)} />
        <Card className="border-green-200/60 bg-gradient-to-r from-green-50/70 to-white">
          <CardContent className="pt-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center text-lg font-bold">
                  {(form.full_name || "U").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() || "").join("") || "U"}
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900">{form.full_name || "My Profile"}</h1>
                  <p className="text-xs text-gray-600">{form.email || ""}</p>
                </div>
              </div>
              <div className="text-xs">
                <span className={`px-2.5 py-1 rounded-full ${profile?.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {profile?.is_active ? "Approved Access" : "Pending Approval"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading profile...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Department</div>
                  <div className="font-medium">{profile?.department_name || "-"}</div>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Job Title</div>
                  <div className="font-medium">{profile?.position_title || profile?.job_title || "-"}</div>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <div className="text-xs text-muted-foreground">Line Manager</div>
                  <div className="font-medium">{profile?.supervisor_name || "-"}</div>
                </div>
                <div className="rounded-lg border bg-white p-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="font-medium">{profile?.work_location_name || "-"}</div>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">Access</div>
                    <div className="font-medium">{profile?.is_active ? "Approved (Active)" : "Pending Admin Approval"}</div>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-3 flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">Employee Code</div>
                    <div className="font-medium">{profile?.employee_id || "-"}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Profile Image</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => void onUploadProfileImage(e.target.files?.[0] ?? null)}
                  disabled={uploadingImage}
                />
                <Input value={form.profile_image} onChange={(e) => setForm((p) => ({ ...p, profile_image: e.target.value }))} placeholder="/uploads/user/..." />
                {uploadingImage && <p className="text-xs text-muted-foreground">Uploading image...</p>}
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Current Password *</Label>
                <Input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} required />
              </div>
              <div />
              <div className="space-y-1">
                <Label>New Password *</Label>
                <Input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Confirm New Password *</Label>
                <Input type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={changing}>{changing ? "Changing..." : "Change Password"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Asset } from '@/types/asset';
import { EQUIPMENT_CATEGORIES } from '@/types/asset';
import { createAsset, updateAsset, uploadAssetImage } from '@/lib/api/assets';
import type { CreateAssetPayload } from '@/lib/api/assets';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const CATEGORY_OPTIONS = EQUIPMENT_CATEGORIES.map((c) => ({
  value: c.dbCategory,
  label: c.name,
}));

export interface AssetFormProps {
  /** When set, form is in edit mode. */
  asset?: Asset | null;
  /** Default category when creating (e.g. from current category page). */
  defaultCategory?: string;
  onSuccess: (asset: Asset) => void;
  onCancel: () => void;
}

export default function AssetForm({
  asset,
  defaultCategory,
  onSuccess,
  onCancel,
}: AssetFormProps) {
  const isEdit = !!asset?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(asset?.image_s3_key ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    category: asset?.category ?? defaultCategory ?? CATEGORY_OPTIONS[0]?.value ?? '',
    description: asset?.description ?? '',
    asset_no: asset?.asset_no ?? '',
    serial_no: asset?.serial_no ?? '',
    make: asset?.make ?? '',
    model: asset?.model ?? '',
    status: asset?.status ?? '',
    project_location: asset?.project_location ?? '',
    ownership: asset?.ownership ?? '',
    responsible_person_name: asset?.responsible_person_name ?? '',
    responsible_person_pno: asset?.responsible_person_pno ?? '',
    remark: asset?.remark ?? '',
  });

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    setImageFile(file);
    setError(null);
    try {
      setSaving(true);
      const { key } = await uploadAssetImage(file, asset?.id);
      setImageKey(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category.trim() || !form.description.trim()) {
      setError('Category and description are required.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (isEdit && asset) {
        const payload = {
          ...form,
          image_s3_key: imageKey,
        };
        const updated = await updateAsset(asset.id, payload);
        onSuccess(updated);
      } else {
        const payload: CreateAssetPayload = {
          ...form,
          image_s3_key: imageKey ?? undefined,
        };
        const created = await createAsset(payload);
        onSuccess(created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Image */}
      <div className="space-y-2">
        <Label>Image</Label>
        <div className="flex items-center gap-3">
          <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
            {(imageFile || imageKey) ? (
              imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            {(imageFile || imageKey) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImageKey(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => update('category', v)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Asset description"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="asset_no">Asset No</Label>
          <Input
            id="asset_no"
            value={form.asset_no}
            onChange={(e) => update('asset_no', e.target.value)}
            placeholder="Asset number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serial_no">Serial No</Label>
          <Input
            id="serial_no"
            value={form.serial_no}
            onChange={(e) => update('serial_no', e.target.value)}
            placeholder="Serial number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={form.make}
            onChange={(e) => update('make', e.target.value)}
            placeholder="Make"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="Model"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            placeholder="e.g. Operational, Repair"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project_location">Project Location</Label>
          <Input
            id="project_location"
            value={form.project_location}
            onChange={(e) => update('project_location', e.target.value)}
            placeholder="Location"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownership">Ownership</Label>
          <Input
            id="ownership"
            value={form.ownership}
            onChange={(e) => update('ownership', e.target.value)}
            placeholder="Ownership"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsible_person_name">Responsible Person</Label>
          <Input
            id="responsible_person_name"
            value={form.responsible_person_name}
            onChange={(e) => update('responsible_person_name', e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="responsible_person_pno">Phone</Label>
          <Input
            id="responsible_person_pno"
            value={form.responsible_person_pno}
            onChange={(e) => update('responsible_person_pno', e.target.value)}
            placeholder="Phone number"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="remark">Remark</Label>
          <Input
            id="remark"
            value={form.remark}
            onChange={(e) => update('remark', e.target.value)}
            placeholder="Remarks"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

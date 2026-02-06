'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
import { createAsset, updateAsset, uploadAssetImage, fetchAssetFacets, fetchAssets } from '@/lib/api/assets';
import type { CreateAssetPayload } from '@/lib/api/assets';
import type { AssetFacets } from '@/types/asset';
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
  /** Category group slug (e.g. plant-equipment) for fetching facets when on a category page. */
  categoryGroup?: string;
  onSuccess: (asset: Asset) => void;
  onCancel: () => void;
}

export default function AssetForm({
  asset,
  defaultCategory,
  categoryGroup,
  onSuccess,
  onCancel,
}: AssetFormProps) {
  const isEdit = !!asset?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(asset?.image_s3_key ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [facets, setFacets] = useState<AssetFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [descriptionIsOther, setDescriptionIsOther] = useState(false);
  const [form, setForm] = useState({
    category: asset?.category ?? defaultCategory ?? CATEGORY_OPTIONS[0]?.value ?? '',
    description: asset?.description ?? '',
    descriptionOther: '',
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

  // Fetch unique options for selected category (description, status, location, ownership, make, model)
  useEffect(() => {
    if (!form.category.trim()) {
      setFacets(null);
      return;
    }
    setFacetsLoading(true);
    // Use only category so options always match the selected category (not categoryGroup)
    fetchAssetFacets({ category: [form.category] })
      .then(setFacets)
      .catch(() => setFacets(null))
      .finally(() => setFacetsLoading(false));
  }, [form.category]);

  // Description options: from facets for selected category; include current value in edit
  const descriptionOptions = useMemo(() => {
    const list = facets?.description ?? [];
    const uniq = [...new Set(list)].filter(Boolean).sort();
    if (isEdit && form.description && !uniq.includes(form.description)) {
      return [form.description, ...uniq];
    }
    return uniq;
  }, [facets?.description, form.description, isEdit]);

  const statusOptions = useMemo(() => [...new Set(facets?.status ?? [])].filter(Boolean).sort(), [facets?.status]);
  const projectLocationOptions = useMemo(() => [...new Set(facets?.project_location ?? [])].filter(Boolean).sort(), [facets?.project_location]);
  const ownershipOptions = useMemo(() => [...new Set(facets?.ownership ?? [])].filter(Boolean).sort(), [facets?.ownership]);
  const makeOptions = useMemo(() => [...new Set(facets?.make ?? [])].filter(Boolean).sort(), [facets?.make]);
  const modelOptions = useMemo(() => [...new Set(facets?.model ?? [])].filter(Boolean).sort(), [facets?.model]);

  // When category changes, clear description if it's not in the new category's list (create mode)
  useEffect(() => {
    if (isEdit || !form.category) return;
    const list = facets?.description ?? [];
    if (list.length > 0 && form.description && !list.includes(form.description)) {
      setForm((f) => ({ ...f, description: '' }));
    }
  }, [form.category, facets?.description, isEdit]);

  // Sync form when opening in edit mode so the popup is never empty
  useEffect(() => {
    if (asset?.id) {
      setDescriptionIsOther(false);
      setForm({
        category: asset.category ?? defaultCategory ?? CATEGORY_OPTIONS[0]?.value ?? '',
        description: asset.description ?? '',
        descriptionOther: '',
        asset_no: asset.asset_no ?? '',
        serial_no: asset.serial_no ?? '',
        make: asset.make ?? '',
        model: asset.model ?? '',
        status: asset.status ?? '',
        project_location: asset.project_location ?? '',
        ownership: asset.ownership ?? '',
        responsible_person_name: asset.responsible_person_name ?? '',
        responsible_person_pno: asset.responsible_person_pno ?? '',
        remark: asset.remark ?? '',
      });
      setImageKey(asset.image_s3_key ?? null);
      setImageFile(null);
    }
  }, [asset?.id, asset, defaultCategory]);

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
    const descriptionValue = descriptionIsOther ? form.descriptionOther.trim() : form.description.trim();
    if (!form.category.trim() || !descriptionValue) {
      setError('Category and description are required.');
      return;
    }
    setError(null);

    // Create: check duplicate asset_no (asset must be unique)
    if (!isEdit && form.asset_no.trim()) {
      setSaving(true);
      try {
        const res = await fetchAssets({ search: form.asset_no.trim(), limit: 20 });
        const isDuplicate = res.data.some(
          (a) => (a.asset_no || '').trim().toLowerCase() === form.asset_no.trim().toLowerCase()
        );
        if (isDuplicate) {
          setError('An asset with this Asset No already exists. Asset No must be unique.');
          setSaving(false);
          return;
        }
      } catch {
        // proceed if check fails (e.g. network)
      }
      setSaving(false);
    }

    setSaving(true);
    try {
      const payloadForm = { ...form, description: descriptionValue };
      if (isEdit && asset) {
        const { descriptionOther: _do, ...rest } = payloadForm as Record<string, unknown>;
        const payload = { ...rest, image_s3_key: imageKey };
        const updated = await updateAsset(asset.id, payload);
        onSuccess(updated);
      } else {
        const { descriptionOther: _do, ...rest } = payloadForm as Record<string, unknown>;
        const payload: CreateAssetPayload = { ...rest, image_s3_key: imageKey ?? undefined } as CreateAssetPayload;
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
          {descriptionOptions.length === 0 && !facetsLoading ? (
            <Input
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Asset description (no options for this category yet)"
              required
            />
          ) : (
            <>
              <Select
                value={form.description || (descriptionIsOther ? '__other__' : '')}
                onValueChange={(v) => {
                  if (v === '__other__') {
                    setDescriptionIsOther(true);
                    update('description', '');
                  } else {
                    setDescriptionIsOther(false);
                    update('description', v);
                    update('descriptionOther', '');
                  }
                }}
              >
                <SelectTrigger id="description">
                  <SelectValue placeholder={facetsLoading ? 'Loading…' : 'Select description'} />
                </SelectTrigger>
                <SelectContent>
                  {descriptionOptions.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.length > 60 ? `${d.slice(0, 60)}…` : d}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other__">Other (type below)</SelectItem>
                </SelectContent>
              </Select>
              {descriptionIsOther && (
                <Input
                  className="mt-2"
                  value={form.descriptionOther}
                  onChange={(e) => update('descriptionOther', e.target.value)}
                  placeholder="Enter description"
                />
              )}
            </>
          )}
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
          <Select value={form.make || '_none_'} onValueChange={(v) => update('make', v === '_none_' ? '' : v)}>
            <SelectTrigger id="make">
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">—</SelectItem>
              {makeOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={form.model || '_none_'} onValueChange={(v) => update('model', v === '_none_' ? '' : v)}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">—</SelectItem>
              {modelOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={form.status || '_none_'} onValueChange={(v) => update('status', v === '_none_' ? '' : v)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">—</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project_location">Project Location</Label>
          <Select value={form.project_location || '_none_'} onValueChange={(v) => update('project_location', v === '_none_' ? '' : v)}>
            <SelectTrigger id="project_location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">—</SelectItem>
              {projectLocationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownership">Ownership</Label>
          <Select value={form.ownership || '_none_'} onValueChange={(v) => update('ownership', v === '_none_' ? '' : v)}>
            <SelectTrigger id="ownership">
              <SelectValue placeholder="Select ownership" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none_">—</SelectItem>
              {ownershipOptions.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

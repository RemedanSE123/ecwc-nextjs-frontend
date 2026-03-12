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
import { EQUIPMENT_CATEGORIES, SLUG_TO_DB_CATEGORY } from '@/types/asset';
import {
  createAsset,
  updateAsset,
  uploadAssetImage,
  fetchAssetFacets,
  fetchAssets,
  fetchHeavyVehicleDetails,
  fetchLightVehicleDetails,
  fetchMachineryDetails,
  fetchPlantDetails,
  fetchAuxGeneratorDetails,
  updateHeavyVehicleRates,
  updateLightVehicleRates,
  updateMachineryRates,
  updatePlantRates,
  updateAuxGeneratorRates,
  updateHeavyVehicleSpecs,
  updateLightVehicleSpecs,
  updateMachinerySpecs,
} from '@/lib/api/assets';
import type { CreateAssetPayload } from '@/lib/api/assets';
import type { AssetFacets } from '@/types/asset';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';

const CATEGORY_OPTIONS = EQUIPMENT_CATEGORIES.map((c) => ({
  value: c.dbCategory,
  label: c.name,
}));

const HEAVY_VEHICLE_CATEGORY = SLUG_TO_DB_CATEGORY['heavy-vehicles'];
const LIGHT_VEHICLE_CATEGORY = SLUG_TO_DB_CATEGORY['light-vehicles'];
const MACHINERY_CATEGORY = SLUG_TO_DB_CATEGORY['machinery'];
const PLANT_CATEGORY = SLUG_TO_DB_CATEGORY['plant-equipment'];
const AUXILIARY_CATEGORY = SLUG_TO_DB_CATEGORY['auxiliary-equipment'];

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
  const [success, setSuccess] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(asset?.image_s3_key ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [facets, setFacets] = useState<AssetFacets | null>(null);
  const [allFacets, setAllFacets] = useState<AssetFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const [allFacetsLoading, setAllFacetsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detailRates, setDetailRates] = useState<{ rate_op: string; rate_idle: string; rate_down: string }>({
    rate_op: '',
    rate_idle: '',
    rate_down: '',
  });
  const [detailFields, setDetailFields] = useState<{
    plate_no: string;
    chassis_serial_no: string;
    engine_make: string;
    engine_model: string;
    engine_serial_no: string;
    capacity: string;
    manuf_year: string;
    libre: string;
    tire_size: string;
    battery_capacity: string;
    insurance_coverage: string;
    bolo_renewal_date: string;
  }>({
    plate_no: '',
    chassis_serial_no: '',
    engine_make: '',
    engine_model: '',
    engine_serial_no: '',
    capacity: '',
    manuf_year: '',
    libre: '',
    tire_size: '',
    battery_capacity: '',
    insurance_coverage: '',
    bolo_renewal_date: '',
  });
  const [initialForm, setInitialForm] = useState<typeof form | null>(null);
  const [initialDetailFields, setInitialDetailFields] = useState<typeof detailFields | null>(null);
  const [initialDetailRates, setInitialDetailRates] = useState<typeof detailRates | null>(null);
  const [initialImageKey, setInitialImageKey] = useState<string | null>(asset?.image_s3_key ?? null);
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
    responsible_person_pno: asset?.responsible_person_pno ?? '+251',
    remark: asset?.remark ?? '',
  });

  // Fetch unique options for selected category (description, make)
  useEffect(() => {
    if (!form.category.trim()) {
      setFacets(null);
      return;
    }
    setFacetsLoading(true);
    fetchAssetFacets({ category: [form.category] })
      .then(setFacets)
      .catch(() => setFacets(null))
      .finally(() => setFacetsLoading(false));
  }, [form.category]);

  // Fetch ALL options (no category filter) for project_location, status, ownership
  useEffect(() => {
    setAllFacetsLoading(true);
    fetchAssetFacets({})
      .then(setAllFacets)
      .catch(() => setAllFacets(null))
      .finally(() => setAllFacetsLoading(false));
  }, []);

  // Description options: from facets for selected category; include current value in edit
  const descriptionOptions = useMemo(() => {
    const list = facets?.description ?? [];
    const uniq = [...new Set(list)].filter(Boolean).sort();
    if (isEdit && form.description && !uniq.includes(form.description)) {
      return [form.description, ...uniq];
    }
    return uniq;
  }, [facets?.description, form.description, isEdit]);

  const ensureCurrentInList = (list: string[], current: string | undefined): string[] => {
    if (!isEdit || !current?.trim()) return list;
    if (!list.includes(current)) return [current, ...list];
    return list;
  };
  const statusOptions = useMemo(() => {
    const list = [...new Set(allFacets?.status ?? [])].filter(Boolean).sort() as string[];
    return ensureCurrentInList(list, form.status);
  }, [allFacets?.status, form.status, isEdit]);
  const projectLocationOptions = useMemo(() => {
    const list = [...new Set(allFacets?.project_location ?? [])].filter(Boolean).sort() as string[];
    return ensureCurrentInList(list, form.project_location);
  }, [allFacets?.project_location, form.project_location, isEdit]);
  const ownershipOptions = useMemo(() => {
    const list = [...new Set(allFacets?.ownership ?? [])].filter(Boolean) as string[];
    if (!list.includes('Rental')) list.push('Rental');
    list.sort();
    return ensureCurrentInList(list, form.ownership);
  }, [allFacets?.ownership, form.ownership, isEdit]);
  const makeOptions = useMemo(() => {
    const list = [...new Set(facets?.make ?? [])].filter(Boolean).sort() as string[];
    return ensureCurrentInList(list, form.make);
  }, [facets?.make, form.make, isEdit]);

  const shouldShowRates = useMemo(() => {
    // Rate fields are now hidden in both create and edit flows.
    return false;
  }, []);

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
      const baseForm = {
        category: asset.category ?? defaultCategory ?? CATEGORY_OPTIONS[0]?.value ?? '',
        description: asset.description ?? '',
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
      };
      setForm(baseForm);
      setInitialForm(baseForm);
      const key = asset.image_s3_key ?? null;
      setImageKey(key);
      setInitialImageKey(key);
      setInitialDetailFields(null);
      setInitialDetailRates(null);
      setImageFile(null);
    }
  }, [asset?.id, asset, defaultCategory]);

  // Load existing detail rates for edit mode
  useEffect(() => {
    if (!asset?.id) return;
    const cat = asset.category ?? '';
    const desc = (asset.description ?? '').toLowerCase();
    const load = async () => {
      try {
        if (cat === HEAVY_VEHICLE_CATEGORY) {
          const res = await fetchHeavyVehicleDetails(asset.id);
          const d = res.data;
          if (d) {
            const rates = {
              rate_op: d.rate_op != null ? String(d.rate_op) : '',
              rate_idle: d.rate_idle != null ? String(d.rate_idle) : '',
              rate_down: d.rate_down != null ? String(d.rate_down) : '',
            };
            const fields = {
              plate_no: d.plate_no ?? '',
              chassis_serial_no: d.chassis_serial_no ?? '',
              engine_make: d.engine_make ?? '',
              engine_model: d.engine_model ?? '',
              engine_serial_no: d.engine_serial_no ?? '',
              capacity: d.capacity ?? '',
              manuf_year: d.manuf_year != null ? String(d.manuf_year) : '',
              libre: d.libre != null ? String(d.libre) : '',
              tire_size: d.tire_size ?? '',
              battery_capacity: d.battery_capacity ?? '',
              insurance_coverage: d.insurance_coverage ?? '',
              bolo_renewal_date: d.bolo_renewal_date ?? '',
            };
            setDetailRates(rates);
            setDetailFields(fields);
            if (!initialDetailRates) setInitialDetailRates(rates);
            if (!initialDetailFields) setInitialDetailFields(fields);
            return;
          }
        } else if (cat === LIGHT_VEHICLE_CATEGORY) {
          const res = await fetchLightVehicleDetails(asset.id);
          const d = res.data;
          if (d) {
            const rates = {
              rate_op: d.rate_op != null ? String(d.rate_op) : '',
              rate_idle: d.rate_idle != null ? String(d.rate_idle) : '',
              rate_down: d.rate_down != null ? String(d.rate_down) : '',
            };
            const fields = {
              plate_no: d.plate_no ?? '',
              chassis_serial_no: '',
              engine_make: '',
              engine_model: '',
              engine_serial_no: d.engine_serial_no ?? '',
              capacity: d.capacity ?? '',
              manuf_year: d.manuf_year != null ? String(d.manuf_year) : '',
              libre: d.libre != null ? String(d.libre) : '',
              tire_size: d.tire_size ?? '',
              battery_capacity: d.battery_capacity ?? '',
              insurance_coverage: d.insurance_coverage ?? '',
              bolo_renewal_date: d.bolo_renewal_date ?? '',
            };
            setDetailRates(rates);
            setDetailFields(fields);
            if (!initialDetailRates) setInitialDetailRates(rates);
            if (!initialDetailFields) setInitialDetailFields(fields);
            return;
          }
        } else if (cat === MACHINERY_CATEGORY) {
          const res = await fetchMachineryDetails(asset.id);
          const d = res.data;
          if (d) {
            const rates = {
              rate_op: d.rate_op != null ? String(d.rate_op) : '',
              rate_idle: d.rate_idle != null ? String(d.rate_idle) : '',
              rate_down: d.rate_down != null ? String(d.rate_down) : '',
            };
            const fields = {
              plate_no: d.plate_no ?? '',
              chassis_serial_no: '',
              engine_make: d.engine_make ?? '',
              engine_model: d.engine_model ?? '',
              engine_serial_no: d.engine_serial_no ?? '',
              capacity: d.capacity ?? '',
              manuf_year: d.manuf_year != null ? String(d.manuf_year) : '',
              libre: d.libre != null ? String(d.libre) : '',
              tire_size: d.tire_size ?? '',
              battery_capacity: d.battery_capacity ?? '',
              insurance_coverage: '',
              bolo_renewal_date: '',
            };
            setDetailRates(rates);
            setDetailFields(fields);
            if (!initialDetailRates) setInitialDetailRates(rates);
            if (!initialDetailFields) setInitialDetailFields(fields);
            return;
          }
        } else if (cat === PLANT_CATEGORY) {
          const res = await fetchPlantDetails(asset.id);
          const d = res.data;
          if (d) {
            const rates = {
              rate_op: d.rate_op != null ? String(d.rate_op) : '',
              rate_idle: d.rate_idle != null ? String(d.rate_idle) : '',
              rate_down: d.rate_down != null ? String(d.rate_down) : '',
            };
            setDetailRates(rates);
            if (!initialDetailRates) setInitialDetailRates(rates);
            return;
          }
        } else if (cat === AUXILIARY_CATEGORY && desc.includes('generator')) {
          const res = await fetchAuxGeneratorDetails(asset.id);
          const d = res.data;
          if (d) {
            const rates = {
              rate_op: d.rate_op != null ? String(d.rate_op) : '',
              rate_idle: d.rate_idle != null ? String(d.rate_idle) : '',
              rate_down: d.rate_down != null ? String(d.rate_down) : '',
            };
            setDetailRates(rates);
            if (!initialDetailRates) setInitialDetailRates(rates);
            return;
          }
        }
      } catch {
        // ignore detail load errors
      }
    };
    load();
  }, [asset?.id, asset?.category, asset?.description, initialDetailFields, initialDetailRates]);

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
    setSuccess(null);
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

  const isDirty = useMemo(() => {
    if (!isEdit) return true;
    if (!initialForm || !initialImageKey === undefined) {
      // wait until initial state is captured
      return false;
    }
    const sameForm = initialForm && JSON.stringify(form) === JSON.stringify(initialForm);
    const sameDetailFields =
      initialDetailFields && JSON.stringify(detailFields) === JSON.stringify(initialDetailFields);
    const sameDetailRates =
      initialDetailRates && JSON.stringify(detailRates) === JSON.stringify(initialDetailRates);
    const sameImage = imageKey === initialImageKey;

    return !(sameForm && sameDetailFields && sameDetailRates && sameImage);
  }, [isEdit, form, detailFields, detailRates, imageKey, initialForm, initialDetailFields, initialDetailRates, initialImageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category.trim() || !form.description.trim()) {
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
      if (isEdit && asset) {
        const payload = { ...form, image_s3_key: imageKey };
        const updated = await updateAsset(asset.id, payload);

        const cat = form.category;
        const desc = form.description.toLowerCase();
        const toNum = (v: string): number | null => {
          const trimmed = v.trim();
          if (!trimmed) return null;
          const n = Number(trimmed);
          return Number.isNaN(n) ? null : n;
        };
        const ratePayload = {
          rate_op: toNum(detailRates.rate_op),
          rate_idle: toNum(detailRates.rate_idle),
          rate_down: toNum(detailRates.rate_down),
        };
        try {
          if (cat === HEAVY_VEHICLE_CATEGORY) {
            await updateHeavyVehicleRates(asset.id, ratePayload);
            await updateHeavyVehicleSpecs(asset.id, {
              plate_no: detailFields.plate_no || null,
              chassis_serial_no: detailFields.chassis_serial_no || null,
              engine_make: detailFields.engine_make || null,
              engine_model: detailFields.engine_model || null,
              engine_serial_no: detailFields.engine_serial_no || null,
              capacity: detailFields.capacity || null,
              manuf_year: detailFields.manuf_year ? Number(detailFields.manuf_year) : null,
              libre: detailFields.libre ? detailFields.libre === 'true' : null,
              tire_size: detailFields.tire_size || null,
              battery_capacity: detailFields.battery_capacity || null,
              insurance_coverage: detailFields.insurance_coverage || null,
              bolo_renewal_date: detailFields.bolo_renewal_date || null,
              rate_op: ratePayload.rate_op,
              rate_idle: ratePayload.rate_idle,
              rate_down: ratePayload.rate_down,
            });
          } else if (cat === LIGHT_VEHICLE_CATEGORY) {
            await updateLightVehicleRates(asset.id, ratePayload);
            await updateLightVehicleSpecs(asset.id, {
              plate_no: detailFields.plate_no || null,
              engine_serial_no: detailFields.engine_serial_no || null,
              capacity: detailFields.capacity || null,
              manuf_year: detailFields.manuf_year ? Number(detailFields.manuf_year) : null,
              libre: detailFields.libre ? detailFields.libre === 'true' : null,
              tire_size: detailFields.tire_size || null,
              battery_capacity: detailFields.battery_capacity || null,
              insurance_coverage: detailFields.insurance_coverage || null,
              bolo_renewal_date: detailFields.bolo_renewal_date || null,
              rate_op: ratePayload.rate_op,
              rate_idle: ratePayload.rate_idle,
              rate_down: ratePayload.rate_down,
            });
          } else if (cat === MACHINERY_CATEGORY) {
            await updateMachineryRates(asset.id, ratePayload);
            await updateMachinerySpecs(asset.id, {
              plate_no: detailFields.plate_no || null,
              engine_make: detailFields.engine_make || null,
              engine_model: detailFields.engine_model || null,
              engine_serial_no: detailFields.engine_serial_no || null,
              capacity: detailFields.capacity || null,
              manuf_year: detailFields.manuf_year ? Number(detailFields.manuf_year) : null,
              libre: detailFields.libre ? detailFields.libre === 'true' : null,
              tire_size: detailFields.tire_size || null,
              battery_capacity: detailFields.battery_capacity || null,
              rate_op: ratePayload.rate_op,
              rate_idle: ratePayload.rate_idle,
              rate_down: ratePayload.rate_down,
            });
          } else if (cat === PLANT_CATEGORY) {
            await updatePlantRates(asset.id, ratePayload);
          } else if (cat === AUXILIARY_CATEGORY && desc.includes('generator')) {
            await updateAuxGeneratorRates(asset.id, ratePayload);
          }
        } catch {
          // ignore detail update errors
        }

        setSuccess('Asset details updated successfully.');
        onSuccess(updated);
      } else {
        const payload: CreateAssetPayload = { ...form, image_s3_key: imageKey ?? undefined } as CreateAssetPayload;
        const created = await createAsset(payload);

        const cat = form.category;
        const desc = form.description.toLowerCase();
        const toNum = (v: string): number | null => {
          const trimmed = v.trim();
          if (!trimmed) return null;
          const n = Number(trimmed);
          return Number.isNaN(n) ? null : n;
        };
        const ratePayload = {
          rate_op: toNum(detailRates.rate_op),
          rate_idle: toNum(detailRates.rate_idle),
          rate_down: toNum(detailRates.rate_down),
        };
        try {
          if (cat === HEAVY_VEHICLE_CATEGORY) {
            await updateHeavyVehicleRates(created.id, ratePayload);
            await updateHeavyVehicleSpecs(created.id, {
              plate_no: detailFields.plate_no || null,
              chassis_serial_no: detailFields.chassis_serial_no || null,
              engine_make: detailFields.engine_make || null,
              engine_model: detailFields.engine_model || null,
              engine_serial_no: detailFields.engine_serial_no || null,
              capacity: detailFields.capacity || null,
              manuf_year: detailFields.manuf_year ? Number(detailFields.manuf_year) : null,
              libre: detailFields.libre ? detailFields.libre === 'true' : null,
              tire_size: detailFields.tire_size || null,
              battery_capacity: detailFields.battery_capacity || null,
              insurance_coverage: detailFields.insurance_coverage || null,
              bolo_renewal_date: detailFields.bolo_renewal_date || null,
              rate_op: ratePayload.rate_op,
              rate_idle: ratePayload.rate_idle,
              rate_down: ratePayload.rate_down,
            });
          } else if (cat === LIGHT_VEHICLE_CATEGORY) {
            await updateLightVehicleRates(created.id, ratePayload);
            await updateLightVehicleSpecs(created.id, {
              plate_no: detailFields.plate_no || null,
              engine_serial_no: detailFields.engine_serial_no || null,
              capacity: detailFields.capacity || null,
              manuf_year: detailFields.manuf_year ? Number(detailFields.manuf_year) : null,
              libre: detailFields.libre ? detailFields.libre === 'true' : null,
              tire_size: detailFields.tire_size || null,
              battery_capacity: detailFields.battery_capacity || null,
              insurance_coverage: detailFields.insurance_coverage || null,
              bolo_renewal_date: detailFields.bolo_renewal_date || null,
              rate_op: ratePayload.rate_op,
              rate_idle: ratePayload.rate_idle,
              rate_down: ratePayload.rate_down,
            });
          } else if (cat === MACHINERY_CATEGORY) {
            await updateMachineryRates(created.id, ratePayload);
            await updateMachinerySpecs(created.id, {
              plate_no: detailFields.plate_no || null,
              engine_make: detailFields.engine_make || null,
              engine_model: detailFields.engine_model || null,
              engine_serial_no: detailFields.engine_serial_no || null,
              capacity: detailFields.capacity || null,
              manuf_year: detailFields.manuf_year ? Number(detailFields.manuf_year) : null,
              libre: detailFields.libre ? detailFields.libre === 'true' : null,
              tire_size: detailFields.tire_size || null,
              battery_capacity: detailFields.battery_capacity || null,
              rate_op: ratePayload.rate_op,
              rate_idle: ratePayload.rate_idle,
              rate_down: ratePayload.rate_down,
            });
          } else if (cat === PLANT_CATEGORY) {
            await updatePlantRates(created.id, ratePayload);
          } else if (cat === AUXILIARY_CATEGORY && desc.includes('generator')) {
            await updateAuxGeneratorRates(created.id, ratePayload);
          }
        } catch {
          // ignore detail update errors
        }

        setSuccess('Asset created successfully.');
        onSuccess(created);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 flex items-center gap-2 shadow-sm">
          <span className="font-medium">Error:</span>
          {error}
        </div>
      )}
      {success && !error && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 flex items-center gap-2 shadow-sm">
          <span className="font-medium">Success:</span>
          {success}
        </div>
      )}

      {/* Image + Category — same column */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          {/* Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image</Label>
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-muted/30 transition-colors">
              <div className="w-full aspect-[4/3] max-h-32 rounded-lg bg-muted/60 flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/20 hover:border-primary/30 transition-colors">
                {(imageFile || imageKey) ? (
                  imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
                )}
              </div>
              <div className="flex gap-2">
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
                  className="gap-1.5 border-primary/30 hover:bg-primary/5 hover:border-primary/50 flex-1"
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
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Category */}
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
          {/* Project Location */}
          <div className="space-y-2">
            <Label htmlFor="project_location">Project Location</Label>
            <SearchableCombobox
              id="project_location"
              value={form.project_location}
              onChange={(v) => update('project_location', v)}
              options={projectLocationOptions}
              placeholder="Type to search location"
              loading={allFacetsLoading}
              allowEmpty
            />
          </div>
        </div>

      {/* Rest of form fields */}
      <div className="sm:col-span-2 lg:col-span-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Asset details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <SearchableCombobox
              id="description"
              value={form.description}
              onChange={(v) => update('description', v)}
              options={descriptionOptions}
              placeholder="Type to search description"
              loading={facetsLoading}
              required
            />
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
          <SearchableCombobox
            id="make"
            value={form.make}
            onChange={(v) => update('make', v)}
            options={makeOptions}
            placeholder="Type to search make"
            loading={facetsLoading}
            allowEmpty
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="Enter model"
          />
        </div>
        {/* Category-specific detail fields */}
        {form.category === HEAVY_VEHICLE_CATEGORY && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Heavy Vehicle Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hv_plate_no">Plate No</Label>
                <Input
                  id="hv_plate_no"
                  value={detailFields.plate_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, plate_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_chassis_serial_no">Chassis Serial No</Label>
                <Input
                  id="hv_chassis_serial_no"
                  value={detailFields.chassis_serial_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, chassis_serial_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_engine_make">Engine Make</Label>
                <Input
                  id="hv_engine_make"
                  value={detailFields.engine_make}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_make: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_engine_model">Engine Model</Label>
                <Input
                  id="hv_engine_model"
                  value={detailFields.engine_model}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_model: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_engine_serial_no">Engine Serial No</Label>
                <Input
                  id="hv_engine_serial_no"
                  value={detailFields.engine_serial_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_serial_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_capacity">Capacity</Label>
                <Input
                  id="hv_capacity"
                  value={detailFields.capacity}
                  onChange={(e) => setDetailFields((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_manuf_year">Manufacturing Year</Label>
                <Input
                  id="hv_manuf_year"
                  type="number"
                  value={detailFields.manuf_year}
                  onChange={(e) => setDetailFields((f) => ({ ...f, manuf_year: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_libre">Libre (true/false)</Label>
                <Input
                  id="hv_libre"
                  value={detailFields.libre}
                  onChange={(e) => setDetailFields((f) => ({ ...f, libre: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_tire_size">Tire Size</Label>
                <Input
                  id="hv_tire_size"
                  value={detailFields.tire_size}
                  onChange={(e) => setDetailFields((f) => ({ ...f, tire_size: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_battery_capacity">Battery Capacity</Label>
                <Input
                  id="hv_battery_capacity"
                  value={detailFields.battery_capacity}
                  onChange={(e) => setDetailFields((f) => ({ ...f, battery_capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_insurance_coverage">Insurance Coverage</Label>
                <Input
                  id="hv_insurance_coverage"
                  value={detailFields.insurance_coverage}
                  onChange={(e) => setDetailFields((f) => ({ ...f, insurance_coverage: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hv_bolo_renewal_date">Bolo Renewal Date</Label>
                <Input
                  id="hv_bolo_renewal_date"
                  type="date"
                  value={detailFields.bolo_renewal_date}
                  onChange={(e) => setDetailFields((f) => ({ ...f, bolo_renewal_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {form.category === LIGHT_VEHICLE_CATEGORY && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Light Vehicle Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lv_plate_no">Plate No</Label>
                <Input
                  id="lv_plate_no"
                  value={detailFields.plate_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, plate_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_engine_serial_no">Engine Serial No</Label>
                <Input
                  id="lv_engine_serial_no"
                  value={detailFields.engine_serial_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_serial_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_capacity">Capacity</Label>
                <Input
                  id="lv_capacity"
                  value={detailFields.capacity}
                  onChange={(e) => setDetailFields((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_manuf_year">Manufacturing Year</Label>
                <Input
                  id="lv_manuf_year"
                  type="number"
                  value={detailFields.manuf_year}
                  onChange={(e) => setDetailFields((f) => ({ ...f, manuf_year: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_libre">Libre (true/false)</Label>
                <Input
                  id="lv_libre"
                  value={detailFields.libre}
                  onChange={(e) => setDetailFields((f) => ({ ...f, libre: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_tire_size">Tire Size</Label>
                <Input
                  id="lv_tire_size"
                  value={detailFields.tire_size}
                  onChange={(e) => setDetailFields((f) => ({ ...f, tire_size: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_battery_capacity">Battery Capacity</Label>
                <Input
                  id="lv_battery_capacity"
                  value={detailFields.battery_capacity}
                  onChange={(e) => setDetailFields((f) => ({ ...f, battery_capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_insurance_coverage">Insurance Coverage</Label>
                <Input
                  id="lv_insurance_coverage"
                  value={detailFields.insurance_coverage}
                  onChange={(e) => setDetailFields((f) => ({ ...f, insurance_coverage: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lv_bolo_renewal_date">Bolo Renewal Date</Label>
                <Input
                  id="lv_bolo_renewal_date"
                  type="date"
                  value={detailFields.bolo_renewal_date}
                  onChange={(e) => setDetailFields((f) => ({ ...f, bolo_renewal_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {form.category === MACHINERY_CATEGORY && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Machinery Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mc_plate_no">Plate No</Label>
                <Input
                  id="mc_plate_no"
                  value={detailFields.plate_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, plate_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_engine_make">Engine Make</Label>
                <Input
                  id="mc_engine_make"
                  value={detailFields.engine_make}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_make: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_engine_model">Engine Model</Label>
                <Input
                  id="mc_engine_model"
                  value={detailFields.engine_model}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_model: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_engine_serial_no">Engine Serial No</Label>
                <Input
                  id="mc_engine_serial_no"
                  value={detailFields.engine_serial_no}
                  onChange={(e) => setDetailFields((f) => ({ ...f, engine_serial_no: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_capacity">Capacity</Label>
                <Input
                  id="mc_capacity"
                  value={detailFields.capacity}
                  onChange={(e) => setDetailFields((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_manuf_year">Manufacturing Year</Label>
                <Input
                  id="mc_manuf_year"
                  type="number"
                  value={detailFields.manuf_year}
                  onChange={(e) => setDetailFields((f) => ({ ...f, manuf_year: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_libre">Libre (true/false)</Label>
                <Input
                  id="mc_libre"
                  value={detailFields.libre}
                  onChange={(e) => setDetailFields((f) => ({ ...f, libre: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_tire_size">Tire Size</Label>
                <Input
                  id="mc_tire_size"
                  value={detailFields.tire_size}
                  onChange={(e) => setDetailFields((f) => ({ ...f, tire_size: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc_battery_capacity">Battery Capacity</Label>
                <Input
                  id="mc_battery_capacity"
                  value={detailFields.battery_capacity}
                  onChange={(e) => setDetailFields((f) => ({ ...f, battery_capacity: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
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

        {shouldShowRates && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rates (Birr per hour)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rate_op">Rate/hr (OP) Birr</Label>
                <Input
                  id="rate_op"
                  type="number"
                  step="0.01"
                  value={detailRates.rate_op}
                  onChange={(e) => setDetailRates((r) => ({ ...r, rate_op: e.target.value }))}
                  placeholder="e.g. 1500.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate_idle">Rate/hr (Idle) Birr</Label>
                <Input
                  id="rate_idle"
                  type="number"
                  step="0.01"
                  value={detailRates.rate_idle}
                  onChange={(e) => setDetailRates((r) => ({ ...r, rate_idle: e.target.value }))}
                  placeholder="e.g. 800.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rate_down">Rate/hr (Down) Birr</Label>
                <Input
                  id="rate_down"
                  type="number"
                  step="0.01"
                  value={detailRates.rate_down}
                  onChange={(e) => setDetailRates((r) => ({ ...r, rate_down: e.target.value }))}
                  placeholder="e.g. 0.00"
                />
              </div>
            </div>
          </div>
        )}
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
          <div className="flex rounded-md border border-input overflow-hidden">
            <span className="inline-flex items-center px-3 py-2 text-sm font-medium bg-muted/60 text-muted-foreground border-r border-input shrink-0">
              +251
            </span>
            <Input
              id="responsible_person_pno"
              value={form.responsible_person_pno.startsWith('+251') ? form.responsible_person_pno.slice(4) : form.responsible_person_pno}
              onChange={(e) => {
                const raw = e.target.value;
                update('responsible_person_pno', raw ? '+251' + raw : '');
              }}
              placeholder="912345678"
              className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="remark">Remark</Label>
          <textarea
            id="remark"
            value={form.remark}
            onChange={(e) => update('remark', e.target.value)}
            placeholder="Remarks"
            rows={3}
            className="flex w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          />
        </div>
        </div>
      </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border/60">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="min-w-[100px]">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving || (isEdit && !isDirty)}
          className="min-w-[120px] bg-primary hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

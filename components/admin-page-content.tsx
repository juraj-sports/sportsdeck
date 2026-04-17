"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAdminAuth } from "@/components/admin-password-gate"
import { AppLogo } from "@/components/app-logo"
import {
  Search, Plus, Pencil, Trash2, Eye, EyeOff, Star, Check, X, Loader2, ExternalLink, RotateCcw, LogOut, ChevronUp, ChevronDown, GripVertical, Upload, ImageIcon
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Scores & News", "Stats & Analytics", "Fantasy & Predictive",
  "Sports Betting", "Writers & Publications", "Communities & Forums",
  "Trivia & Games", "Coaching & Training",
];

const SPORTS = [
  "Basketball", "Hockey", "Baseball", "Football",
  "Soccer", "Tennis", "Golf", "MMA", "Lacrosse",
];

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  url: "",
  description: "",
  image: "",
  tags: [] as string[],
  primarySport: [] as string[],
  reviewWhatIs: "",
  reviewHowItWorks: "",
  reviewPros: "",
  reviewCons: "",
  reviewWorthIt: "",
};

type AppForm = typeof EMPTY_FORM;

// ─── Checkbox group ───────────────────────────────────────────────────────────

function CheckGroup({
  options, value, onChange, max,
}: {
  options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!max || value.length < max) {
      onChange([...value, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            }`}
          >
            {selected && <Check className="w-3 h-3" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── App Edit Sheet ───────────────────────────────────────────────────────────

function AppSheet({
  open, onClose, initial, appId,
}: {
  open: boolean;
  onClose: () => void;
  initial: AppForm;
  appId: Id<"apps"> | null;
}) {
  const [form, setForm] = useState<AppForm>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateApp = useMutation(api.apps.updateApp);
  const createApp = useMutation(api.apps.createApp);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    try {
      setUploading(true);
      console.log("Uploading image via server proxy:", file.name, file.type);

      // Upload via server-side proxy to avoid CORS issues with direct Convex storage fetch
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      const { storageId } = await res.json();
      console.log("Image uploaded, storageId:", storageId);
      // Store the storageId; mutations will resolve it to a URL on save
      set("imageStorageId" as any, storageId);
      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      set("imagePreview" as any, localPreview);
      toast.success("Image ready — click Save to apply");
    } catch (err: any) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sync form when a different app is opened
  const [lastAppId, setLastAppId] = useState<Id<"apps"> | null | "new">(null);
  const sheetKey = appId ?? "new";
  if (sheetKey !== lastAppId) {
    setLastAppId(sheetKey);
    setForm(initial);
  }

  const set = (field: keyof AppForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim() || !form.description.trim()) {
      toast.error("Name, URL, and description are required");
      return;
    }
    setSaving(true);
    try {
      const imageStorageId = (form as any).imageStorageId;
      if (appId) {
        await updateApp({
          appId,
          name: form.name,
          url: form.url,
          description: form.description,
          image: form.image,
          imageStorageId: imageStorageId || undefined,
          tags: form.tags,
          primarySport: form.primarySport,
          reviewWhatIs: form.reviewWhatIs || undefined,
          reviewHowItWorks: form.reviewHowItWorks || undefined,
          reviewPros: form.reviewPros || undefined,
          reviewCons: form.reviewCons || undefined,
          reviewWorthIt: form.reviewWorthIt || undefined,
        });
        toast.success("App updated");
      } else {
        await createApp({
          name: form.name,
          url: form.url,
          description: form.description,
          image: form.image,
          imageStorageId: imageStorageId || undefined,
          tags: form.tags,
          primarySport: form.primarySport,
          reviewWhatIs: form.reviewWhatIs || undefined,
          reviewHowItWorks: form.reviewHowItWorks || undefined,
          reviewPros: form.reviewPros || undefined,
          reviewCons: form.reviewCons || undefined,
          reviewWorthIt: form.reviewWorthIt || undefined,
        });
        toast.success("App created");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{appId ? "Edit App" : "Add New App"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Basics */}
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">App Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ESPN" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">URL *</Label>
              <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://espn.com" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What does this app do?"
                rows={3}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Logo Image</Label>
              {/* Upload area */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload image"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {/* Preview */}
                {((form as any).imagePreview || form.image) && (
                  <img
                    src={(form as any).imagePreview || form.image}
                    alt="preview"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                )}
                {!(form as any).imagePreview && !(form.image) && (
                  <div className="w-10 h-10 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
              {/* URL fallback */}
              <p className="text-xs text-gray-400 mt-2 mb-1">or paste a URL</p>
              <Input
                value={form.image}
                onChange={(e) => {
                  set("image", e.target.value);
                  set("imagePreview" as any, "");
                  set("imageStorageId" as any, undefined);
                }}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Category */}
          <div>
            <Label className="mb-2 block text-sm font-medium">Category <span className="text-gray-400 font-normal">(pick up to 3)</span></Label>
            <CheckGroup options={CATEGORIES} value={form.tags} onChange={(v) => set("tags", v)} max={3} />
          </div>

          {/* Sport */}
          <div>
            <Label className="mb-2 block text-sm font-medium">Primary Sport</Label>
            <CheckGroup options={SPORTS} value={form.primarySport} onChange={(v) => set("primarySport", v)} />
          </div>

          <hr className="border-gray-100" />

          {/* Review content */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-4">Review Content <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="space-y-4">
              {
                [
                  { key: "reviewWhatIs", label: "What is it?" },
                  { key: "reviewHowItWorks", label: "How does it work?" },
                  { key: "reviewPros", label: "Pros" },
                  { key: "reviewCons", label: "Cons" },
                  { key: "reviewWorthIt", label: "Is it worth using?" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</Label>
                    <Textarea
                      value={(form as any)[key]}
                      onChange={(e) => set(key as keyof AppForm, e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 mt-8 flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gray-900 hover:bg-gray-700 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving…" : appId ? "Save changes" : "Create app"}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


// ─── Apps Tab ─────────────────────────────────────────────────────────────────

function AppsTab() {
  const apps = useQuery(api.apps.getAllApprovedApps) ?? [];
  const featuredApps = useQuery(api.featured_apps.getFeaturedApps) ?? [];
  const deleteApp = useMutation(api.apps.deleteApp);
  const updateApp = useMutation(api.apps.updateApp);
  const addFeatured = useMutation(api.featured_apps.addFeaturedApp);
  const removeFeatured = useMutation(api.featured_apps.removeFeaturedApp);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterSport, setFilterSport] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<(typeof apps)[0] | null>(null);

  const featuredIds = new Set(featuredApps.map((a) => a._id));

  const filtered = apps
    .filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory && !a.tags?.includes(filterCategory)) return false;
      if (filterSport && !a.primarySport?.includes(filterSport)) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const hasFilters = filterCategory || filterSport;

  const openNew = () => { setEditingApp(null); setSheetOpen(true); };
  const openEdit = (app: (typeof apps)[0]) => { setEditingApp(app); setSheetOpen(true); };

  const handleDelete = async (appId: Id<"apps">, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteApp({ appId });
    toast.success("App deleted");
  };

  const toggleVisibility = async (app: (typeof apps)[0]) => {
    await updateApp({
      appId: app._id,
      name: app.name,
      url: app.url,
      description: app.description,
      image: app.image ?? "",
      tags: app.tags,
      primarySport: app.primarySport,
      visible: !(app.visible !== false),
    });
  };

  const toggleFeatured = async (app: (typeof apps)[0]) => {
    if (featuredIds.has(app._id)) {
      await removeFeatured({ appId: app._id });
    } else {
      await addFeatured({ appId: app._id });
    }
  };

  const getInitialForm = (): AppForm => editingApp ? {
    name: editingApp.name,
    url: editingApp.url,
    description: editingApp.description,
    image: editingApp.image ?? "",
    tags: editingApp.tags ?? [],
    primarySport: editingApp.primarySport ?? [],
    reviewWhatIs: editingApp.reviewWhatIs ?? "",
    reviewHowItWorks: editingApp.reviewHowItWorks ?? "",
    reviewPros: editingApp.reviewPros ?? "",
    reviewCons: editingApp.reviewCons ?? "",
    reviewWorthIt: editingApp.reviewWorthIt ?? "",
  } : { ...EMPTY_FORM };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search apps…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory ?? ""}
            onChange={(e) => setFilterCategory(e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sport filter */}
          <select
            value={filterSport ?? ""}
            onChange={(e) => setFilterSport(e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white hover:border-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
          >
            <option value="">All Sports</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterCategory(null); setFilterSport(null); }}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear filters"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <span className="text-sm text-gray-400 ml-auto">{filtered.length} apps</span>
          <Button onClick={openNew} className="bg-gray-900 hover:bg-gray-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add App
          </Button>
        </div>


      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">App</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3 hidden lg:table-cell">Sport</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((app) => {
              const visible = app.visible !== false;
              const featured = featuredIds.has(app._id);
              return (
                <tr key={app._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <AppLogo
                          src={app.image}
                          appUrl={app.url}
                          alt={app.name}
                          className="w-full h-full object-cover"
                          fallback={<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">{app.name[0]}</div>}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{app.name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[180px]">{app.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-600 text-xs">{app.tags?.[0] ?? <span className="text-gray-300">—</span>}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-600 text-xs">{app.primarySport?.[0] ?? <span className="text-gray-300">—</span>}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Visit"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => toggleFeatured(app)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          featured ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                        title={featured ? "Remove from featured" : "Add to featured"}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleVisibility(app)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          !visible ? "text-gray-300 hover:text-gray-500 hover:bg-gray-100" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                        title={visible ? "Hide" : "Show"}
                      >
                        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(app)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id, app.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No apps found</p>
          </div>
        )}
      </div>

      <AppSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={getInitialForm()}
        appId={editingApp?._id ?? null}
      />
    </div>
  );
}

// ─── Submission card ──────────────────────────────────────────────────────────

function SubmissionCard({
  app, actions,
}: {
  app: any;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 mt-0.5">
        <AppLogo
          src={app.image}
          appUrl={app.url}
          alt={app.name}
          className="w-full h-full object-cover"
          fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">{app.name[0]}</div>}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-gray-900">{app.name}</div>
            <div className="text-sm text-gray-500 mt-0.5 line-clamp-2">{app.description}</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {app.suggestedCategories?.map((c: string) => (
                <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
              ))}
              {app.suggestedSports?.map((s: string) => (
                <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
            <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline mt-1 inline-flex items-center gap-1">
              {app.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2 shrink-0">{actions}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Submissions Tab ──────────────────────────────────────────────────────────

function SubmissionsTab() {
  const submissions = useQuery(api.apps.getSubmittedApps) ?? [];
  const rejected = useQuery(api.apps.getRejectedApps) ?? [];
  const approveApp = useMutation(api.apps.approveApp);
  const rejectApp = useMutation(api.apps.rejectApp);
  const deleteApp = useMutation(api.apps.deleteApp);

  const [view, setView] = useState<"pending" | "rejected">("pending");

  const handleApprove = async (appId: Id<"apps">, name: string) => {
    await approveApp({ appId });
    toast.success(`"${name}" approved and published`);
  };

  const handleReject = async (appId: Id<"apps">, name: string) => {
    await rejectApp({ appId });
    toast.success(`"${name}" rejected`);
  };

  const handleRestore = async (appId: Id<"apps">, name: string) => {
    await approveApp({ appId });
    toast.success(`"${name}" restored and published`);
  };

  const handleDelete = async (appId: Id<"apps">, name: string) => {
    if (!confirm(`Permanently delete "${name}"?`)) return;
    await deleteApp({ appId });
    toast.success("Deleted permanently");
  };

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setView("pending")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            view === "pending" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          Pending
          {submissions.length > 0 && (
            <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${view === "pending" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
              {submissions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setView("rejected")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            view === "rejected" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          Rejected
          {rejected.length > 0 && (
            <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${view === "rejected" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
              {rejected.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending */}
      {view === "pending" && (
        submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Check className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((app) => (
              <SubmissionCard
                key={app._id}
                app={app}
                actions={
                  <>
                    <Button size="sm" onClick={() => handleApprove(app._id, app.name)} className="bg-gray-900 hover:bg-gray-700 text-white gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(app._id, app.name)} className="text-red-500 hover:text-red-700 hover:border-red-200 gap-1.5">
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )
      )}

      {/* Rejected */}
      {view === "rejected" && (
        rejected.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <X className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No rejected submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rejected.map((app) => (
              <SubmissionCard
                key={app._id}
                app={app}
                actions={
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleRestore(app._id, app.name)} className="text-green-600 hover:text-green-700 hover:border-green-200 gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(app._id, app.name)} className="text-red-500 hover:text-red-700 hover:border-red-200 gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Featured Tab ─────────────────────────────────────────────────────────────

function FeaturedTab() {
  const featuredApps = useQuery(api.featured_apps.getFeaturedApps) ?? [];
  const removeFeatured = useMutation(api.featured_apps.removeFeaturedApp);
  const reorderFeatured = useMutation(api.featured_apps.reorderFeaturedApps);
  const allApps = useQuery(api.apps.getAllApprovedApps) ?? [];
  const addFeatured = useMutation(api.featured_apps.addFeaturedApp);

  const [search, setSearch] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const featuredIds = new Set(featuredApps.map((a) => a._id));
  const suggestions = allApps
    .filter((a) => !featuredIds.has(a._id) && a.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 8);

  const handleDrop = async (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) return;
    const ids = featuredApps.map((a) => a._id);
    const [moved] = ids.splice(dragIndex, 1);
    ids.splice(toIndex, 0, moved);
    setDragIndex(null);
    setDragOverIndex(null);
    try {
      await reorderFeatured({ appIds: ids });
    } catch {
      toast.error("Failed to reorder");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Current featured */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Currently Featured <span className="text-gray-400 font-normal">({featuredApps.length})</span></h3>
        <p className="text-xs text-gray-400 mb-3">Drag to reorder</p>
        <div className="space-y-2">
          {featuredApps.length === 0 && (
            <p className="text-sm text-gray-400 py-4">No featured apps yet</p>
          )}
          {featuredApps.map((app, i) => (
            <div
              key={app._id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDrop={(e) => { e.preventDefault(); handleDrop(i); }}
              className={`flex items-center gap-3 p-3 border rounded-xl bg-white cursor-grab active:cursor-grabbing select-none transition-all ${
                dragIndex === i
                  ? "opacity-40 border-gray-200"
                  : dragOverIndex === i
                  ? "border-[#ea590e] shadow-md scale-[1.01]"
                  : "border-gray-100 hover:bg-gray-50"
              }`}
            >
              <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
              <span className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}</span>
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <AppLogo
                  src={app.image}
                  appUrl={app.url}
                  alt={app.name}
                  className="w-full h-full object-cover"
                  fallback={<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">{app.name[0]}</div>}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{app.name}</div>
                <div className="text-xs text-gray-400 truncate">{app.tags?.[0]}</div>
              </div>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => removeFeatured({ appId: app._id })}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add from list */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add to Featured</h3>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search apps…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          {suggestions.map((app) => (
            <div key={app._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <AppLogo
                  src={app.image}
                  appUrl={app.url}
                  alt={app.name}
                  className="w-full h-full object-cover"
                  fallback={<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">{app.name[0]}</div>}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{app.name}</div>
                <div className="text-xs text-gray-400 truncate">{app.tags?.[0]}</div>
              </div>
              <button
                onClick={() => addFeatured({ appId: app._id })}
                className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                title="Add to featured"
              >
                <Star className="w-4 h-4" />
              </button>
            </div>
          ))}
          {search && suggestions.length === 0 && (
            <p className="text-sm text-gray-400 py-2 text-center">No apps found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ordering Tab ─────────────────────────────────────────────────────────────

function OrderingTab() {
  const allApps = useQuery(api.apps.getAllApprovedApps) ?? [];
  const categoryOrders = useQuery(api.apps.getCategoryOrders) ?? [];
  const setCategoryOrder = useMutation(api.apps.setCategoryOrder);

  const [localOrders, setLocalOrders] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Build the display order for a category
  const getOrderedApps = (cat: string) => {
    const catApps = allApps.filter((a) => a.tags?.includes(cat));

    if (localOrders[cat]) {
      // Use local state
      const idToApp = Object.fromEntries(catApps.map((a) => [a._id, a]));
      const ordered = localOrders[cat].map((id) => idToApp[id]).filter(Boolean);
      const remaining = catApps.filter((a) => !localOrders[cat].includes(a._id));
      return [...ordered, ...remaining];
    }

    // Fall back: use saved DB order, then alphabetical
    const dbOrder: Record<string, number> = {};
    categoryOrders
      .filter((e) => e.sectionName === cat)
      .forEach((e) => { dbOrder[e.appId] = e.order; });

    if (Object.keys(dbOrder).length > 0) {
      return [...catApps].sort((a, b) => {
        const aO = dbOrder[a._id] ?? 9999;
        const bO = dbOrder[b._id] ?? 9999;
        if (aO !== bO) return aO - bO;
        return a.name.localeCompare(b.name);
      });
    }

    return [...catApps].sort((a, b) => a.name.localeCompare(b.name));
  };

  const move = (cat: string, index: number, dir: "up" | "down") => {
    const ordered = getOrderedApps(cat);
    const ids = ordered.map((a) => a._id as string);
    const swapWith = dir === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    setLocalOrders((prev) => ({ ...prev, [cat]: ids }));
  };

  const save = async (cat: string) => {
    const ordered = getOrderedApps(cat);
    setSaving(cat);
    try {
      await setCategoryOrder({
        categoryName: cat,
        appIds: ordered.map((a) => a._id),
      });
      toast.success(`Order saved for "${cat}"`);
      // Clear local state — DB is now source of truth
      setLocalOrders((prev) => { const next = { ...prev }; delete next[cat]; return next; });
    } catch (e) {
      toast.error("Failed to save order");
    } finally {
      setSaving(null);
    }
  };

  const hasUnsaved = (cat: string) => !!localOrders[cat];

  const reorder = (cat: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const ordered = getOrderedApps(cat);
    const ids = ordered.map((a) => a._id as string);
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    setLocalOrders((prev) => ({ ...prev, [cat]: ids }));
  };

  const orderedApps = getOrderedApps(activeCategory);

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      {/* Category sidebar */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">Category</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between gap-2 ${
                activeCategory === cat
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{cat}</span>
              {hasUnsaved(cat) && (
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* App list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{activeCategory}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{orderedApps.length} apps · drag to reorder</p>
          </div>
          <button
            onClick={() => save(activeCategory)}
            disabled={!hasUnsaved(activeCategory) || saving === activeCategory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            {saving === activeCategory && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save order
          </button>
        </div>

        {orderedApps.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No apps in this category</div>
        ) : (
          <div className="space-y-2">
            {orderedApps.map((app, i) => (
              <div
                key={app._id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) reorder(activeCategory, dragIndex, i);
                  setDragIndex(null);
                  setDragOverIndex(null);
                }}
                className={`flex items-center gap-3 p-3 border rounded-xl bg-white transition-all cursor-grab active:cursor-grabbing select-none ${
                  dragIndex === i
                    ? "opacity-40 border-gray-200"
                    : dragOverIndex === i
                    ? "border-[#ea590e] shadow-md scale-[1.01]"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="w-6 text-center text-xs font-bold text-gray-400 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <AppLogo
                    src={app.image}
                    appUrl={app.url}
                    alt={app.name}
                    className="w-full h-full object-cover"
                    fallback={<div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">{app.name[0]}</div>}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{app.name}</div>
                  <div className="text-xs text-gray-400 truncate">{app.primarySport?.join(", ")}</div>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => move(activeCategory, i, "up")}
                    disabled={i === 0}
                    className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => move(activeCategory, i, "down")}
                    disabled={i === orderedApps.length - 1}
                    className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPageContent() {
  const submissions = useQuery(api.apps.getSubmittedApps) ?? [];
  const { logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="apps">
          <TabsList className="bg-white border border-gray-100 mb-6 p-1 rounded-xl h-auto">
            <TabsTrigger value="apps" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              Apps
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white relative">
              Submissions
              {submissions.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {submissions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="featured" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              Featured
            </TabsTrigger>
            <TabsTrigger value="ordering" className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              Ordering
            </TabsTrigger>
          </TabsList>

          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <TabsContent value="apps" className="mt-0">
              <AppsTab />
            </TabsContent>
            <TabsContent value="submissions" className="mt-0">
              <SubmissionsTab />
            </TabsContent>
            <TabsContent value="featured" className="mt-0">
              <FeaturedTab />
            </TabsContent>
            <TabsContent value="ordering" className="mt-0">
              <OrderingTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}


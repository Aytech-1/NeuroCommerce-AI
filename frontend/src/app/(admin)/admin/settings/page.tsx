"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  Save,
  Lock,
  Globe,
  Shield,
  RefreshCw,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileCode,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/ui/can";
import { useGroupedSettings, useBulkUpdateSettings } from "@/hooks/use-settings";
import { SettingItem } from "@/services/settings-service";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { data: groupedSettings, isLoading, isError, refetch } = useGroupedSettings();
  const bulkUpdateMutation = useBulkUpdateSettings();

  const [activeGroup, setActiveGroup] = useState<string>("");
  const [formState, setFormState] = useState<Record<string, SettingItem>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (groupedSettings) {
      const groups = Object.keys(groupedSettings);
      if (groups.length > 0 && !activeGroup) {
        setActiveGroup(groups[0]);
      }

      // Initialize form state
      const initial: Record<string, SettingItem> = {};
      Object.values(groupedSettings).flat().forEach((s) => {
        initial[`${s.group}.${s.key}`] = { ...s };
      });
      setFormState(initial);
      setIsDirty(false);
    }
  }, [groupedSettings]);

  const handleValueChange = (group: string, key: string, value: unknown) => {
    setFormState((prev) => {
      const stateKey = `${group}.${key}`;
      const existing = prev[stateKey];
      if (!existing) return prev;
      return {
        ...prev,
        [stateKey]: {
          ...existing,
          value,
        },
      };
    });
    setIsDirty(true);
  };

  const handleSaveGroup = async () => {
    if (!activeGroup || !groupedSettings) return;

    const currentGroupSettings = Object.values(formState).filter(
      (s) => s.group.toLowerCase() === activeGroup.toLowerCase()
    );

    try {
      await bulkUpdateMutation.mutateAsync(currentGroupSettings);
      toast.success(`Settings for group "${activeGroup}" saved successfully!`);
      setIsDirty(false);
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  const groups = groupedSettings ? Object.keys(groupedSettings) : [];
  const allSettingsList = groupedSettings ? Object.values(groupedSettings).flat() : [];
  const totalSettingsCount = allSettingsList.length;
  const publicCount = allSettingsList.filter((s) => s.is_public).length;
  const encryptedCount = allSettingsList.filter((s) => s.type === "encrypted").length;

  const currentSettings = activeGroup
    ? Object.values(formState).filter(
        (s) =>
          s.group.toLowerCase() === activeGroup.toLowerCase() &&
          (!search ||
            s.key.toLowerCase().includes(search.toLowerCase()) ||
            (s.description && s.description.toLowerCase().includes(search.toLowerCase())))
      )
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Settings
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              SYSTEM CONFIGURATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Settings &amp; Configuration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage the operational configuration of the NeuroCommerce platform.
            </p>
          </div>

          <Can permission="setting.update">
            <Button
              onClick={handleSaveGroup}
              disabled={!isDirty || bulkUpdateMutation.isPending}
              isLoading={bulkUpdateMutation.isPending}
              className="h-10 px-5 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Changes</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. KPI SUMMARY ROW                                                      */}
      {/* ======================================================================= */}
      {groups.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Configuration Groups
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {groups.length} Namespaces
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Parameters
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {totalSettingsCount} Settings
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Public Endpoints
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {publicCount} Public
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Encrypted Secrets
            </span>
            <span className="text-xl font-extrabold text-slate-800 mt-1 block">
              {encryptedCount} Encrypted
            </span>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. SETTINGS WORKSPACE                                                   */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Skeleton className="h-64 rounded-[20px]" />
          <Skeleton className="h-96 md:col-span-3 rounded-[20px]" />
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load system settings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to retrieve the current system configuration.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Left: Group Navigation Rail */}
          <div className="space-y-3">
            <div className="p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                Namespaces
              </span>
              {groups.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => {
                    setActiveGroup(grp);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all text-left ${
                    activeGroup === grp
                      ? "bg-blue-50 text-blue-700 font-extrabold border border-blue-100 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                  }`}
                >
                  <span className="capitalize">{grp.replace("_", " ")}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 font-mono">
                    {groupedSettings?.[grp]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Group Settings Editor */}
          <div className="space-y-6 md:col-span-3">
            <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
              {/* Group Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 capitalize">
                      {activeGroup.replace("_", " ")} Configuration
                    </h2>
                    {isDirty && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure parameters in the <span className="font-mono text-slate-700 font-bold">{activeGroup}</span> namespace.
                  </p>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search in namespace..."
                    prefixIcon={<Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 rounded-xl bg-slate-50 border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Setting Items */}
              <div className="space-y-4">
                {currentSettings.map((setting) => {
                  const stateKey = `${setting.group}.${setting.key}`;
                  return (
                    <div
                      key={stateKey}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3.5 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900 font-mono">
                              {setting.key}
                            </span>
                            {setting.is_public ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Globe className="h-2.5 w-2.5" />
                                <span>Public</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                <Lock className="h-2.5 w-2.5" />
                                <span>Internal</span>
                              </span>
                            )}
                            {setting.type === "encrypted" && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                <Shield className="h-2.5 w-2.5" />
                                <span>Secret</span>
                              </span>
                            )}
                          </div>
                          {setting.description && (
                            <p className="text-xs text-slate-500 mt-1">{setting.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Type-Safe Controls */}
                      <div>
                        {setting.type === "boolean" ? (
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(setting.value)}
                              onChange={(e) =>
                                handleValueChange(setting.group, setting.key, e.target.checked)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{setting.value ? "Enabled" : "Disabled"}</span>
                          </label>
                        ) : setting.type === "encrypted" ? (
                          <div className="space-y-1.5">
                            <Input
                              type="password"
                              placeholder="••••••••••••••••"
                              value={typeof setting.value === "string" ? setting.value : ""}
                              onChange={(e) =>
                                handleValueChange(setting.group, setting.key, e.target.value)
                              }
                              className="h-11 rounded-xl bg-white border-slate-200 text-xs font-mono"
                            />
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Encrypted in database. Leave unchanged to keep existing value.
                            </span>
                          </div>
                        ) : setting.type === "json" ? (
                          <Textarea
                            rows={3}
                            className="font-mono text-xs rounded-xl bg-white border-slate-200"
                            value={
                              typeof setting.value === "object"
                                ? JSON.stringify(setting.value, null, 2)
                                : String(setting.value || "")
                            }
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                handleValueChange(setting.group, setting.key, parsed);
                              } catch {
                                handleValueChange(setting.group, setting.key, e.target.value);
                              }
                            }}
                          />
                        ) : setting.type === "integer" ? (
                          <Input
                            type="number"
                            value={Number(setting.value ?? 0)}
                            onChange={(e) =>
                              handleValueChange(
                                setting.group,
                                setting.key,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="h-11 rounded-xl bg-white border-slate-200 text-xs"
                          />
                        ) : (
                          <Input
                            value={String(setting.value ?? "")}
                            onChange={(e) =>
                              handleValueChange(setting.group, setting.key, e.target.value)
                            }
                            className="h-11 rounded-xl bg-white border-slate-200 text-xs"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Save Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {currentSettings.length} parameters in view
                </span>
                <Can permission="setting.update">
                  <Button
                    onClick={handleSaveGroup}
                    disabled={!isDirty || bulkUpdateMutation.isPending}
                    isLoading={bulkUpdateMutation.isPending}
                    className="h-10 px-5 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    <span>Save Changes</span>
                  </Button>
                </Can>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Sliders}
          title="No Settings Found"
          description="System configuration parameters will appear once initialized."
        />
      )}
    </div>
  );
}

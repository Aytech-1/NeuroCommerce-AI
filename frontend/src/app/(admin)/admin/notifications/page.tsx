"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Plus,
  Send,
  FileText,
  Mail,
  Smartphone,
  Radio,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  Shield,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can } from "@/components/ui/can";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useAdminNotifications,
  useAdminUnreadCount,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useNotificationTemplates,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useBroadcastNotificationMutation,
} from "@/hooks/use-notifications";
import {
  AdminNotificationItem,
  NotificationTemplateItem,
  NotificationChannelType,
} from "@/services/notification-service";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "templates" | "broadcast">("inbox");
  const [inboxFilter, setInboxFilter] = useState<"all" | "unread" | "read">("all");
  const [searchInbox, setSearchInbox] = useState("");

  // Templates filter
  const [templateChannelFilter, setTemplateChannelFilter] = useState<string>("all");
  const [templateSearch, setTemplateSearch] = useState("");

  // Modals & Drawers state
  const [selectedNotification, setSelectedNotification] = useState<AdminNotificationItem | null>(null);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateItem | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [isBroadcastConfirmOpen, setIsBroadcastConfirmOpen] = useState(false);

  // Template Form State
  const [templateForm, setTemplateForm] = useState({
    name: "",
    channel: "email" as NotificationChannelType,
    notification_type: "order_confirmation",
    subject: "",
    body_template: "",
    variables: "",
    is_active: true,
  });

  // Broadcast Form State
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    body: "",
    channel: "database" as NotificationChannelType,
    target_user_ids: "",
  });

  // Queries
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    isFetching: isFetchingNotifications,
    refetch: refetchNotifications,
  } = useAdminNotifications({ per_page: 50 });

  const { data: unreadData, refetch: refetchUnread } = useAdminUnreadCount();

  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    isFetching: isFetchingTemplates,
    refetch: refetchTemplates,
  } = useNotificationTemplates({
    channel: templateChannelFilter !== "all" ? templateChannelFilter : undefined,
    search: templateSearch.trim() || undefined,
    per_page: 50,
  });

  // Mutations
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const createTemplateMutation = useCreateTemplateMutation();
  const updateTemplateMutation = useUpdateTemplateMutation();
  const deleteTemplateMutation = useDeleteTemplateMutation();
  const broadcastMutation = useBroadcastNotificationMutation();

  const handleRefreshAll = async () => {
    try {
      await Promise.all([refetchNotifications(), refetchUnread(), refetchTemplates()]);
      toast.success("Notification telemetry synchronized");
    } catch {
      toast.error("Failed to synchronize notifications");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to update notification state");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  // Template creation / update handlers
  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      channel: "email",
      notification_type: "order_confirmation",
      subject: "",
      body_template: "",
      variables: "customer_name, order_number, grand_total",
      is_active: true,
    });
    setIsCreateTemplateOpen(true);
  };

  const handleOpenEditTemplate = (template: NotificationTemplateItem) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      channel: template.channel,
      notification_type: template.notification_type,
      subject: template.subject || "",
      body_template: template.body_template,
      variables: Array.isArray(template.variables) ? template.variables.join(", ") : "",
      is_active: template.is_active,
    });
    setIsCreateTemplateOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.body_template.trim()) {
      toast.error("Please fill in the template name and body");
      return;
    }

    const variablesArray = templateForm.variables
      ? templateForm.variables.split(",").map((v) => v.trim()).filter(Boolean)
      : [];

    try {
      if (editingTemplate) {
        await updateTemplateMutation.mutateAsync({
          id: editingTemplate.id,
          payload: {
            name: templateForm.name.trim(),
            channel: templateForm.channel,
            notification_type: templateForm.notification_type,
            subject: templateForm.subject.trim() || null,
            body_template: templateForm.body_template.trim(),
            variables: variablesArray,
            is_active: templateForm.is_active,
          },
        });
        toast.success("Template updated successfully");
      } else {
        await createTemplateMutation.mutateAsync({
          name: templateForm.name.trim(),
          channel: templateForm.channel,
          notification_type: templateForm.notification_type,
          subject: templateForm.subject.trim() || null,
          body_template: templateForm.body_template.trim(),
          variables: variablesArray,
          is_active: templateForm.is_active,
        });
        toast.success("Template created successfully");
      }
      setIsCreateTemplateOpen(false);
    } catch {
      toast.error("Failed to save template");
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplateId) return;
    try {
      await deleteTemplateMutation.mutateAsync(deletingTemplateId);
      toast.success("Template deleted successfully");
      setDeletingTemplateId(null);
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const handleExecuteBroadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.body.trim()) {
      toast.error("Title and body are required for broadcast");
      return;
    }

    const userIds = broadcastForm.target_user_ids
      ? broadcastForm.target_user_ids.split(",").map((id) => id.trim()).filter(Boolean)
      : undefined;

    try {
      const result = await broadcastMutation.mutateAsync({
        title: broadcastForm.title.trim(),
        body: broadcastForm.body.trim(),
        channel: broadcastForm.channel,
        target_user_ids: userIds,
      });

      toast.success(`Broadcast successfully dispatched to ${result.dispatched_count} recipient(s)`);
      setIsBroadcastConfirmOpen(false);
      setBroadcastForm({
        title: "",
        body: "",
        channel: "database",
        target_user_ids: "",
      });
      refetchNotifications();
      refetchUnread();
    } catch {
      toast.error("Failed to dispatch broadcast");
    }
  };

  // In-App Notifications filter
  const rawNotifications: AdminNotificationItem[] = notificationsData?.data || [];
  const filteredNotifications = useMemo(() => {
    return rawNotifications.filter((n: AdminNotificationItem) => {
      if (inboxFilter === "unread" && n.read_at) return false;
      if (inboxFilter === "read" && !n.read_at) return false;
      if (searchInbox.trim()) {
        const query = searchInbox.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          (n.body && n.body.toLowerCase().includes(query)) ||
          n.type.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [rawNotifications, inboxFilter, searchInbox]);

  const rawTemplates: NotificationTemplateItem[] = templatesData?.data || [];
  const unreadCount = unreadData?.unread_count ?? rawNotifications.filter((n: AdminNotificationItem) => !n.read_at).length;
  const totalNotifications = notificationsData?.meta?.total ?? rawNotifications.length;
  const activeTemplatesCount = rawTemplates.filter((t: NotificationTemplateItem) => t.is_active).length;

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "email":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Mail className="h-3 w-3" /> Email
          </span>
        );
      case "sms":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Smartphone className="h-3 w-3" /> SMS
          </span>
        );
      case "push":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Radio className="h-3 w-3" /> Push
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Bell className="h-3 w-3" /> In-App
          </span>
        );
    }
  };

  // Helper to extract safe deep links from notification payload
  const extractSourceLink = (data: Record<string, unknown> | null) => {
    if (!data) return null;
    if (data.order_id) return { href: `/admin/orders/${data.order_id}`, label: "View Order" };
    if (data.order_number) return { href: `/admin/orders`, label: `#${data.order_number}` };
    if (data.shipment_id) return { href: `/admin/shipments/${data.shipment_id}`, label: "View Shipment" };
    if (data.invoice_id) return { href: `/admin/invoices/${data.invoice_id}`, label: "View Invoice" };
    if (data.customer_id) return { href: `/admin/customers/${data.customer_id}`, label: "View Customer" };
    if (data.action_url && typeof data.action_url === "string" && data.action_url.startsWith("/admin")) {
      return { href: data.action_url, label: "View Record" };
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. BREADCRUMB & EXECUTIVE HEADER */}
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Admin Portal</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Notifications & Communication Center
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Bell className="h-4 w-4" />
              <span>OPERATIONAL COMMUNICATIONS & NOTIFICATION DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Notification & Communication Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              In-app administrator alerts, event-driven email/SMS templates, and broadcast message dispatching across transactional and commercial boundaries.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isFetchingNotifications || isFetchingTemplates}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isFetchingNotifications || isFetchingTemplates ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>

            {activeTab === "inbox" && unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                Mark All Read
              </Button>
            )}

            {activeTab === "templates" && (
              <Can permission="notification.create">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateTemplate}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  New Template
                </Button>
              </Can>
            )}
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In-App Alerts */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Alerts</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {isLoadingNotifications ? "..." : totalNotifications}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              In-app administrator event stream
            </div>
          </div>
        </div>

        {/* Unread Alerts */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unread Alerts</span>
            <div className={`p-1.5 rounded-lg ${unreadCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {unreadCount}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {unreadCount > 0 ? "Requires operational attention" : "All alerts reviewed"}
            </div>
          </div>
        </div>

        {/* Communication Templates */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Templates</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">
              {isLoadingTemplates ? "..." : activeTemplatesCount}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Of {rawTemplates.length} total defined templates
            </div>
          </div>
        </div>

        {/* Multi-Channel Engine */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Channel Engine</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              4 Channels Operational
            </div>
            <div className="mt-1 text-xs text-slate-500 flex gap-2">
              <span>Email</span> • <span>SMS</span> • <span>Push</span> • <span>In-App</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NOTIFICATION OPERATIONS TABS */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "inbox"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bell className="h-4 w-4" />
            In-App Alerts ({unreadCount})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "templates"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            Communication Templates ({rawTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "broadcast"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Send className="h-4 w-4" />
            Broadcast Dispatcher
          </button>
        </div>

        {/* TAB 1: IN-APP ALERTS & OPERATIONAL LOGS */}
        {activeTab === "inbox" && (
          <div className="p-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search alerts by title or type..."
                    value={searchInbox}
                    onChange={(e) => setSearchInbox(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Read/Unread Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {(["all", "unread", "read"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setInboxFilter(filter)}
                    className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                      inboxFilter === filter
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts Table */}
            {isLoadingNotifications ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Notifications Found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {inboxFilter === "unread"
                    ? "You have zero unread notifications."
                    : "No notifications match your current filter."}
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                {filteredNotifications.map((notif) => {
                  const isUnread = !notif.read_at;
                  const sourceLink = extractSourceLink(notif.data);

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isUnread ? "bg-blue-50/30 hover:bg-blue-50/60" : "bg-white hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isUnread ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {notif.title}
                            </span>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                            )}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                              {notif.type}
                            </span>
                          </div>
                          {notif.body && (
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {notif.body}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>{formatDate(notif.created_at)}</span>
                            {notif.read_at && (
                              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Read {formatDate(notif.read_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {sourceLink && (
                          <Link
                            href={sourceLink.href}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                          >
                            <span>{sourceLink.label}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNotification(notif)}
                          className="text-slate-600 hover:text-slate-900 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Button>

                        {isUnread && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkRead(notif.id)}
                            disabled={markReadMutation.isPending}
                            className="text-xs border-slate-300"
                          >
                            <CheckCheck className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMMUNICATION TEMPLATES */}
        {activeTab === "templates" && (
          <div className="p-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-64">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="pl-9 h-8 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {(["all", "email", "sms", "push", "database"] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setTemplateChannelFilter(ch)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                        templateChannelFilter === ch
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {ch === "all" ? "All Channels" : ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Table */}
            {isLoadingTemplates ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : rawTemplates.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Templates Located</p>
                <p className="text-xs text-slate-500 mt-1">
                  Create a new notification template or adjust your channel filter.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Template Name & Type</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Subject Line</th>
                      <th className="py-3 px-4">Variables</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawTemplates.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{tpl.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {tpl.notification_type}
                          </div>
                        </td>
                        <td className="py-3 px-4">{getChannelBadge(tpl.channel)}</td>
                        <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">
                          {tpl.subject || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {Array.isArray(tpl.variables) && tpl.variables.length > 0 ? (
                              tpl.variables.map((v) => (
                                <span
                                  key={v}
                                  className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200"
                                >
                                  {`{{ ${v} }}`}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tpl.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Can permission="notification.update">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditTemplate(tpl)}
                                className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Can>
                            <Can permission="notification.delete">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingTemplateId(tpl.id)}
                                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-800"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </Can>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SYSTEM BROADCAST DISPATCHER */}
        {activeTab === "broadcast" && (
          <div className="p-6 max-w-2xl space-y-6">
            <div className="border border-blue-200 bg-blue-50/50 p-4 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Broadcast Authority:</span> Dispatches operational or emergency announcements to users across chosen communication channels. When no target user IDs are supplied, the broadcast targets all registered users.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Broadcast Channel
                </label>
                <select
                  value={broadcastForm.channel}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      channel: e.target.value as NotificationChannelType,
                    })
                  }
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-blue-600"
                >
                  <option value="database">In-App Notification (database)</option>
                  <option value="email">Email Notification (email)</option>
                  <option value="sms">SMS Notification (sms)</option>
                  <option value="push">Push Notification (push)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Broadcast Title
                </label>
                <Input
                  placeholder="e.g. Scheduled System Maintenance Notification"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Broadcast Message Body
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter broadcast message text..."
                  value={broadcastForm.body}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target User IDs (Optional)
                </label>
                <Input
                  placeholder="Leave empty for all users, or comma-separated UUIDs"
                  value={broadcastForm.target_user_ids}
                  onChange={(e) =>
                    setBroadcastForm({ ...broadcastForm, target_user_ids: e.target.value })
                  }
                  className="text-xs h-9 font-mono"
                />
              </div>

              <Can permission="notification.send">
                <Button
                  variant="primary"
                  onClick={() => setIsBroadcastConfirmOpen(true)}
                  disabled={!broadcastForm.title.trim() || !broadcastForm.body.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold w-full sm:w-auto"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Dispatch Broadcast
                </Button>
              </Can>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Notification Details Inspection */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Notification Telemetry</h3>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Title</span>
                <span className="font-semibold text-slate-900">{selectedNotification.title}</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Type</span>
                <span className="font-mono text-slate-700">{selectedNotification.type}</span>
              </div>

              {selectedNotification.body && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Body Content</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedNotification.body}
                  </p>
                </div>
              )}

              {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Structured Payload (Sanitized)
                  </span>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-[11px] mt-1 font-mono">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                <span>Created: {formatDate(selectedNotification.created_at)}</span>
                {selectedNotification.read_at && (
                  <span className="text-emerald-600 font-semibold">
                    Read: {formatDate(selectedNotification.read_at)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedNotification(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Template */}
      {isCreateTemplateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTemplate ? "Edit Template" : "Create Notification Template"}
              </h3>
              <button
                onClick={() => setIsCreateTemplateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Template Name (Unique identifier)
                </label>
                <Input
                  required
                  placeholder="e.g. order_confirmation_email"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Channel
                  </label>
                  <select
                    value={templateForm.channel}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        channel: e.target.value as NotificationChannelType,
                      })
                    }
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-blue-600"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                    <option value="database">In-App (database)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Notification Type
                  </label>
                  <Input
                    required
                    placeholder="e.g. order_confirmation"
                    value={templateForm.notification_type}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, notification_type: e.target.value })
                    }
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Line (Email / Push)
                </label>
                <Input
                  placeholder="e.g. Order Confirmation #{{ order_number }}"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Body Template
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hello {{ customer_name }}, your order #{{ order_number }} has been processed."
                  value={templateForm.body_template}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, body_template: e.target.value })
                  }
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Variables (Comma-separated)
                </label>
                <Input
                  placeholder="e.g. customer_name, order_number, grand_total"
                  value={templateForm.variables}
                  onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tpl_active"
                  checked={templateForm.is_active}
                  onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="tpl_active" className="text-xs font-semibold text-slate-700">
                  Active (Allow system dispatch via this template)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateTemplateOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG: Delete Template */}
      <ConfirmDialog
        open={!!deletingTemplateId}
        onOpenChange={(open) => !open && setDeletingTemplateId(null)}
        title="Delete Notification Template"
        description="Are you sure you want to permanently delete this communication template? Any listeners expecting this template will fall back to default text."
        confirmText="Delete Template"
        variant="danger"
        onConfirm={handleDeleteTemplate}
      />

      {/* CONFIRM DIALOG: Broadcast Dispatch */}
      <ConfirmDialog
        open={isBroadcastConfirmOpen}
        onOpenChange={setIsBroadcastConfirmOpen}
        title="Confirm Operational Broadcast"
        description={`You are about to dispatch a broadcast across channel [${broadcastForm.channel.toUpperCase()}]. Are you sure you wish to initiate transmission?`}
        confirmText="Execute Broadcast"
        variant="default"
        onConfirm={handleExecuteBroadcast}
      />
    </div>
  );
}

import { _ as __nuxt_component_0$1 } from './nuxt-link-BtQrV7j8.mjs';
import { defineComponent, ref, watch, computed, mergeProps, unref, isRef, inject, withCtx, createTextVNode, toDisplayString, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderTeleport } from 'vue/server-renderer';
import { d as useSupabase, a as useAuth, e as useState } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import '@supabase/supabase-js';
import '@prisma/client';
import '@prisma/adapter-pg';
import 'pg';
import '@google-cloud/dialogflow';
import 'uuid';
import 'nodemailer';
import 'twilio';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:url';
import 'ipx';
import 'node:fs';
import 'node:path';
import 'pinia';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const toastMaxInjectionKey = /* @__PURE__ */ Symbol("nuxt-ui.toast-max");
function useToast() {
  const toasts = useState("toasts", () => []);
  const max = inject(toastMaxInjectionKey, void 0);
  const running = ref(false);
  const queue = [];
  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  async function processQueue() {
    if (running.value || queue.length === 0) {
      return;
    }
    running.value = true;
    while (queue.length > 0) {
      const toast = queue.shift();
      await nextTick();
      toasts.value = [...toasts.value, toast].slice(-(max?.value ?? 5));
    }
    running.value = false;
  }
  function add(toast) {
    const body = {
      id: generateId(),
      open: true,
      ...toast
    };
    queue.push(body);
    processQueue();
    return body;
  }
  function update(id, toast) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index],
        ...toast
      };
    }
  }
  function remove(id) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index],
        open: false
      };
    }
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 200);
  }
  function clear() {
    toasts.value = [];
  }
  return {
    toasts,
    add,
    update,
    remove,
    clear
  };
}
let channel = null;
const useRealtimeNotifications = () => {
  const { supabase } = useSupabase();
  const { user, getAccessToken } = useAuth();
  const toast = useToast();
  const notifications2 = useState("notifications", () => []);
  const loading = ref(false);
  const unreadCount = computed(() => notifications2.value.filter((n) => !n.read).length);
  const fetchNotifications = async () => {
    if (!user.value) return;
    loading.value = true;
    try {
      const token = await getAccessToken();
      if (!token) return;
      const data = await $fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      notifications2.value = data;
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      loading.value = false;
    }
  };
  const subscribe = () => {
    if (!user.value || channel) return;
    channel = supabase.channel(`notifications:${user.value.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Notification",
        filter: `userId=eq.${user.value.id}`
      },
      (payload) => {
        const raw = payload.new;
        if (!raw.createdAt || raw.archived) return;
        const newNotification = {
          ...raw,
          createdAt: raw.createdAt,
          readAt: raw.readAt || null,
          archived: raw.archived || false,
          archivedAt: raw.archivedAt || null
        };
        notifications2.value = [newNotification, ...notifications2.value];
        if (newNotification.type !== "WELCOME") {
          showToast(newNotification);
        }
      }
    ).subscribe();
  };
  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
  const showToast = (notification) => {
    const iconMap = {
      SUBMISSION_RECEIVED: "📋",
      SUBMISSION_REVIEWED: "🔍",
      STATUS_UPDATE: "🔄",
      QUOTE_READY: "💰",
      MESSAGE_RECEIVED: "💬",
      INVOICE_GENERATED: "🧾",
      TIMELINE_CREATED: "📅",
      REMINDER: "⏰"
    };
    const icon = iconMap[notification.type] || "🔔";
    toast.add({
      title: `${icon} ${notification.subject}`,
      description: notification.message.length > 80 ? notification.message.slice(0, 80) + "…" : notification.message,
      color: "purple",
      timeout: 6e3
    });
  };
  const markAsRead = async (id) => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await $fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const n = notifications2.value.find((n2) => n2.id === id);
      if (n) {
        n.read = true;
        n.readAt = (/* @__PURE__ */ new Date()).toISOString();
      }
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };
  const markAllAsRead = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await $fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      notifications2.value = notifications2.value.map((n) => ({ ...n, read: true, readAt: now }));
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };
  const bulkMarkAsRead = async (ids) => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await $fetch("/api/notifications/bulk-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: { ids }
      });
      const now = (/* @__PURE__ */ new Date()).toISOString();
      notifications2.value = notifications2.value.map(
        (n) => ids.includes(n.id) ? { ...n, read: true, readAt: now } : n
      );
    } catch (e) {
      console.error("Failed to bulk mark as read:", e);
    }
  };
  const bulkMarkAsUnread = async (ids) => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await $fetch("/api/notifications/bulk-unread", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: { ids }
      });
      notifications2.value = notifications2.value.map(
        (n) => ids.includes(n.id) ? { ...n, read: false, readAt: null } : n
      );
    } catch (e) {
      console.error("Failed to bulk mark as unread:", e);
    }
  };
  const bulkArchive = async (ids) => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      await $fetch("/api/notifications/bulk-archive", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: { ids }
      });
      notifications2.value = notifications2.value.filter((n) => !ids.includes(n.id));
    } catch (e) {
      console.error("Failed to bulk archive:", e);
    }
  };
  const formatDate = (date) => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Unknown date";
    const now = /* @__PURE__ */ new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 6e4);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 36e5);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 864e5);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };
  return {
    notifications: notifications2,
    unreadCount,
    loading,
    fetchNotifications,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    bulkMarkAsRead,
    bulkMarkAsUnread,
    bulkArchive,
    formatDate
  };
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "NotificationModal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    notification: {}
  },
  emits: ["update:modelValue", "mark-read"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    useRealtimeNotifications();
    const formattedDate = computed(() => {
      if (!props.notification.createdAt) return "Unknown date";
      const d = new Date(props.notification.createdAt);
      if (isNaN(d.getTime())) return "Unknown date";
      return d.toLocaleString(void 0, { dateStyle: "medium", timeStyle: "short" });
    });
    const typeConfig = {
      SUBMISSION_RECEIVED: { icon: "📋", label: "Submission", color: "text-blue-400", iconBg: "bg-blue-500/20", accent: "bg-blue-500" },
      SUBMISSION_REVIEWED: { icon: "🔍", label: "Reviewed", color: "text-cyan-400", iconBg: "bg-cyan-500/20", accent: "bg-cyan-500" },
      STATUS_UPDATE: { icon: "🔄", label: "Status Update", color: "text-yellow-400", iconBg: "bg-yellow-500/20", accent: "bg-yellow-500" },
      QUOTE_READY: { icon: "💰", label: "Quote Ready", color: "text-green-400", iconBg: "bg-green-500/20", accent: "bg-green-500" },
      MESSAGE_RECEIVED: { icon: "💬", label: "Message", color: "text-purple-400", iconBg: "bg-purple-500/20", accent: "bg-purple-500" },
      INVOICE_GENERATED: { icon: "🧾", label: "Invoice", color: "text-orange-400", iconBg: "bg-orange-500/20", accent: "bg-orange-500" },
      TIMELINE_CREATED: { icon: "📅", label: "Timeline", color: "text-indigo-400", iconBg: "bg-indigo-500/20", accent: "bg-indigo-500" },
      WELCOME: { icon: "🎉", label: "Welcome", color: "text-pink-400", iconBg: "bg-pink-500/20", accent: "bg-pink-500" },
      REMINDER: { icon: "⏰", label: "Reminder", color: "text-red-400", iconBg: "bg-red-500/20", accent: "bg-red-500" }
    };
    const config = computed(() => typeConfig[props.notification.type] ?? { icon: "🔔", label: "Notification", color: "text-gray-400", iconBg: "bg-gray-500/20", accent: "bg-gray-500" });
    const typeIcon = computed(() => config.value.icon);
    const typeLabel = computed(() => config.value.label);
    const typeColorClass = computed(() => config.value.color);
    const iconBgClass = computed(() => config.value.iconBg);
    const accentClass = computed(() => config.value.accent);
    const metadataItems = computed(() => {
      const meta = props.notification.metadata;
      if (!meta) return [];
      const labelMap = {
        projectName: "Project",
        clientEmail: "Client",
        invoiceNumber: "Invoice #",
        amount: "Amount",
        submissionId: "Submission ID"
      };
      return Object.entries(meta).filter(([k, v]) => labelMap[k] && v != null).map(([k, v]) => ({
        label: labelMap[k],
        value: k === "amount" ? `$${Number(v).toFixed(2)}` : String(v).slice(0, 40)
      }));
    });
    const actionLink = computed(() => {
      const meta = props.notification.metadata;
      if (!meta) return null;
      if (meta.submissionId && ["SUBMISSION_RECEIVED", "SUBMISSION_REVIEWED", "STATUS_UPDATE"].includes(props.notification.type)) {
        return { label: "View Submission", to: `/submissions/${meta.submissionId}` };
      }
      if (meta.invoiceId || props.notification.type === "INVOICE_GENERATED") {
        return { label: "Go to Dashboard", to: "/dashboard" };
      }
      if (meta.messageId || props.notification.type === "MESSAGE_RECEIVED") {
        return { label: "Open Messages", to: "/dashboard" };
      }
      return null;
    });
    const handleAction = () => {
      if (!props.notification.read) emit("mark-read", props.notification.id);
      emit("update:modelValue", false);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.modelValue) {
          _push2(`<div class="fixed inset-0 z-[100] flex items-center justify-center p-4" data-v-5b51ee63><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-5b51ee63></div><div class="relative w-full max-w-md bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" data-v-5b51ee63><div class="${ssrRenderClass([unref(accentClass), "h-1 w-full"])}" data-v-5b51ee63></div><div class="flex items-start justify-between p-5 pb-3" data-v-5b51ee63><div class="flex items-center gap-3" data-v-5b51ee63><div class="${ssrRenderClass([unref(iconBgClass), "w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"])}" data-v-5b51ee63>${ssrInterpolate(unref(typeIcon))}</div><div data-v-5b51ee63><p class="${ssrRenderClass([unref(typeColorClass), "text-xs font-semibold uppercase tracking-wider"])}" data-v-5b51ee63>${ssrInterpolate(unref(typeLabel))}</p><h3 class="text-white font-bold text-base leading-tight mt-0.5" data-v-5b51ee63>${ssrInterpolate(__props.notification.subject)}</h3></div></div><button class="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 flex-shrink-0" data-v-5b51ee63><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-5b51ee63><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-5b51ee63></path></svg></button></div><div class="px-5 pb-3" data-v-5b51ee63><p class="text-gray-300 text-sm leading-relaxed" data-v-5b51ee63>${ssrInterpolate(__props.notification.message)}</p>`);
          if (unref(metadataItems).length) {
            _push2(`<div class="mt-4 flex flex-wrap gap-2" data-v-5b51ee63><!--[-->`);
            ssrRenderList(unref(metadataItems), (item) => {
              _push2(`<div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300" data-v-5b51ee63><span class="text-gray-500" data-v-5b51ee63>${ssrInterpolate(item.label)}</span><span class="text-white font-medium" data-v-5b51ee63>${ssrInterpolate(item.value)}</span></div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<p class="text-xs text-gray-500 mt-4" data-v-5b51ee63>${ssrInterpolate(unref(formattedDate))}</p></div><div class="flex items-center gap-3 px-5 py-4 border-t border-white/10 bg-white/5" data-v-5b51ee63>`);
          if (unref(actionLink)) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: unref(actionLink).to,
              class: "flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl text-center transition shadow-lg",
              onClick: handleAction
            }, {
              default: withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(actionLink).label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(actionLink).label), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push2(`<!---->`);
          }
          if (!__props.notification.read) {
            _push2(`<button class="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition border border-white/10" data-v-5b51ee63> Mark as read </button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<button class="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-medium rounded-xl transition border border-white/10" data-v-5b51ee63> Close </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NotificationModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-5b51ee63"]]), { __name: "NotificationModal" });
const perPage = 10;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "notifications",
  __ssrInlineRender: true,
  setup(__props) {
    const { notifications: notifications2, unreadCount, loading, markAsRead, formatDate } = useRealtimeNotifications();
    const activeFilter = ref("all");
    const page = ref(1);
    const selected = ref(null);
    const showModal = ref(false);
    const selectedIds = ref([]);
    watch(activeFilter, () => {
      page.value = 1;
    });
    const filtered = computed(() => {
      if (activeFilter.value === "all") return notifications2.value;
      if (activeFilter.value === "unread") return notifications2.value.filter((n) => !n.read);
      return notifications2.value.filter((n) => n.type === activeFilter.value);
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)));
    const paginated = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage));
    const filters = computed(() => [
      { value: "all", label: "All", count: notifications2.value.length },
      { value: "unread", label: "Unread", count: unreadCount.value },
      { value: "MESSAGE_RECEIVED", label: "Messages", count: notifications2.value.filter((n) => n.type === "MESSAGE_RECEIVED").length },
      { value: "SUBMISSION_RECEIVED", label: "Submissions", count: notifications2.value.filter((n) => n.type === "SUBMISSION_RECEIVED").length },
      { value: "INVOICE_GENERATED", label: "Invoices", count: notifications2.value.filter((n) => ["INVOICE_GENERATED", "QUOTE_READY"].includes(n.type)).length },
      { value: "STATUS_UPDATE", label: "Updates", count: notifications2.value.filter((n) => n.type === "STATUS_UPDATE").length }
    ].filter((f) => f.count > 0 || f.value === "all" || f.value === "unread"));
    const iconMap = {
      SUBMISSION_RECEIVED: "📋",
      SUBMISSION_REVIEWED: "🔍",
      STATUS_UPDATE: "🔄",
      QUOTE_READY: "💰",
      MESSAGE_RECEIVED: "💬",
      INVOICE_GENERATED: "🧾",
      TIMELINE_CREATED: "📅",
      WELCOME: "🎉",
      REMINDER: "⏰"
    };
    const iconBgMap = {
      SUBMISSION_RECEIVED: "bg-blue-500/20",
      SUBMISSION_REVIEWED: "bg-cyan-500/20",
      STATUS_UPDATE: "bg-yellow-500/20",
      QUOTE_READY: "bg-green-500/20",
      MESSAGE_RECEIVED: "bg-purple-500/20",
      INVOICE_GENERATED: "bg-orange-500/20",
      TIMELINE_CREATED: "bg-indigo-500/20",
      WELCOME: "bg-pink-500/20",
      REMINDER: "bg-red-500/20"
    };
    const typeColorMap = {
      SUBMISSION_RECEIVED: "bg-blue-500/20 text-blue-300",
      SUBMISSION_REVIEWED: "bg-cyan-500/20 text-cyan-300",
      STATUS_UPDATE: "bg-yellow-500/20 text-yellow-300",
      QUOTE_READY: "bg-green-500/20 text-green-300",
      MESSAGE_RECEIVED: "bg-purple-500/20 text-purple-300",
      INVOICE_GENERATED: "bg-orange-500/20 text-orange-300",
      TIMELINE_CREATED: "bg-indigo-500/20 text-indigo-300",
      WELCOME: "bg-pink-500/20 text-pink-300",
      REMINDER: "bg-red-500/20 text-red-300"
    };
    const labelMap = {
      SUBMISSION_RECEIVED: "Submission",
      SUBMISSION_REVIEWED: "Reviewed",
      STATUS_UPDATE: "Update",
      QUOTE_READY: "Quote",
      MESSAGE_RECEIVED: "Message",
      INVOICE_GENERATED: "Invoice",
      TIMELINE_CREATED: "Timeline",
      WELCOME: "Welcome",
      REMINDER: "Reminder"
    };
    const typeIcon = (t) => iconMap[t] ?? "🔔";
    const iconBg = (t) => iconBgMap[t] ?? "bg-gray-500/20";
    const typeColor = (t) => typeColorMap[t] ?? "bg-gray-500/20 text-gray-300";
    const typeLabel = (t) => labelMap[t] ?? t;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NotificationModal = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen py-10 px-4" }, _attrs))} data-v-83c3ea98><div class="max-w-3xl mx-auto" data-v-83c3ea98><div class="flex items-center justify-between mb-8" data-v-83c3ea98><div data-v-83c3ea98><h1 class="text-3xl font-bold text-white" data-v-83c3ea98>Notifications</h1><p class="text-gray-400 text-sm mt-1" data-v-83c3ea98>${ssrInterpolate(unref(unreadCount) > 0 ? `${unref(unreadCount)} unread` : "All caught up")}</p></div><div class="flex items-center gap-2" data-v-83c3ea98>`);
      if (unref(selectedIds).length > 0) {
        _push(`<button class="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-xl border border-white/10 transition" data-v-83c3ea98> Clear (${ssrInterpolate(unref(selectedIds).length)}) </button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(unreadCount) > 0 && unref(selectedIds).length === 0) {
        _push(`<button class="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-sm font-medium rounded-xl border border-purple-500/30 transition" data-v-83c3ea98> Mark all as read </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(selectedIds).length > 0) {
        _push(`<div class="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between" data-v-83c3ea98><p class="text-sm text-purple-300 font-medium" data-v-83c3ea98>${ssrInterpolate(unref(selectedIds).length)} selected</p><div class="flex items-center gap-2" data-v-83c3ea98><button class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition" data-v-83c3ea98> Mark Read </button><button class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition" data-v-83c3ea98> Mark Unread </button><button class="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium rounded-lg transition border border-red-500/30" data-v-83c3ea98> Archive </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap gap-2 mb-6" data-v-83c3ea98><!--[-->`);
      ssrRenderList(unref(filters), (f) => {
        _push(`<button class="${ssrRenderClass([unref(activeFilter) === f.value ? "bg-purple-600 text-white border-purple-500" : "bg-white/5 text-gray-400 hover:text-white border-white/10 hover:border-white/20", "px-4 py-1.5 rounded-xl text-sm font-medium transition border"])}" data-v-83c3ea98>${ssrInterpolate(f.label)} `);
        if (f.count) {
          _push(`<span class="ml-1.5 text-xs opacity-70" data-v-83c3ea98>(${ssrInterpolate(f.count)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div><div class="space-y-2" data-v-83c3ea98>`);
      if (unref(loading)) {
        _push(`<!--[-->`);
        ssrRenderList(5, (i) => {
          _push(`<div class="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse" data-v-83c3ea98><div class="flex gap-4" data-v-83c3ea98><div class="w-10 h-10 bg-white/10 rounded-xl flex-shrink-0" data-v-83c3ea98></div><div class="flex-1 space-y-2" data-v-83c3ea98><div class="h-4 bg-white/10 rounded w-2/3" data-v-83c3ea98></div><div class="h-3 bg-white/10 rounded w-full" data-v-83c3ea98></div><div class="h-3 bg-white/10 rounded w-1/4" data-v-83c3ea98></div></div></div></div>`);
        });
        _push(`<!--]-->`);
      } else if (unref(filtered).length === 0) {
        _push(`<div class="text-center py-20" data-v-83c3ea98><div class="text-6xl mb-4" data-v-83c3ea98>${ssrInterpolate(unref(activeFilter) === "unread" ? "✅" : "🔔")}</div><p class="text-white font-semibold text-lg" data-v-83c3ea98>${ssrInterpolate(unref(activeFilter) === "unread" ? "All caught up!" : "No notifications here")}</p><p class="text-gray-400 text-sm mt-1" data-v-83c3ea98>${ssrInterpolate(unref(activeFilter) === "unread" ? "No unread notifications." : "Notifications will appear here as activity happens.")}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(paginated), (n) => {
        _push(`<div class="${ssrRenderClass([n.read ? "border-white/10" : "border-purple-500/30 bg-purple-500/5", "bg-white/5 hover:bg-white/10 border rounded-2xl p-4 transition flex items-start gap-4 group"])}" data-v-83c3ea98><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedIds).includes(n.id)) ? " checked" : ""} class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer" data-v-83c3ea98><button class="flex-1 flex items-start gap-4 text-left" data-v-83c3ea98><div class="${ssrRenderClass([iconBg(n.type), "w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"])}" data-v-83c3ea98>${ssrInterpolate(typeIcon(n.type))}</div><div class="flex-1 min-w-0" data-v-83c3ea98><div class="flex items-start justify-between gap-3 mb-1" data-v-83c3ea98><span class="${ssrRenderClass([typeColor(n.type), "inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"])}" data-v-83c3ea98>${ssrInterpolate(typeLabel(n.type))}</span><div class="flex items-center gap-2 flex-shrink-0" data-v-83c3ea98>`);
        if (!n.read) {
          _push(`<span class="w-2 h-2 rounded-full bg-purple-400" data-v-83c3ea98></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="text-xs text-gray-500 whitespace-nowrap" data-v-83c3ea98>${ssrInterpolate(unref(formatDate)(n.createdAt))}</span></div></div><p class="text-sm font-semibold text-white leading-tight mb-1" data-v-83c3ea98>${ssrInterpolate(n.subject)}</p><p class="text-sm text-gray-400 line-clamp-2 leading-relaxed" data-v-83c3ea98>${ssrInterpolate(n.message)}</p></div></button></div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(totalPages) > 1) {
        _push(`<div class="flex items-center justify-center gap-2 mt-8" data-v-83c3ea98><button${ssrIncludeBooleanAttr(unref(page) === 1) ? " disabled" : ""} class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition text-sm" data-v-83c3ea98> ← Previous </button><span class="text-gray-400 text-sm px-2" data-v-83c3ea98>${ssrInterpolate(unref(page))} / ${ssrInterpolate(unref(totalPages))}</span><button${ssrIncludeBooleanAttr(unref(page) === unref(totalPages)) ? " disabled" : ""} class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition text-sm" data-v-83c3ea98> Next → </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(selected)) {
        _push(ssrRenderComponent(_component_NotificationModal, {
          modelValue: unref(showModal),
          "onUpdate:modelValue": ($event) => isRef(showModal) ? showModal.value = $event : null,
          notification: unref(selected),
          onMarkRead: unref(markAsRead)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/notifications.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const notifications = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-83c3ea98"]]);

export { notifications as default };
//# sourceMappingURL=notifications-DnBWBj0Q.mjs.map

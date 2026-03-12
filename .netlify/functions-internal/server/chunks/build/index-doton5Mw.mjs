import { defineComponent, ref, reactive, computed, mergeProps, unref, watch, useSSRContext } from 'vue';
import { ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderComponent, ssrRenderAttrs, ssrRenderStyle, ssrRenderTeleport } from 'vue/server-renderer';
import { a as useAuth, d as useSupabase } from './server.mjs';
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

const useRealtimeMessages = () => {
  const { supabase } = useSupabase();
  let channel = null;
  let subscribed = false;
  const subscribe = (userId, onMessage) => {
    if (subscribed) return;
    channel = supabase.channel("charatech-messages", {
      config: { broadcast: { self: false } }
    });
    channel.on("broadcast", { event: "new_message" }, ({ payload }) => {
      if (payload.receiverId === userId) {
        onMessage(payload);
      }
    }).subscribe(() => {
      subscribed = true;
    });
  };
  const broadcast = async (msg) => {
    if (!channel) return;
    await channel.send({
      type: "broadcast",
      event: "new_message",
      payload: msg
    });
  };
  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
      subscribed = false;
    }
  };
  return { subscribe, broadcast, unsubscribe };
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AdminMessagesPanel",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useRealtimeMessages();
    const conversations = ref([]);
    const selectedClientId = ref(null);
    const messages = ref([]);
    const newMessage = ref("");
    const loadingConvs = ref(false);
    const loadingThread = ref(false);
    const sending = ref(false);
    const isAiHandled = ref(true);
    const selectedClient = ref(null);
    const adminId = ref(null);
    ref(null);
    const QUICK_REPLIES = [
      "✅ Thanks for reaching out! I'll review your request and get back to you shortly.",
      "📋 I've reviewed your submission. Could you provide more details about your requirements?",
      "💰 I've sent your invoice. Please review it and let me know if you have any questions.",
      "🚀 Great news! Your project is now in progress. Check the Timeline tab for updates.",
      "📅 I'll need a few more days to complete this milestone. Thank you for your patience."
    ];
    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formatDate = (date) => {
      const d = new Date(date);
      const today = /* @__PURE__ */ new Date();
      if (d.toDateString() === today.toDateString()) return formatTime(date);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid md:grid-cols-3 gap-4 h-[680px]" }, _attrs))} data-v-0ab6a4f9><div class="glass-morphism rounded-xl border border-white/10 flex flex-col overflow-hidden" data-v-0ab6a4f9><div class="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0" data-v-0ab6a4f9><h3 class="text-base font-bold text-white" data-v-0ab6a4f9>Messages</h3><button class="text-white/40 hover:text-white transition-colors text-sm p-1 rounded-lg hover:bg-white/10" data-v-0ab6a4f9> 🔄 </button></div><div class="flex-1 overflow-y-auto divide-y divide-white/5" data-v-0ab6a4f9>`);
      if (unref(loadingConvs)) {
        _push(`<div class="p-4 space-y-3" data-v-0ab6a4f9><!--[-->`);
        ssrRenderList(4, (i) => {
          _push(`<div class="h-14 bg-white/5 rounded-lg animate-pulse" data-v-0ab6a4f9></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (!unref(conversations).length) {
        _push(`<div class="flex flex-col items-center justify-center h-full text-white/30 gap-2 p-6" data-v-0ab6a4f9><div class="text-3xl" data-v-0ab6a4f9>💬</div><div class="text-sm text-center" data-v-0ab6a4f9>No conversations yet</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(conversations), (conv) => {
        _push(`<button class="${ssrRenderClass([
          "w-full text-left px-4 py-3 transition-all hover:bg-white/5",
          unref(selectedClientId) === conv.clientId ? "bg-purple-600/15 border-l-2 border-purple-500" : "border-l-2 border-transparent"
        ])}" data-v-0ab6a4f9><div class="flex items-start gap-3" data-v-0ab6a4f9><div class="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white shadow-inner" data-v-0ab6a4f9>${ssrInterpolate(conv.clientName.charAt(0).toUpperCase())}</div><div class="flex-1 min-w-0" data-v-0ab6a4f9><div class="flex items-center justify-between mb-0.5" data-v-0ab6a4f9><span class="text-sm font-semibold text-white truncate" data-v-0ab6a4f9>${ssrInterpolate(conv.clientName)}</span><span class="text-xs text-white/30 flex-shrink-0 ml-1" data-v-0ab6a4f9>${ssrInterpolate(formatDate(conv.lastMessageAt))}</span></div><div class="flex items-center justify-between gap-1" data-v-0ab6a4f9><div class="text-xs text-white/40 truncate" data-v-0ab6a4f9>${ssrInterpolate(conv.lastMessage)}</div><div class="flex items-center gap-1 flex-shrink-0" data-v-0ab6a4f9>`);
        if (conv.isAiHandled) {
          _push(`<span class="text-xs text-indigo-400" title="AI handling" data-v-0ab6a4f9>🤖</span>`);
        } else {
          _push(`<!---->`);
        }
        if (conv.unreadCount > 0) {
          _push(`<span class="min-w-5 h-5 px-1 rounded-full bg-purple-500 text-xs font-bold text-white flex items-center justify-center" data-v-0ab6a4f9>${ssrInterpolate(conv.unreadCount > 9 ? "9+" : conv.unreadCount)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div></button>`);
      });
      _push(`<!--]--></div></div><div class="md:col-span-2 glass-morphism rounded-xl border border-white/10 flex flex-col overflow-hidden" data-v-0ab6a4f9>`);
      if (!unref(selectedClientId)) {
        _push(`<div class="flex-1 flex flex-col items-center justify-center text-white/30 gap-3" data-v-0ab6a4f9><div class="text-5xl opacity-40" data-v-0ab6a4f9>💬</div><div class="text-base" data-v-0ab6a4f9>Select a conversation</div><div class="text-xs" data-v-0ab6a4f9>Choose a client from the list to view messages</div></div>`);
      } else {
        _push(`<!--[--><div class="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0" data-v-0ab6a4f9><div class="flex items-center gap-3" data-v-0ab6a4f9><div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold text-white shadow-inner" data-v-0ab6a4f9>${ssrInterpolate(unref(selectedClient)?.name?.charAt(0)?.toUpperCase() || "?")}</div><div data-v-0ab6a4f9><div class="text-sm font-bold text-white" data-v-0ab6a4f9>${ssrInterpolate(unref(selectedClient)?.name || "Client")}</div><div class="text-xs text-white/40" data-v-0ab6a4f9>${ssrInterpolate(unref(selectedClient)?.email)}</div></div></div><div class="flex items-center gap-2" data-v-0ab6a4f9><div class="${ssrRenderClass([
          "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
          unref(isAiHandled) ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-green-500/20 text-green-300 border border-green-500/30"
        ])}" data-v-0ab6a4f9>${ssrInterpolate(unref(isAiHandled) ? "🤖 AI mode" : "👤 Human mode")}</div></div></div><div class="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin min-h-0" style="${ssrRenderStyle({ "background": "rgba(10,5,20,0.4)" })}" data-v-0ab6a4f9>`);
        if (unref(loadingThread)) {
          _push(`<div class="flex items-center justify-center h-24" data-v-0ab6a4f9><div class="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" data-v-0ab6a4f9></div></div>`);
        } else {
          _push(`<!--[-->`);
          ssrRenderList(unref(messages), (msg) => {
            _push(`<div class="${ssrRenderClass(["flex gap-2", msg.senderId === unref(adminId) ? "justify-end" : "justify-start"])}" data-v-0ab6a4f9>`);
            if (msg.senderId !== unref(adminId)) {
              _push(`<div class="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white self-end" data-v-0ab6a4f9>${ssrInterpolate(unref(selectedClient)?.name?.charAt(0)?.toUpperCase() || "C")}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="${ssrRenderClass([
              "max-w-[72%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
              msg.senderId === unref(adminId) ? msg.isBot ? "bg-indigo-900/60 border border-indigo-500/30 text-indigo-100 rounded-br-sm italic" : "bg-gradient-to-br from-purple-600 to-violet-600 text-white rounded-br-sm shadow-md shadow-purple-900/40" : "bg-white/8 text-white rounded-bl-sm border border-white/8"
            ])}" data-v-0ab6a4f9>`);
            if (msg.isBot) {
              _push(`<div class="text-xs text-indigo-300/70 mb-0.5 not-italic font-medium" data-v-0ab6a4f9>🤖 Auto-reply</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="break-words" data-v-0ab6a4f9>${ssrInterpolate(msg.content)}</div><div class="${ssrRenderClass(["text-xs mt-1 opacity-50", msg.senderId === unref(adminId) ? "text-right" : ""])}" data-v-0ab6a4f9>${ssrInterpolate(formatTime(msg.createdAt))}</div></div></div>`);
          });
          _push(`<!--]-->`);
        }
        _push(`<div data-v-0ab6a4f9></div></div><div class="px-4 py-2 border-t border-white/5 overflow-x-auto flex-shrink-0" data-v-0ab6a4f9><div class="flex gap-2 pb-1" style="${ssrRenderStyle({ "min-width": "max-content" })}" data-v-0ab6a4f9><!--[-->`);
        ssrRenderList(QUICK_REPLIES, (reply) => {
          _push(`<button class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-white/60 hover:text-white transition-all truncate max-w-[200px]"${ssrRenderAttr("title", reply)} data-v-0ab6a4f9>${ssrInterpolate(reply.slice(0, 30))}… </button>`);
        });
        _push(`<!--]--></div></div><div class="px-4 py-3 border-t border-white/10 flex gap-2 items-end flex-shrink-0" style="${ssrRenderStyle({ "background": "rgba(15,10,30,0.6)" })}" data-v-0ab6a4f9><textarea placeholder="Reply to client… (Enter to send, Shift+Enter for newline)" rows="2" class="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-all" data-v-0ab6a4f9>${ssrInterpolate(unref(newMessage))}</textarea><button${ssrIncludeBooleanAttr(!unref(newMessage).trim() || unref(sending)) ? " disabled" : ""} class="flex-shrink-0 h-10 px-4 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-900/30" data-v-0ab6a4f9>`);
        if (!unref(sending)) {
          _push(`<span data-v-0ab6a4f9>Send</span>`);
        } else {
          _push(`<div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" data-v-0ab6a4f9></div>`);
        }
        if (!unref(sending)) {
          _push(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-0ab6a4f9><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" data-v-0ab6a4f9></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button></div><!--]-->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AdminMessagesPanel.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-0ab6a4f9"]]), { __name: "AdminMessagesPanel" });
const CELL = 11;
const GAP = 2;
const DAY_LABEL_W = 28;
const MONTH_LABEL_H = 20;
const COLS = 52;
const ROWS = 7;
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "CommitHeatmap",
  __ssrInlineRender: true,
  props: {
    data: {},
    loading: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const STRIDE = CELL + GAP;
    const SVG_W = DAY_LABEL_W + COLS * STRIDE;
    const SVG_H = MONTH_LABEL_H + ROWS * STRIDE;
    function cellColor(count) {
      if (count === 0) return "rgba(255,255,255,0.05)";
      if (count <= 2) return "rgba(109,40,217,0.4)";
      if (count <= 5) return "rgba(124,58,237,0.65)";
      if (count <= 9) return "rgba(139,92,246,0.85)";
      return "rgba(167,139,250,1)";
    }
    const cells = computed(() => {
      if (!props.data) return [];
      const out = [];
      props.data.forEach((week, col) => {
        const weekDate = new Date(week.week * 1e3);
        week.days.forEach((count, dayIdx) => {
          const d = new Date(weekDate);
          d.setDate(weekDate.getDate() + dayIdx);
          out.push({
            x: DAY_LABEL_W + col * STRIDE,
            y: MONTH_LABEL_H + dayIdx * STRIDE,
            count,
            color: cellColor(count),
            date: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
            day: dayIdx,
            col
          });
        });
      });
      return out;
    });
    const monthLabels = computed(() => {
      if (!props.data) return [];
      const labels = [];
      let lastMonth = -1;
      props.data.forEach((week, col) => {
        const d = new Date(week.week * 1e3);
        const month = d.getMonth();
        if (month !== lastMonth) {
          labels.push({
            x: DAY_LABEL_W + col * STRIDE,
            label: d.toLocaleDateString("en-US", { month: "short" })
          });
          lastMonth = month;
        }
      });
      return labels;
    });
    const tooltip = ref(null);
    const totalCommits = computed(() => props.data?.reduce((s, w) => s + w.total, 0) ?? 0);
    const maxWeek = computed(() => props.data?.reduce((m, w) => w.total > m.total ? w : m, { total: 0, week: 0, days: [] }));
    const streakWeeks = computed(() => {
      if (!props.data) return 0;
      let streak = 0;
      for (let i = props.data.length - 1; i >= 0; i--) {
        if (props.data[i].total > 0) streak++;
        else break;
      }
      return streak;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "commit-heatmap" }, _attrs))}>`);
      if (__props.loading) {
        _push(`<div class="flex flex-col gap-2 animate-pulse"><div class="h-4 w-24 bg-white/10 rounded mb-2"></div><div class="h-[130px] w-full bg-white/5 rounded-xl"></div></div>`);
      } else if (!__props.data) {
        _push(`<div class="flex items-center justify-center h-[130px] text-white/40 text-sm italic"> ⏳ GitHub is computing commit statistics — refresh in a few seconds </div>`);
      } else {
        _push(`<div class="relative"><div class="flex gap-6 mb-3 text-xs text-white/60"><span><span class="text-white font-semibold">${ssrInterpolate(unref(totalCommits).toLocaleString())}</span> commits in the last year</span>`);
        if (unref(streakWeeks) > 0) {
          _push(`<span><span class="text-purple-400 font-semibold">${ssrInterpolate(unref(streakWeeks))}w</span> active streak</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(maxWeek) && unref(maxWeek).total > 0) {
          _push(`<span>Peak week: <span class="text-purple-400 font-semibold">${ssrInterpolate(unref(maxWeek).total)}</span> commits</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="relative overflow-x-auto"><svg${ssrRenderAttr("width", SVG_W)}${ssrRenderAttr("height", SVG_H)} class="block" style="${ssrRenderStyle({ "max-width": "100%" })}"><!--[-->`);
        ssrRenderList(unref(monthLabels), (ml) => {
          _push(`<text${ssrRenderAttr("x", ml.x)}${ssrRenderAttr("y", 13)} font-size="10" fill="rgba(255,255,255,0.45)" font-family="system-ui, sans-serif">${ssrInterpolate(ml.label)}</text>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(["", "Mon", "", "Wed", "", "Fri", ""], (label, i) => {
          _push(`<text${ssrRenderAttr("x", 0)}${ssrRenderAttr("y", MONTH_LABEL_H + i * STRIDE + CELL - 1)} font-size="9" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif">${ssrInterpolate(label)}</text>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(cells), (cell, i) => {
          _push(`<rect${ssrRenderAttr("x", cell.x)}${ssrRenderAttr("y", cell.y)}${ssrRenderAttr("width", CELL)}${ssrRenderAttr("height", CELL)}${ssrRenderAttr("fill", cell.color)} rx="2" ry="2" class="cursor-pointer transition-opacity duration-150 hover:opacity-80"></rect>`);
        });
        _push(`<!--]--></svg>`);
        if (unref(tooltip)) {
          _push(`<div class="absolute z-20 px-2 py-1 rounded text-xs text-white bg-gray-900/95 border border-white/10 pointer-events-none whitespace-nowrap shadow-lg" style="${ssrRenderStyle({ left: `${unref(tooltip).x}px`, top: `${unref(tooltip).y}px`, transform: "translateX(-50%)" })}">${ssrInterpolate(unref(tooltip).text)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex items-center gap-1 mt-2 text-xs text-white/40"><span>Less</span><!--[-->`);
        ssrRenderList([0, 2, 5, 9, 15], (level) => {
          _push(`<div class="w-[11px] h-[11px] rounded-sm" style="${ssrRenderStyle({ background: cellColor(level) })}"></div>`);
        });
        _push(`<!--]--><span>More</span></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CommitHeatmap.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$4, { __name: "CommitHeatmap" });
const DONUT_R = 52;
const DONUT_CX = 70;
const DONUT_CY = 70;
const DONUT_STROKE = 20;
const RING_R = 48;
const RING_STROKE = 8;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ProjectTimelinePanel",
  __ssrInlineRender: true,
  props: {
    timeline: {},
    adminMode: { type: Boolean }
  },
  emits: ["updated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { getAccessToken } = useAuth();
    const activeTab = ref("overview");
    const githubData = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const linking = ref(false);
    const repoSearch = ref("");
    const repoSearchLoading = ref(false);
    const repoSearchResults = ref([]);
    const showRepoDropdown = ref(false);
    const savingRepo = ref(false);
    const showCreateProjectModal = ref(false);
    const creatingProject = ref(false);
    const newProjectTitle = ref("");
    const newProjectDesc = ref("");
    const newProjectVisibility = ref("PRIVATE");
    const newMilestoneName = ref("");
    const newMilestoneDue = ref("");
    const createProjectError = ref(null);
    const createProjectSuccess = ref(null);
    async function loadGitHubData() {
      if (!props.timeline?.githubRepo) return;
      loading.value = true;
      error.value = null;
      try {
        const token = await getAccessToken();
        const data = await $fetch(`/api/admin/timelines/${props.timeline.id}/github`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        githubData.value = data;
      } catch (e) {
        error.value = e?.data?.message || e?.message || "Failed to load GitHub data";
      } finally {
        loading.value = false;
      }
    }
    async function searchRepos() {
      if (!repoSearch.value.trim()) {
        repoSearchResults.value = [];
        return;
      }
      repoSearchLoading.value = true;
      try {
        const token = await getAccessToken();
        repoSearchResults.value = await $fetch("/api/admin/github/repos", {
          query: { search: repoSearch.value },
          headers: { Authorization: `Bearer ${token}` }
        });
        showRepoDropdown.value = true;
      } catch {
        repoSearchResults.value = [];
      } finally {
        repoSearchLoading.value = false;
      }
    }
    const gh = computed(() => githubData.value?.github);
    const repo = computed(() => gh.value?.repo);
    const progress = computed(() => gh.value?.progress ?? 0);
    const languageData = computed(() => {
      const langs = gh.value?.languages ?? {};
      const total = Object.values(langs).reduce((s, v) => s + v, 0);
      if (total === 0) return [];
      const colors = ["#7c3aed", "#a78bfa", "#4c1d95", "#6d28d9", "#ddd6fe", "#5b21b6", "#8b5cf6", "#c4b5fd"];
      return Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, bytes], i) => ({
        name,
        bytes,
        pct: Math.round(bytes / total * 100),
        color: colors[i % colors.length]
      }));
    });
    const donutArcs = computed(() => {
      let offset = 0;
      const circumference = 2 * Math.PI * DONUT_R;
      return languageData.value.map((lang) => {
        const dash = lang.pct / 100 * circumference;
        const arc = { dash, gap: circumference - dash, offset, color: lang.color, name: lang.name, pct: lang.pct };
        offset += dash;
        return arc;
      });
    });
    const weeklyBars = computed(() => {
      const activity = gh.value?.commitActivity;
      if (!activity || !activity.length) return [];
      const last12 = activity.slice(-12);
      const max = Math.max(...last12.map((w) => w.total), 1);
      return last12.map((w, i) => ({
        height: Math.max(2, Math.round(w.total / max * 80)),
        total: w.total,
        label: new Date(w.week * 1e3).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        index: i
      }));
    });
    const codeFreqData = computed(() => {
      const freq = gh.value?.codeFrequency;
      if (!freq || !freq.length) return { adds: [], dels: [], maxVal: 1, points: 40 };
      const recent = freq.slice(-40);
      const maxVal = Math.max(...recent.flatMap(([, a, d]) => [a, Math.abs(d)]), 1);
      return {
        adds: recent.map(([, a]) => a),
        dels: recent.map(([, , d]) => Math.abs(d)),
        maxVal,
        points: recent.length
      };
    });
    function svgAreaPath(values, maxVal, w, h, flip = false) {
      if (!values.length) return "";
      const stepX = w / (values.length - 1);
      const pts = values.map((v, i) => {
        const x = i * stepX;
        const y = flip ? v / maxVal * h : h - v / maxVal * h;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      return `M0,${flip ? 0 : h} L${pts.join(" L")} L${((values.length - 1) * stepX).toFixed(1)},${flip ? 0 : h} Z`;
    }
    const timelineProgress = computed(() => {
      const t = props.timeline;
      if (!t?.startDate || !t?.endDate) return null;
      const start = new Date(t.startDate).getTime();
      const end = new Date(t.endDate).getTime();
      const now = Date.now();
      const expected = Math.min(100, Math.max(0, Math.round((now - start) / (end - start) * 100)));
      const actual = progress.value;
      return { expected, actual, isAhead: actual >= expected, diff: actual - expected };
    });
    const ringCircumference = 2 * Math.PI * RING_R;
    const ringDash = computed(() => progress.value / 100 * ringCircumference);
    function formatDate(d) {
      if (!d) return "—";
      return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    function formatRelative(d) {
      if (!d) return "—";
      const ms = Date.now() - new Date(d).getTime();
      const mins = Math.floor(ms / 6e4);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 30) return `${days}d ago`;
      return `${Math.floor(days / 30)}mo ago`;
    }
    function truncate(s, n = 72) {
      return s.length > n ? s.substring(0, n) + "…" : s;
    }
    function formatBytes(b) {
      if (b < 1024) return `${b} B`;
      if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
      return `${(b / 1048576).toFixed(1)} MB`;
    }
    function milestoneStatusClass(s) {
      return {
        COMPLETED: "bg-green-500/20 text-green-300 border-green-500/30",
        IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        PENDING: "bg-white/10 text-white/50 border-white/10",
        DELAYED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        CANCELLED: "bg-red-500/20 text-red-300 border-red/30"
      }[s] || "bg-white/10 text-white/50";
    }
    let searchTimer;
    watch(repoSearch, () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(searchRepos, 300);
    });
    watch(() => props.timeline?.id, (id) => {
      if (id && props.timeline?.githubRepo) loadGitHubData();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommitHeatmap = __nuxt_component_0;
      _push(`<!--[--><div class="project-timeline-panel"><div class="glass-morphism rounded-xl border border-white/10 p-5 mb-4"><div class="flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0"><svg viewBox="0 0 24 24" class="w-5 h-5 fill-white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12C24 5.37 18.63 0 12 0z"></path></svg></div><div>`);
      if (__props.timeline.githubRepo) {
        _push(`<div class="text-white font-semibold flex items-center gap-2"><a${ssrRenderAttr("href", `https://github.com/${__props.timeline.githubRepo}`)} target="_blank" class="hover:text-purple-400 transition-colors">${ssrInterpolate(__props.timeline.githubRepo)}</a>`);
        if (unref(repo)) {
          _push(`<span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">${ssrInterpolate(unref(repo).language ?? "No language")}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="text-white/50 text-sm">No GitHub repository linked</div>`);
      }
      if (unref(repo)) {
        _push(`<div class="text-xs text-white/40 mt-0.5"> ⭐ ${ssrInterpolate(unref(repo).stargazers_count)} · 🍴 ${ssrInterpolate(unref(repo).forks_count)} · Last push: ${ssrInterpolate(formatRelative(unref(repo).pushed_at))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex items-center gap-2 flex-wrap">`);
      if (__props.timeline.githubRepo && !unref(loading)) {
        _push(`<button class="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-all"> 🔄 Sync </button>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.adminMode && __props.timeline.githubRepo) {
        _push(`<button${ssrIncludeBooleanAttr(unref(savingRepo)) ? " disabled" : ""} class="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"> 🔗 Unlink </button>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.adminMode && !unref(linking)) {
        _push(`<button class="text-xs px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 transition-all">${ssrInterpolate(__props.timeline.githubRepo ? "🔀 Change Repo" : "🔗 Link GitHub Repo")}</button>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.adminMode && __props.timeline.githubRepo) {
        _push(`<button class="text-xs px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 transition-all"> 🚀 Create GitHub Project </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(linking)) {
        _push(`<div class="mt-4 relative"><div class="flex gap-2"><input${ssrRenderAttr("value", unref(repoSearch))} placeholder="Search repositories…" class="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60"><button class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 text-sm"> ✕ </button></div>`);
        if (unref(showRepoDropdown)) {
          _push(`<div class="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-xl bg-gray-900/98 border border-white/10 shadow-2xl backdrop-blur-xl">`);
          if (unref(repoSearchLoading)) {
            _push(`<div class="p-4 text-center text-white/40 text-sm">Loading…</div>`);
          } else if (!unref(repoSearchResults).length) {
            _push(`<div class="p-4 text-center text-white/40 text-sm">No repos found</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(repoSearchResults), (r) => {
            _push(`<button class="w-full text-left px-4 py-3 hover:bg-purple-500/10 border-b border-white/5 last:border-0 transition-colors"><div class="flex items-center justify-between"><div><span class="text-white font-medium text-sm">${ssrInterpolate(r.name)}</span>`);
            if (r.language) {
              _push(`<span class="ml-2 text-xs text-purple-400">${ssrInterpolate(r.language)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-xs text-white/30">⭐ ${ssrInterpolate(r.stars)}</div></div>`);
            if (r.description) {
              _push(`<div class="text-xs text-white/40 mt-0.5 truncate">${ssrInterpolate(r.description)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(error)) {
        _push(`<div class="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"> ⚠️ ${ssrInterpolate(unref(error))} <button class="ml-3 underline text-red-400 hover:text-red-300">Retry</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(gh) || unref(loading)) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4"><div class="glass-morphism rounded-xl border border-purple-500/20 p-4 flex flex-col items-center justify-center"><div class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-violet-300">${ssrInterpolate(unref(loading) ? "…" : `${unref(progress)}%`)}</div><div class="text-xs text-white/50 mt-1">Complete</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-2xl font-bold text-white">${ssrInterpolate(unref(loading) ? "…" : unref(repo)?.size != null ? unref(gh)?.recentCommits?.length ?? "—" : "—")}</div><div class="text-xs text-white/50 mt-1">Recent Commits</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-2xl font-bold text-orange-300">${ssrInterpolate(unref(loading) ? "…" : unref(repo)?.open_issues_count ?? "—")}</div><div class="text-xs text-white/50 mt-1">Open Issues</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-2xl font-bold text-green-300">${ssrInterpolate(unref(loading) ? "…" : unref(gh)?.mergedPRs?.length ?? "—")}</div><div class="text-xs text-white/50 mt-1">Merged PRs</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-2xl font-bold text-yellow-300">${ssrInterpolate(unref(loading) ? "…" : unref(repo)?.stargazers_count ?? "—")}</div><div class="text-xs text-white/50 mt-1">Stars</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-2xl font-bold text-blue-300">${ssrInterpolate(unref(loading) ? "…" : unref(gh)?.milestones?.length ?? __props.timeline?.milestones?.length ?? "—")}</div><div class="text-xs text-white/50 mt-1">Milestones</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-2xl font-bold text-pink-300">${ssrInterpolate(unref(loading) ? "…" : unref(gh)?.contributors?.length ?? "—")}</div><div class="text-xs text-white/50 mt-1">Contributors</div></div><div class="glass-morphism rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center"><div class="text-sm font-semibold text-white">${ssrInterpolate(unref(loading) ? "…" : formatRelative(unref(repo)?.pushed_at ?? null))}</div><div class="text-xs text-white/50 mt-1">Last Push</div></div></div>`);
      } else if (!__props.timeline.githubRepo) {
        _push(`<div class="glass-morphism rounded-xl border border-dashed border-white/20 p-12 text-center mb-4"><div class="text-4xl mb-3">🔗</div><div class="text-white font-semibold mb-1">Connect a GitHub Repository</div><div class="text-white/40 text-sm">Link this timeline to a GitHub repo to unlock live statistics, commit heatmaps, milestone tracking, and more.</div>`);
        if (__props.adminMode) {
          _push(`<button class="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"> 🔗 Link Repository </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(gh) || unref(loading)) {
        _push(`<div><div class="flex gap-1 mb-4 bg-white/5 rounded-xl p-1 border border-white/10"><!--[-->`);
        ssrRenderList({ overview: "📊 Overview", milestones: "🏁 Milestones", activity: "📋 Activity", codestats: "📈 Code Stats" }, (label, key) => {
          _push(`<button class="${ssrRenderClass([
            "flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all",
            unref(activeTab) === key ? "bg-gradient-to-r from-purple-600/80 to-violet-600/80 text-white shadow-lg" : "text-white/50 hover:text-white/80 hover:bg-white/5"
          ])}">${ssrInterpolate(label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "overview") {
          _push(`<div class="space-y-4"><div class="grid grid-cols-1 lg:grid-cols-5 gap-4"><div class="lg:col-span-2 glass-morphism rounded-xl border border-white/10 p-5 flex flex-col items-center justify-center gap-3"><div class="relative"><svg${ssrRenderAttr("width", RING_R * 2 + RING_STROKE * 2 + 4)}${ssrRenderAttr("height", RING_R * 2 + RING_STROKE * 2 + 4)}><circle${ssrRenderAttr("cx", RING_R + RING_STROKE / 2 + 2)}${ssrRenderAttr("cy", RING_R + RING_STROKE / 2 + 2)}${ssrRenderAttr("r", RING_R)} fill="none" stroke="rgba(255,255,255,0.08)"${ssrRenderAttr("stroke-width", RING_STROKE)}></circle><circle${ssrRenderAttr("cx", RING_R + RING_STROKE / 2 + 2)}${ssrRenderAttr("cy", RING_R + RING_STROKE / 2 + 2)}${ssrRenderAttr("r", RING_R)} fill="none" stroke="url(#ringGrad)"${ssrRenderAttr("stroke-width", RING_STROKE)} stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", `${unref(ringDash)} ${ringCircumference - unref(ringDash)}`)} stroke-dashoffset="0" transform-origin="center" style="${ssrRenderStyle({ "transform": "rotate(-90deg)", "transition": "stroke-dasharray 0.8s ease" })}"></circle><defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#7c3aed"></stop><stop offset="100%" stop-color="#a78bfa"></stop></linearGradient></defs></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-2xl font-black text-white">${ssrInterpolate(unref(progress))}%</span><span class="text-xs text-white/40">complete</span></div></div>`);
          if (unref(timelineProgress)) {
            _push(`<div class="w-full text-xs"><div class="flex justify-between text-white/40 mb-1"><span>Expected</span><span>${ssrInterpolate(unref(timelineProgress).expected)}%</span></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2"><div class="h-full bg-white/30 rounded-full" style="${ssrRenderStyle({ width: `${unref(timelineProgress).expected}%` })}"></div></div><div class="flex justify-between text-white/40 mb-1"><span>Actual</span><span>${ssrInterpolate(unref(timelineProgress).actual)}%</span></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2"><div class="${ssrRenderClass([unref(timelineProgress).isAhead ? "bg-green-500" : "bg-orange-500", "h-full rounded-full transition-all"])}" style="${ssrRenderStyle({ width: `${unref(timelineProgress).actual}%` })}"></div></div><div class="${ssrRenderClass(["text-center font-semibold", unref(timelineProgress).isAhead ? "text-green-400" : "text-orange-400"])}">${ssrInterpolate(unref(timelineProgress).isAhead ? "✅ Ahead of schedule" : "⚠️ Behind schedule")} (${ssrInterpolate(Math.abs(unref(timelineProgress).diff))}%) </div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(repo)) {
            _push(`<div class="w-full space-y-1 text-xs text-white/50 border-t border-white/10 pt-3"><div class="flex justify-between"><span>Created</span><span>${ssrInterpolate(formatDate(unref(repo).created_at))}</span></div><div class="flex justify-between"><span>Size</span><span>${ssrInterpolate(formatBytes(unref(repo).size * 1024))}</span></div><div class="flex justify-between"><span>Branch</span><span class="text-purple-400">${ssrInterpolate(unref(repo).default_branch)}</span></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="lg:col-span-3 glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Tech Stack</h4>`);
          if (!unref(languageData).length) {
            _push(`<div class="text-white/30 text-sm text-center py-4">No language data</div>`);
          } else {
            _push(`<div class="flex items-center gap-6"><svg${ssrRenderAttr("width", DONUT_CX * 2)}${ssrRenderAttr("height", DONUT_CY * 2)} class="flex-shrink-0"><circle${ssrRenderAttr("cx", DONUT_CX)}${ssrRenderAttr("cy", DONUT_CY)}${ssrRenderAttr("r", DONUT_R)} fill="none" stroke="rgba(255,255,255,0.05)"${ssrRenderAttr("stroke-width", DONUT_STROKE)}></circle><!--[-->`);
            ssrRenderList(unref(donutArcs), (arc, i) => {
              _push(`<circle${ssrRenderAttr("cx", DONUT_CX)}${ssrRenderAttr("cy", DONUT_CY)}${ssrRenderAttr("r", DONUT_R)} fill="none"${ssrRenderAttr("stroke", arc.color)}${ssrRenderAttr("stroke-width", DONUT_STROKE)} stroke-linecap="butt"${ssrRenderAttr("stroke-dasharray", `${arc.dash} ${arc.gap}`)}${ssrRenderAttr("stroke-dashoffset", -arc.offset)} style="${ssrRenderStyle({ "transform": "rotate(-90deg)", "transform-origin": "50% 50%" })}"></circle>`);
            });
            _push(`<!--]--></svg><div class="flex-1 space-y-2"><!--[-->`);
            ssrRenderList(unref(languageData), (lang) => {
              _push(`<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full flex-shrink-0" style="${ssrRenderStyle({ background: lang.color })}"></div><span class="text-sm text-white/80">${ssrInterpolate(lang.name)}</span></div><span class="text-xs text-white/50 font-mono">${ssrInterpolate(lang.pct)}%</span></div>`);
            });
            _push(`<!--]--></div></div>`);
          }
          if (unref(repo)?.description) {
            _push(`<div class="mt-4 text-xs text-white/50 border-t border-white/10 pt-3 italic"> &quot;${ssrInterpolate(unref(repo).description)}&quot; </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Commit Activity</h4>`);
          _push(ssrRenderComponent(_component_CommitHeatmap, {
            data: unref(gh)?.commitActivity ?? null,
            loading: unref(loading)
          }, null, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "milestones") {
          _push(`<div class="space-y-4">`);
          if (unref(gh)?.milestones?.length) {
            _push(`<div><h4 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">GitHub Milestones</h4><div class="space-y-3"><!--[-->`);
            ssrRenderList(unref(gh).milestones, (m) => {
              _push(`<div class="glass-morphism rounded-xl border border-white/10 p-4"><div class="flex items-start justify-between gap-3 mb-3"><div><a${ssrRenderAttr("href", m.html_url)} target="_blank" class="font-semibold text-white hover:text-purple-400 transition-colors">${ssrInterpolate(m.title)}</a>`);
              if (m.description) {
                _push(`<div class="text-xs text-white/40 mt-1">${ssrInterpolate(m.description)}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div><span class="${ssrRenderClass([
                "text-xs px-2 py-1 rounded-full border font-semibold flex-shrink-0",
                m.state === "closed" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"
              ])}">${ssrInterpolate(m.state === "closed" ? "✅ Closed" : "🔧 Open")}</span></div><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-white/10 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all" style="${ssrRenderStyle({ width: `${m.open_issues + m.closed_issues > 0 ? Math.round(m.closed_issues / (m.open_issues + m.closed_issues) * 100) : 0}%` })}"></div></div><span class="text-xs text-white/50 flex-shrink-0 font-mono">${ssrInterpolate(m.closed_issues)}/${ssrInterpolate(m.open_issues + m.closed_issues)} issues </span></div>`);
              if (m.due_on) {
                _push(`<div class="text-xs text-white/40 mt-2">📅 Due: ${ssrInterpolate(formatDate(m.due_on))}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.timeline?.milestones?.length) {
            _push(`<div><h4 class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Project Milestones</h4><div class="glass-morphism rounded-xl border border-white/10 p-4 mb-3 overflow-x-auto"><div class="min-w-[500px]"><!--[-->`);
            ssrRenderList(__props.timeline.milestones, (m) => {
              _push(`<div class="flex items-center gap-3 mb-2"><div class="w-36 text-xs text-white/60 truncate flex-shrink-0">${ssrInterpolate(m.title)}</div><div class="flex-1 relative h-6"><div class="absolute inset-0 bg-white/5 rounded"><div class="${ssrRenderClass([
                "absolute top-0 h-full rounded transition-all",
                m.status === "COMPLETED" ? "bg-gradient-to-r from-green-600/70 to-green-500/70" : m.status === "IN_PROGRESS" ? "bg-gradient-to-r from-purple-600/80 to-violet-500/80" : m.status === "DELAYED" ? "bg-gradient-to-r from-orange-600/70 to-orange-500/70" : "bg-white/10"
              ])}" style="${ssrRenderStyle({ "left": "0", "width": "100%" })}"></div></div><div class="absolute inset-0 flex items-center px-2 text-xs text-white/70 truncate">${ssrInterpolate(formatDate(m.startDate))} → ${ssrInterpolate(formatDate(m.endDate))}</div></div><span class="${ssrRenderClass(["text-xs px-2 py-0.5 rounded-full border flex-shrink-0", milestoneStatusClass(m.status)])}">${ssrInterpolate(m.status)}</span></div>`);
            });
            _push(`<!--]--></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(gh)?.milestones?.length && !__props.timeline?.milestones?.length) {
            _push(`<div class="text-center py-8 text-white/30"> No milestones defined yet </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "activity") {
          _push(`<div class="space-y-4"><div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Weekly Commits (Last 12 Weeks)</h4>`);
          if (unref(weeklyBars).length) {
            _push(`<div class="flex items-end gap-1 h-24"><!--[-->`);
            ssrRenderList(unref(weeklyBars), (bar) => {
              _push(`<div class="flex-1 flex flex-col items-center gap-1 group relative cursor-default"><div class="absolute bottom-6 bg-gray-900/90 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">${ssrInterpolate(bar.total)} commits · ${ssrInterpolate(bar.label)}</div><div class="w-full rounded-t-sm bg-gradient-to-t from-purple-700 to-violet-500 transition-all duration-500" style="${ssrRenderStyle({ height: `${bar.height}px` })}"></div></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<div class="text-white/30 text-sm text-center py-4">Loading…</div>`);
          }
          _push(`</div><div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Recent Commits</h4>`);
          if (!unref(gh)?.recentCommits?.length) {
            _push(`<div class="text-white/30 text-sm text-center py-4">${ssrInterpolate(unref(loading) ? "Loading…" : "No commits found")}</div>`);
          } else {
            _push(`<div class="space-y-3"><!--[-->`);
            ssrRenderList(unref(gh).recentCommits.slice(0, 15), (c) => {
              _push(`<div class="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">`);
              if (c.author?.avatar_url) {
                _push(`<img${ssrRenderAttr("src", c.author.avatar_url)}${ssrRenderAttr("alt", c.author.login)} class="w-7 h-7 rounded-full flex-shrink-0 border border-white/10">`);
              } else {
                _push(`<div class="w-7 h-7 rounded-full bg-purple-700/50 flex-shrink-0 flex items-center justify-center text-xs text-white/60">${ssrInterpolate(c.commit.author.name[0])}</div>`);
              }
              _push(`<div class="flex-1 min-w-0"><div class="text-sm text-white/80 leading-snug">${ssrInterpolate(truncate(c.commit.message.split("\n")[0], 80))}</div><div class="flex items-center gap-3 mt-1 text-xs text-white/35"><span>${ssrInterpolate(c.author?.login ?? c.commit.author.name)}</span><span>${ssrInterpolate(formatRelative(c.commit.author.date))}</span><a${ssrRenderAttr("href", c.html_url)} target="_blank" class="font-mono hover:text-purple-400 transition-colors">${ssrInterpolate(c.sha.substring(0, 7))}</a></div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
          if (unref(gh)?.releases?.length) {
            _push(`<div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Releases</h4><div class="space-y-2"><!--[-->`);
            ssrRenderList(unref(gh).releases.slice(0, 6), (r) => {
              _push(`<div class="flex items-center gap-3 p-3 rounded-lg bg-white/5"><div class="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-sm flex-shrink-0">🏷</div><div class="flex-1 min-w-0"><a${ssrRenderAttr("href", r.html_url)} target="_blank" class="text-sm font-semibold text-white hover:text-purple-400 transition-colors">${ssrInterpolate(r.name || r.tag_name)}</a><div class="text-xs text-white/40">${ssrInterpolate(formatDate(r.published_at))}</div></div>`);
              if (r.prerelease) {
                _push(`<span class="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">pre-release</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "codestats") {
          _push(`<div class="space-y-4"><div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-1">Code Frequency</h4><div class="flex gap-4 text-xs text-white/40 mb-4"><span class="flex items-center gap-1"><span class="w-3 h-1 bg-purple-500 inline-block rounded"></span> Additions</span><span class="flex items-center gap-1"><span class="w-3 h-1 bg-pink-500/60 inline-block rounded"></span> Deletions</span></div>`);
          if (!unref(gh)?.codeFrequency) {
            _push(`<div class="text-white/30 text-sm text-center py-8">${ssrInterpolate(unref(loading) ? "Loading…" : "No code frequency data (GitHub may still be computing)")}</div>`);
          } else {
            _push(`<div class="relative"><svg width="100%"${ssrRenderAttr("height", 120)} viewBox="0 0 600 120" preserveAspectRatio="none" class="block"><defs><linearGradient id="addGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7c3aed" stop-opacity="0.8"></stop><stop offset="100%" stop-color="#7c3aed" stop-opacity="0.1"></stop></linearGradient><linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ec4899" stop-opacity="0.6"></stop><stop offset="100%" stop-color="#ec4899" stop-opacity="0.05"></stop></linearGradient></defs><path${ssrRenderAttr("d", svgAreaPath(unref(codeFreqData).adds, unref(codeFreqData).maxVal, 600, 120))} fill="url(#addGrad)" stroke="#7c3aed" stroke-width="1.5"></path><path${ssrRenderAttr("d", svgAreaPath(unref(codeFreqData).dels, unref(codeFreqData).maxVal, 600, 120, true))} fill="url(#delGrad)" stroke="#ec4899" stroke-width="1"></path></svg></div>`);
          }
          _push(`</div><div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Contributors</h4>`);
          if (!unref(gh)?.contributors) {
            _push(`<div class="text-white/30 text-sm text-center py-4">${ssrInterpolate(unref(loading) ? "Computing…" : "No contributor data yet")}</div>`);
          } else {
            _push(`<div class="space-y-3"><!--[-->`);
            ssrRenderList([...unref(gh).contributors ?? []].sort((a, b) => b.total - a.total).slice(0, 10), (c, i) => {
              _push(`<div class="flex items-center gap-3"><div class="w-6 text-xs text-white/30 text-right flex-shrink-0">${ssrInterpolate(i + 1)}</div><img${ssrRenderAttr("src", c.author?.avatar_url)}${ssrRenderAttr("alt", c.author?.login)} class="w-7 h-7 rounded-full border border-white/10 flex-shrink-0"><a${ssrRenderAttr("href", c.author?.html_url)} target="_blank" class="text-sm text-white hover:text-purple-400 transition-colors flex-1 truncate">${ssrInterpolate(c.author?.login)}</a><div class="flex items-center gap-2"><div class="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-400" style="${ssrRenderStyle({ width: `${Math.max(20, Math.round(c.total / (unref(gh).contributors[0]?.total || 1) * 120))}px` })}"></div><span class="text-xs text-white/50 font-mono w-12 text-right">${ssrInterpolate(c.total.toLocaleString())}</span></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
          if (unref(gh)?.pullRequests?.length) {
            _push(`<div class="glass-morphism rounded-xl border border-white/10 p-5"><h4 class="text-sm font-semibold text-white mb-4">Pull Requests</h4><div class="grid grid-cols-3 gap-3 mb-4"><div class="text-center"><div class="text-2xl font-bold text-green-300">${ssrInterpolate(unref(gh).mergedPRs?.length)}</div><div class="text-xs text-white/40">Merged</div></div><div class="text-center"><div class="text-2xl font-bold text-blue-300">${ssrInterpolate(unref(gh).pullRequests.filter((p) => p.state === "open").length)}</div><div class="text-xs text-white/40">Open</div></div><div class="text-center"><div class="text-2xl font-bold text-white/50">${ssrInterpolate(unref(gh).pullRequests.filter((p) => p.state === "closed" && !p.merged_at).length)}</div><div class="text-xs text-white/40">Closed</div></div></div><div class="space-y-2 max-h-48 overflow-y-auto"><!--[-->`);
            ssrRenderList(unref(gh).pullRequests.slice(0, 8), (pr) => {
              _push(`<div class="flex items-center gap-2 text-xs p-2 rounded bg-white/5"><span class="${ssrRenderClass(pr.merged_at ? "text-green-400" : pr.state === "open" ? "text-blue-400" : "text-white/30")}">${ssrInterpolate(pr.merged_at ? "🔀" : pr.state === "open" ? "🔧" : "✕")}</span><a${ssrRenderAttr("href", pr.html_url)} target="_blank" class="flex-1 text-white/70 hover:text-white truncate"> #${ssrInterpolate(pr.number)} ${ssrInterpolate(pr.title)}</a><span class="text-white/30 flex-shrink-0">${ssrInterpolate(formatRelative(pr.created_at))}</span></div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreateProjectModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style="${ssrRenderStyle({ "background": "rgba(20,10,40,0.95)", "backdrop-filter": "blur(20px)" })}"><div class="bg-gradient-to-r from-purple-800/80 to-violet-800/80 px-6 py-4 flex items-center justify-between border-b border-white/10"><div><h3 class="text-white font-bold text-lg">🚀 Create GitHub Project</h3><p class="text-white/50 text-xs mt-0.5">Creates a Projects v2 kanban board + links the repo</p></div><button class="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 text-lg">✕</button></div>`);
          if (unref(createProjectSuccess)) {
            _push2(`<div class="p-6 space-y-4"><div class="text-center py-4"><div class="text-4xl mb-3">🎉</div><div class="text-green-300 font-semibold">GitHub Project created!</div></div><a${ssrRenderAttr("href", unref(createProjectSuccess).projectUrl)} target="_blank" class="flex items-center gap-2 px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-300 hover:text-white hover:bg-purple-600/30 transition-all text-sm"><span>📋</span><span class="flex-1 truncate">View Project Board</span><span class="text-white/40">↗</span></a>`);
            if (unref(createProjectSuccess).milestoneUrl) {
              _push2(`<a${ssrRenderAttr("href", unref(createProjectSuccess).milestoneUrl)} target="_blank" class="flex items-center gap-2 px-4 py-3 bg-green-600/10 border border-green-500/20 rounded-xl text-green-300 hover:text-white hover:bg-green-600/20 transition-all text-sm"><span>🎯</span><span class="flex-1 truncate">View Milestone</span><span class="text-white/40">↗</span></a>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm transition-all"> Close </button></div>`);
          } else {
            _push2(`<div class="p-6 space-y-4">`);
            if (unref(createProjectError)) {
              _push2(`<div class="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"> ⚠️ ${ssrInterpolate(unref(createProjectError))}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs"> ℹ️ Requires <code class="bg-amber-900/40 px-1 rounded">project</code> scope on your GitHub PAT (in addition to <code class="bg-amber-900/40 px-1 rounded">repo</code>). </div><div class="space-y-3"><div><label class="text-xs text-white/50 mb-1 block">Project Name *</label><input${ssrRenderAttr("value", unref(newProjectTitle))} placeholder="My Awesome Project" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-all"></div><div><label class="text-xs text-white/50 mb-1 block">Short Description</label><input${ssrRenderAttr("value", unref(newProjectDesc))} placeholder="Brief project description" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-all"></div><div><label class="text-xs text-white/50 mb-1 block">Visibility</label><div class="flex gap-2"><!--[-->`);
            ssrRenderList(["PRIVATE", "PUBLIC"], (v) => {
              _push2(`<button class="${ssrRenderClass([
                "flex-1 py-2 rounded-lg text-sm border transition-all",
                unref(newProjectVisibility) === v ? "bg-purple-600/30 border-purple-500/50 text-purple-200" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/8"
              ])}">${ssrInterpolate(v === "PRIVATE" ? "🔒 Private" : "🌍 Public")}</button>`);
            });
            _push2(`<!--]--></div></div><div class="border-t border-white/10 pt-3"><div class="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Initial Milestone (optional)</div><div class="space-y-2"><input${ssrRenderAttr("value", unref(newMilestoneName))} placeholder="e.g. v1.0 Launch" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-all"><input${ssrRenderAttr("value", unref(newMilestoneDue))} type="date" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-all"></div></div></div><div class="flex gap-3 pt-2"><button class="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-all"> Cancel </button><button${ssrIncludeBooleanAttr(unref(creatingProject) || !unref(newProjectTitle).trim()) ? " disabled" : ""} class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30">`);
            if (unref(creatingProject)) {
              _push2(`<div class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<span>${ssrInterpolate(unref(creatingProject) ? "Creating…" : "🚀 Create Project")}</span></button></div></div>`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProjectTimelinePanel.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$3, { __name: "ProjectTimelinePanel" });
const neuInputStr = "background: rgba(0,0,0,0.25); box-shadow: inset 2px 2px 8px rgba(0,0,0,0.5), inset -1px -1px 4px rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "CreateInvoiceModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean },
    submissions: {},
    preselectedSubmission: {},
    preGeneratedItems: {},
    preGeneratedTaxRate: {},
    preGeneratedNotes: {}
  },
  emits: ["close", "created"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useAuth();
    let _keyCounter = 0;
    const loading = ref(false);
    const estimating = ref(false);
    const isAutoGenerated = ref(false);
    const formError = ref("");
    const activeSubmitStatus = ref(null);
    const form = reactive({
      submissionId: "",
      currency: "USD",
      taxRate: 0,
      dueDate: "",
      paymentTerms: "NET_30",
      notes: ""
    });
    const items = ref([
      { _key: ++_keyCounter, description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);
    watch(() => props.preselectedSubmission, (sub) => {
      if (sub) form.submissionId = sub.id;
    }, { immediate: true });
    watch(() => props.show, (val) => {
      if (val) {
        formError.value = "";
        if (props.preselectedSubmission) form.submissionId = props.preselectedSubmission.id;
        setDueDate(30);
      }
    });
    watch(() => props.preGeneratedItems, (generated) => {
      if (generated?.length) {
        applyGeneratedItems(generated, props.preGeneratedTaxRate, props.preGeneratedNotes);
      }
    }, { deep: true, immediate: true });
    const selectedSub = computed(
      () => props.submissions.find((s) => s.id === form.submissionId) ?? null
    );
    const subtotal = computed(
      () => items.value.reduce((sum, item) => sum + (item.total || 0), 0)
    );
    const taxAmount = computed(() => subtotal.value * ((form.taxRate || 0) / 100));
    const total = computed(() => subtotal.value + taxAmount.value);
    const todayISO = computed(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
    const todayDisplay = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    );
    const dueDateDisplay = computed(
      () => form.dueDate ? (/* @__PURE__ */ new Date(form.dueDate + "T00:00:00")).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"
    );
    const previewInvoiceNumber = computed(() => {
      const y = (/* @__PURE__ */ new Date()).getFullYear();
      return `INV-${y}-XXXXX`;
    });
    const paymentTermsLabel = computed(() => {
      const map = {
        IMMEDIATE: "Due Immediately",
        NET_7: "Net 7 Days",
        NET_14: "Net 14 Days",
        NET_30: "Net 30 Days",
        NET_60: "Net 60 Days"
      };
      return map[form.paymentTerms] || form.paymentTerms;
    });
    const neuInput = neuInputStr;
    const dueDatePresets = [
      { label: "7 days", days: 7 },
      { label: "14 days", days: 14 },
      { label: "30 days", days: 30 },
      { label: "60 days", days: 60 }
    ];
    const setDueDate = (days) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + days);
      form.dueDate = d.toISOString().split("T")[0];
    };
    const isDueDatePreset = (days) => {
      if (!form.dueDate) return false;
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split("T")[0] === form.dueDate;
    };
    const applyGeneratedItems = (generated, taxRate, notes) => {
      items.value = generated.map((item) => ({
        _key: ++_keyCounter,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }));
      if (taxRate !== void 0) form.taxRate = Math.round(taxRate * 100);
      if (notes) form.notes = notes;
      isAutoGenerated.value = true;
    };
    const isStepComplete = (step) => {
      if (step === 0) return !!form.submissionId;
      if (step === 1) return items.value.length > 0 && items.value.some((i) => i.description);
      if (step === 2) return subtotal.value > 0;
      if (step === 3) return !!form.dueDate;
      return false;
    };
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      GHS: "₵",
      CAD: "C$",
      AUD: "A$"
    };
    const formatCurrency = (amount) => {
      const sym = currencySymbols[form.currency] || "$";
      return `${sym}${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };
    const formatAmount = (amount) => formatCurrency(amount);
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.show) {
          _push2(`<div class="fixed inset-0 z-[9999] flex items-start justify-center p-4 overflow-y-auto" style="${ssrRenderStyle({ "padding-top": "max(1rem, env(safe-area-inset-top))" })}" data-v-30419ad1><div class="fixed inset-0 bg-black/80 backdrop-blur-md" data-v-30419ad1></div><div class="relative w-full max-w-[1400px] my-4 flex flex-col rounded-2xl overflow-hidden border border-purple-500/20" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(12,8,32,0.98) 0%, rgba(22,8,48,0.98) 100%)", "box-shadow": "0 0 120px rgba(168,85,247,0.15), 0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)" })}" data-v-30419ad1><div class="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-purple-500/20" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, rgba(88,28,135,0.6) 0%, rgba(126,34,206,0.4) 50%, rgba(190,24,93,0.3) 100%)" })}" data-v-30419ad1><div class="flex items-center gap-4" data-v-30419ad1><div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #7c3aed, #db2777)", "box-shadow": "0 0 24px rgba(168,85,247,0.5)" })}" data-v-30419ad1> 🧾 </div><div data-v-30419ad1><h2 class="text-xl font-bold text-white leading-tight" data-v-30419ad1>Create Professional Invoice</h2><p class="text-purple-300/60 text-xs tracking-widest uppercase" data-v-30419ad1>CharaTech · Software Requirements Platform</p></div></div><div class="flex items-center gap-3" data-v-30419ad1><div class="hidden md:flex items-center gap-2 mr-4" data-v-30419ad1><!--[-->`);
          ssrRenderList(["Client", "Items", "Pricing", "Details"], (step, i) => {
            _push2(`<div class="flex items-center gap-1.5" data-v-30419ad1><div class="${ssrRenderClass([
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              isStepComplete(i) ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]" : "bg-white/10 text-white/40"
            ])}" data-v-30419ad1>${ssrInterpolate(i + 1)}</div><span class="${ssrRenderClass(["text-xs", isStepComplete(i) ? "text-purple-300" : "text-white/30"])}" data-v-30419ad1>${ssrInterpolate(step)}</span>`);
            if (i < 3) {
              _push2(`<span class="text-white/20 text-xs ml-1" data-v-30419ad1>›</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          });
          _push2(`<!--]--></div><button class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition border border-white/10" data-v-30419ad1> ✕ </button></div></div><div class="flex min-h-0" style="${ssrRenderStyle({ "max-height": "calc(90vh - 130px)" })}" data-v-30419ad1><div class="w-full lg:w-[52%] overflow-y-auto p-6 space-y-5" style="${ssrRenderStyle({ "scrollbar-width": "thin", "scrollbar-color": "rgba(168,85,247,0.3) transparent" })}" data-v-30419ad1><div class="rounded-xl border border-white/8 overflow-hidden" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.02)" })}" data-v-30419ad1><div class="px-5 py-3 border-b border-white/5 flex items-center gap-2" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.06)" })}" data-v-30419ad1><span class="text-purple-400" data-v-30419ad1>👤</span><h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider" data-v-30419ad1>Client &amp; Project</h3></div><div class="p-5 space-y-4" data-v-30419ad1><div data-v-30419ad1><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5" data-v-30419ad1>Link to Submission <span class="text-red-400" data-v-30419ad1>*</span></label><div class="relative" data-v-30419ad1><select style="${ssrRenderStyle(unref(neuInput))}" class="${ssrRenderClass([{ "ring-2 ring-purple-500/60": form.submissionId }, "w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10"])}" data-v-30419ad1><option value="" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.submissionId) ? ssrLooseContain(form.submissionId, "") : ssrLooseEqual(form.submissionId, "")) ? " selected" : ""}>— Select a submission —</option><!--[-->`);
          ssrRenderList(__props.submissions, (sub) => {
            _push2(`<option${ssrRenderAttr("value", sub.id)} class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.submissionId) ? ssrLooseContain(form.submissionId, sub.id) : ssrLooseEqual(form.submissionId, sub.id)) ? " selected" : ""}>${ssrInterpolate(sub.projectName)} · ${ssrInterpolate(sub.user?.email)}</option>`);
          });
          _push2(`<!--]--></select><div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" data-v-30419ad1>▾</div></div></div>`);
          if (selectedSub.value) {
            _push2(`<div class="grid grid-cols-2 gap-3 p-4 rounded-xl border border-purple-500/15" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.05)" })}" data-v-30419ad1><div data-v-30419ad1><p class="text-white/30 text-xs uppercase tracking-wider mb-0.5" data-v-30419ad1>Client</p><p class="text-white font-medium text-sm" data-v-30419ad1>${ssrInterpolate(selectedSub.value.user?.fullName || selectedSub.value.user?.email)}</p></div><div data-v-30419ad1><p class="text-white/30 text-xs uppercase tracking-wider mb-0.5" data-v-30419ad1>Email</p><p class="text-white/70 text-sm truncate" data-v-30419ad1>${ssrInterpolate(selectedSub.value.user?.email)}</p></div><div data-v-30419ad1><p class="text-white/30 text-xs uppercase tracking-wider mb-0.5" data-v-30419ad1>Company</p><p class="text-white/70 text-sm" data-v-30419ad1>${ssrInterpolate(selectedSub.value.user?.companyName || "—")}</p></div><div data-v-30419ad1><p class="text-white/30 text-xs uppercase tracking-wider mb-0.5" data-v-30419ad1>Project</p><p class="text-purple-300 text-sm font-medium truncate" data-v-30419ad1>${ssrInterpolate(selectedSub.value.projectName)}</p></div></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div><div class="rounded-xl border border-white/8 overflow-hidden" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.02)" })}" data-v-30419ad1><div class="px-5 py-3 border-b border-white/5 flex items-center justify-between" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.06)" })}" data-v-30419ad1><div class="flex items-center gap-2" data-v-30419ad1><span class="text-purple-400" data-v-30419ad1>📋</span><h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider" data-v-30419ad1>Line Items</h3></div><div class="flex items-center gap-2" data-v-30419ad1>`);
          if (form.submissionId) {
            _push2(`<button${ssrIncludeBooleanAttr(estimating.value) ? " disabled" : ""} class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(219,39,119,0.2))", "border": "1px solid rgba(168,85,247,0.4)", "color": "#c084fc" })}" data-v-30419ad1>`);
            if (estimating.value) {
              _push2(`<svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" data-v-30419ad1><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-30419ad1></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" data-v-30419ad1></path></svg>`);
            } else {
              _push2(`<span data-v-30419ad1>🧮</span>`);
            }
            _push2(` ${ssrInterpolate(estimating.value ? "Estimating…" : "Smart Estimate")}</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<span class="text-xs text-white/30" data-v-30419ad1>${ssrInterpolate(items.value.length)} item${ssrInterpolate(items.value.length !== 1 ? "s" : "")}</span></div></div>`);
          if (isAutoGenerated.value) {
            _push2(`<div class="mx-5 mt-4 px-4 py-2.5 rounded-lg flex items-center gap-3 text-xs" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(34,211,238,0.08))", "border": "1px solid rgba(168,85,247,0.25)" })}" data-v-30419ad1><span class="text-lg" data-v-30419ad1>✨</span><div data-v-30419ad1><span class="text-purple-300 font-semibold" data-v-30419ad1>AI-generated estimate</span><span class="text-white/50 ml-1" data-v-30419ad1>— review and adjust each line item below before saving.</span></div><button class="ml-auto text-white/30 hover:text-white/60 text-base leading-none" data-v-30419ad1>×</button></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="p-5" data-v-30419ad1><div class="grid gap-2 mb-2 px-1" style="${ssrRenderStyle({ "grid-template-columns": "1fr 70px 110px 100px 32px" })}" data-v-30419ad1><span class="text-xs text-white/30 uppercase tracking-wider" data-v-30419ad1>Description</span><span class="text-xs text-white/30 uppercase tracking-wider text-center" data-v-30419ad1>Qty</span><span class="text-xs text-white/30 uppercase tracking-wider text-right" data-v-30419ad1>Unit Price</span><span class="text-xs text-white/30 uppercase tracking-wider text-right" data-v-30419ad1>Total</span><span data-v-30419ad1></span></div><div${ssrRenderAttrs({
            name: "item-list",
            class: "space-y-2"
          })} data-v-30419ad1>`);
          ssrRenderList(items.value, (item, i) => {
            _push2(`<div class="grid gap-2 items-center group" style="${ssrRenderStyle({ "grid-template-columns": "1fr 70px 110px 100px 32px" })}" data-v-30419ad1><input${ssrRenderAttr("value", item.description)} placeholder="Service description…" class="px-3 py-2 rounded-lg text-white text-sm placeholder-white/20 outline-none transition-all duration-200" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1><input${ssrRenderAttr("value", item.quantity)} type="number" min="1" class="px-3 py-2 rounded-lg text-white text-sm text-center outline-none transition-all duration-200" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1><input${ssrRenderAttr("value", item.unitPrice)} type="number" min="0" step="0.01" placeholder="0.00" class="px-3 py-2 rounded-lg text-white text-sm text-right outline-none transition-all duration-200" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1><div class="px-3 py-2 rounded-lg text-right text-sm font-semibold text-purple-300" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.08)", "border": "1px solid rgba(168,85,247,0.15)" })}" data-v-30419ad1>${ssrInterpolate(formatAmount(item.total))}</div><button class="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100" title="Remove item" data-v-30419ad1> × </button></div>`);
          });
          _push2(`</div><button class="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-purple-400 hover:text-purple-300 transition-all duration-200 flex items-center justify-center gap-2 group" style="${ssrRenderStyle({ "border": "1px dashed rgba(168,85,247,0.3)", "background": "rgba(168,85,247,0.03)" })}" data-v-30419ad1><span class="text-lg leading-none group-hover:scale-125 transition-transform" data-v-30419ad1>+</span> Add Line Item </button></div></div><div class="rounded-xl border border-white/8 overflow-hidden" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.02)" })}" data-v-30419ad1><div class="px-5 py-3 border-b border-white/5 flex items-center gap-2" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.06)" })}" data-v-30419ad1><span class="text-purple-400" data-v-30419ad1>💰</span><h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider" data-v-30419ad1>Pricing</h3></div><div class="p-5 space-y-4" data-v-30419ad1><div class="grid grid-cols-2 gap-4" data-v-30419ad1><div data-v-30419ad1><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5" data-v-30419ad1>Currency</label><div class="relative" data-v-30419ad1><select class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1><option value="USD" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.currency) ? ssrLooseContain(form.currency, "USD") : ssrLooseEqual(form.currency, "USD")) ? " selected" : ""}>USD — US Dollar ($)</option><option value="EUR" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.currency) ? ssrLooseContain(form.currency, "EUR") : ssrLooseEqual(form.currency, "EUR")) ? " selected" : ""}>EUR — Euro (€)</option><option value="GBP" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.currency) ? ssrLooseContain(form.currency, "GBP") : ssrLooseEqual(form.currency, "GBP")) ? " selected" : ""}>GBP — British Pound (£)</option><option value="GHS" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.currency) ? ssrLooseContain(form.currency, "GHS") : ssrLooseEqual(form.currency, "GHS")) ? " selected" : ""}>GHS — Ghana Cedi (₵)</option><option value="CAD" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.currency) ? ssrLooseContain(form.currency, "CAD") : ssrLooseEqual(form.currency, "CAD")) ? " selected" : ""}>CAD — Canadian Dollar (C$)</option><option value="AUD" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.currency) ? ssrLooseContain(form.currency, "AUD") : ssrLooseEqual(form.currency, "AUD")) ? " selected" : ""}>AUD — Australian Dollar (A$)</option></select><div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" data-v-30419ad1>▾</div></div></div><div data-v-30419ad1><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5" data-v-30419ad1>Tax Rate (%)</label><input${ssrRenderAttr("value", form.taxRate)} type="number" min="0" max="100" step="0.5" placeholder="0" class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1></div></div><div class="rounded-xl p-4 space-y-2 border border-white/5" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.2)" })}" data-v-30419ad1><div class="flex justify-between text-sm" data-v-30419ad1><span class="text-white/50" data-v-30419ad1>Subtotal</span><span class="text-white" data-v-30419ad1>${ssrInterpolate(formatCurrency(subtotal.value))}</span></div>`);
          if (form.taxRate > 0) {
            _push2(`<div class="flex justify-between text-sm" data-v-30419ad1><span class="text-white/50" data-v-30419ad1>Tax (${ssrInterpolate(form.taxRate)}%)</span><span class="text-white" data-v-30419ad1>${ssrInterpolate(formatCurrency(taxAmount.value))}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-between items-center pt-2 border-t border-purple-500/20" data-v-30419ad1><span class="text-white font-bold" data-v-30419ad1>TOTAL</span><span class="text-2xl font-black text-purple-300 tabular-nums" style="${ssrRenderStyle({ "text-shadow": "0 0 20px rgba(168,85,247,0.8), 0 0 40px rgba(168,85,247,0.3)" })}" data-v-30419ad1>${ssrInterpolate(formatCurrency(total.value))}</span></div></div></div></div><div class="rounded-xl border border-white/8 overflow-hidden" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.02)" })}" data-v-30419ad1><div class="px-5 py-3 border-b border-white/5 flex items-center gap-2" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.06)" })}" data-v-30419ad1><span class="text-purple-400" data-v-30419ad1>📅</span><h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider" data-v-30419ad1>Invoice Details</h3></div><div class="p-5 space-y-4" data-v-30419ad1><div data-v-30419ad1><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5" data-v-30419ad1>Due Date</label><div class="flex gap-2 mb-2 flex-wrap" data-v-30419ad1><!--[-->`);
          ssrRenderList(dueDatePresets, (preset) => {
            _push2(`<button class="${ssrRenderClass([
              "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
              isDueDatePreset(preset.days) ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-white/10 bg-white/5 text-white/50 hover:border-purple-500/40 hover:text-white/80"
            ])}" data-v-30419ad1>${ssrInterpolate(preset.label)}</button>`);
          });
          _push2(`<!--]--></div><input${ssrRenderAttr("value", form.dueDate)} type="date" class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200" style="${ssrRenderStyle(unref(neuInput))}"${ssrRenderAttr("min", todayISO.value)} data-v-30419ad1></div><div data-v-30419ad1><label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5" data-v-30419ad1>Payment Terms</label><div class="relative" data-v-30419ad1><select class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-200 appearance-none pr-10" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1><option value="IMMEDIATE" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.paymentTerms) ? ssrLooseContain(form.paymentTerms, "IMMEDIATE") : ssrLooseEqual(form.paymentTerms, "IMMEDIATE")) ? " selected" : ""}>Due Immediately</option><option value="NET_7" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.paymentTerms) ? ssrLooseContain(form.paymentTerms, "NET_7") : ssrLooseEqual(form.paymentTerms, "NET_7")) ? " selected" : ""}>Net 7 Days</option><option value="NET_14" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.paymentTerms) ? ssrLooseContain(form.paymentTerms, "NET_14") : ssrLooseEqual(form.paymentTerms, "NET_14")) ? " selected" : ""}>Net 14 Days</option><option value="NET_30" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.paymentTerms) ? ssrLooseContain(form.paymentTerms, "NET_30") : ssrLooseEqual(form.paymentTerms, "NET_30")) ? " selected" : ""}>Net 30 Days</option><option value="NET_60" class="bg-gray-900" data-v-30419ad1${ssrIncludeBooleanAttr(Array.isArray(form.paymentTerms) ? ssrLooseContain(form.paymentTerms, "NET_60") : ssrLooseEqual(form.paymentTerms, "NET_60")) ? " selected" : ""}>Net 60 Days</option></select><div class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" data-v-30419ad1>▾</div></div></div></div></div><div class="rounded-xl border border-white/8 overflow-hidden" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.02)" })}" data-v-30419ad1><div class="px-5 py-3 border-b border-white/5 flex items-center gap-2" style="${ssrRenderStyle({ "background": "rgba(168,85,247,0.06)" })}" data-v-30419ad1><span class="text-purple-400" data-v-30419ad1>📝</span><h3 class="text-sm font-semibold text-white/80 uppercase tracking-wider" data-v-30419ad1>Notes &amp; Terms</h3></div><div class="p-5" data-v-30419ad1><textarea rows="4" placeholder="Payment instructions, special terms, or additional notes for the client…" class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/20 outline-none transition-all duration-200 resize-none" style="${ssrRenderStyle(unref(neuInput))}" data-v-30419ad1>${ssrInterpolate(form.notes)}</textarea></div></div></div><div class="hidden lg:flex lg:w-[48%] border-l border-white/8 overflow-y-auto flex-col bg-black/10 p-5" style="${ssrRenderStyle({ "scrollbar-width": "thin", "scrollbar-color": "rgba(168,85,247,0.2) transparent" })}" data-v-30419ad1><div class="flex items-center gap-2 mb-4" data-v-30419ad1><div class="h-px flex-1 bg-white/5" data-v-30419ad1></div><span class="text-xs text-white/25 uppercase tracking-widest" data-v-30419ad1>Live Preview</span><div class="h-px flex-1 bg-white/5" data-v-30419ad1></div></div><div class="rounded-2xl overflow-hidden border border-white/8 flex-1" style="${ssrRenderStyle({ "background": "rgba(20,12,45,0.8)" })}" data-v-30419ad1><div class="px-8 py-6" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(126,34,206,0.7) 50%, rgba(190,24,93,0.5) 100%)" })}" data-v-30419ad1><div class="flex justify-between items-start" data-v-30419ad1><div data-v-30419ad1><div class="text-3xl font-black tracking-tighter text-white mb-0.5" data-v-30419ad1>CHARATECH</div><div class="text-purple-300/60 text-xs tracking-widest uppercase" data-v-30419ad1>Software Requirements Platform</div></div><div class="text-right" data-v-30419ad1><div class="text-white/40 text-[10px] uppercase tracking-widest mb-1" data-v-30419ad1>Invoice</div><div class="text-white font-bold text-lg tabular-nums" data-v-30419ad1>${ssrInterpolate(previewInvoiceNumber.value)}</div></div></div></div><div class="grid grid-cols-3 border-b border-white/5 bg-purple-900/10" data-v-30419ad1><div class="px-5 py-3 border-r border-white/5" data-v-30419ad1><p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5" data-v-30419ad1>Issue Date</p><p class="text-white text-sm font-medium" data-v-30419ad1>${ssrInterpolate(todayDisplay.value)}</p></div><div class="px-5 py-3 border-r border-white/5" data-v-30419ad1><p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5" data-v-30419ad1>Due Date</p><p class="text-white text-sm font-medium" data-v-30419ad1>${ssrInterpolate(dueDateDisplay.value)}</p></div><div class="px-5 py-3" data-v-30419ad1><p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5" data-v-30419ad1>Currency</p><p class="text-white text-sm font-medium" data-v-30419ad1>${ssrInterpolate(form.currency)}</p></div></div><div class="grid grid-cols-2 gap-0 border-b border-white/5" data-v-30419ad1><div class="px-6 py-5 border-r border-white/5" data-v-30419ad1><p class="text-white/30 text-[10px] uppercase tracking-widest mb-2" data-v-30419ad1>From</p><p class="text-white font-bold text-sm" data-v-30419ad1>CharaTech Ltd.</p><p class="text-white/50 text-xs mt-0.5" data-v-30419ad1>info@charatech.com</p><p class="text-white/50 text-xs" data-v-30419ad1>charatech-web.netlify.app</p></div><div class="px-6 py-5" data-v-30419ad1><p class="text-white/30 text-[10px] uppercase tracking-widest mb-2" data-v-30419ad1>Bill To</p><p class="text-white font-bold text-sm" data-v-30419ad1>${ssrInterpolate(selectedSub.value?.user?.fullName || selectedSub.value?.user?.email || "— client —")}</p><p class="text-white/50 text-xs mt-0.5" data-v-30419ad1>${ssrInterpolate(selectedSub.value?.user?.email || "")}</p><p class="text-white/50 text-xs" data-v-30419ad1>${ssrInterpolate(selectedSub.value?.user?.companyName || "")}</p></div></div>`);
          if (selectedSub.value) {
            _push2(`<div class="px-6 py-3 border-b border-white/5 bg-purple-900/10 flex items-center gap-3" data-v-30419ad1><span class="text-white/30 text-[10px] uppercase tracking-widest" data-v-30419ad1>Project:</span><span class="text-purple-300 text-sm font-medium" data-v-30419ad1>${ssrInterpolate(selectedSub.value.projectName)}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="px-6 pt-5 pb-3" data-v-30419ad1><table class="w-full text-xs" data-v-30419ad1><thead data-v-30419ad1><tr class="border-b border-white/8" data-v-30419ad1><th class="text-left text-white/30 uppercase tracking-wider pb-2 font-medium" data-v-30419ad1>Description</th><th class="text-center text-white/30 uppercase tracking-wider pb-2 font-medium w-12" data-v-30419ad1>Qty</th><th class="text-right text-white/30 uppercase tracking-wider pb-2 font-medium w-24" data-v-30419ad1>Price</th><th class="text-right text-white/30 uppercase tracking-wider pb-2 font-medium w-24" data-v-30419ad1>Total</th></tr></thead><tbody data-v-30419ad1>`);
          if (!items.value.length) {
            _push2(`<tr data-v-30419ad1><td colspan="4" class="py-6 text-center text-white/15 italic" data-v-30419ad1> Add items to see them here </td></tr>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<!--[-->`);
          ssrRenderList(items.value, (item, i) => {
            _push2(`<tr class="${ssrRenderClass(["border-b border-white/5", i % 2 === 0 ? "" : "bg-white/[0.01]"])}" data-v-30419ad1><td class="py-2.5 text-white/80 pr-3" data-v-30419ad1>${ssrInterpolate(item.description || "Service item…")}</td><td class="py-2.5 text-center text-white/50" data-v-30419ad1>${ssrInterpolate(item.quantity)}</td><td class="py-2.5 text-right text-white/50 tabular-nums" data-v-30419ad1>${ssrInterpolate(formatCurrency(item.unitPrice))}</td><td class="py-2.5 text-right text-white font-semibold tabular-nums" data-v-30419ad1>${ssrInterpolate(formatCurrency(item.total))}</td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="px-6 pb-5 flex justify-end" data-v-30419ad1><div class="w-56 space-y-1.5" data-v-30419ad1><div class="flex justify-between text-xs text-white/50" data-v-30419ad1><span data-v-30419ad1>Subtotal</span><span class="tabular-nums" data-v-30419ad1>${ssrInterpolate(formatCurrency(subtotal.value))}</span></div>`);
          if (form.taxRate > 0) {
            _push2(`<div class="flex justify-between text-xs text-white/50" data-v-30419ad1><span data-v-30419ad1>Tax (${ssrInterpolate(form.taxRate)}%)</span><span class="tabular-nums" data-v-30419ad1>${ssrInterpolate(formatCurrency(taxAmount.value))}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-between items-baseline pt-2 border-t border-purple-500/25" data-v-30419ad1><span class="text-white font-bold text-sm" data-v-30419ad1>Total Due</span><span class="text-xl font-black text-purple-300 tabular-nums" style="${ssrRenderStyle({ "text-shadow": "0 0 16px rgba(168,85,247,0.9), 0 0 32px rgba(168,85,247,0.4)" })}" data-v-30419ad1>${ssrInterpolate(formatCurrency(total.value))}</span></div></div></div>`);
          if (form.notes) {
            _push2(`<div class="px-6 py-4 border-t border-white/5" data-v-30419ad1><p class="text-white/30 text-[10px] uppercase tracking-widest mb-1.5" data-v-30419ad1>Notes</p><p class="text-white/60 text-xs whitespace-pre-wrap leading-relaxed" data-v-30419ad1>${ssrInterpolate(form.notes)}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          if (form.paymentTerms) {
            _push2(`<div class="px-6 py-3 border-t border-white/5 flex items-center gap-2" data-v-30419ad1><span class="text-white/25 text-[10px] uppercase tracking-widest" data-v-30419ad1>Terms:</span><span class="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300/70 text-xs" data-v-30419ad1>${ssrInterpolate(paymentTermsLabel.value)}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="px-6 py-3 text-center border-t border-white/5" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, rgba(88,28,135,0.15) 0%, rgba(190,24,93,0.1) 100%)" })}" data-v-30419ad1><p class="text-white/25 text-[10px] tracking-widest uppercase" data-v-30419ad1>Thank you for choosing CharaTech · info@charatech.com</p></div></div></div></div><div class="flex-shrink-0 border-t border-white/8 px-8 py-4 flex items-center justify-between gap-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.35)" })}" data-v-30419ad1><div data-v-30419ad1>`);
          if (formError.value) {
            _push2(`<p class="text-red-400 text-sm flex items-center gap-2" data-v-30419ad1><span data-v-30419ad1>⚠</span> ${ssrInterpolate(formError.value)}</p>`);
          } else {
            _push2(`<p class="text-white/30 text-xs tabular-nums" data-v-30419ad1>${ssrInterpolate(items.value.length)} item${ssrInterpolate(items.value.length !== 1 ? "s" : "")} · Total ${ssrInterpolate(formatCurrency(total.value))}</p>`);
          }
          _push2(`</div><div class="flex items-center gap-3" data-v-30419ad1><button class="px-5 py-2.5 rounded-xl text-white/60 hover:text-white text-sm font-medium transition border border-white/10 hover:border-white/20 hover:bg-white/5" data-v-30419ad1> Cancel </button><button${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="relative px-6 py-2.5 rounded-xl text-sm font-semibold text-white/90 transition-all duration-200 border border-white/15 overflow-hidden" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.06)" })}" data-v-30419ad1>`);
          if (loading.value && activeSubmitStatus.value === "DRAFT") {
            _push2(`<span class="flex items-center gap-2" data-v-30419ad1><svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" data-v-30419ad1><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-30419ad1></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" data-v-30419ad1></path></svg> Saving… </span>`);
          } else {
            _push2(`<span data-v-30419ad1>Save as Draft</span>`);
          }
          _push2(`</button><button${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="relative px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #7c3aed, #db2777)", "box-shadow": "0 0 20px rgba(168,85,247,0.3)" })}" data-v-30419ad1>`);
          if (loading.value && activeSubmitStatus.value === "SENT") {
            _push2(`<span class="flex items-center gap-2" data-v-30419ad1><svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" data-v-30419ad1><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-30419ad1></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" data-v-30419ad1></path></svg> Sending… </span>`);
          } else {
            _push2(`<span class="flex items-center gap-2" data-v-30419ad1>Create &amp; Send <span data-v-30419ad1>→</span></span>`);
          }
          _push2(`</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CreateInvoiceModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-30419ad1"]]), { __name: "CreateInvoiceModal" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "InvoicePreviewModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean },
    invoice: {}
  },
  emits: ["close", "updated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useAuth();
    const actionLoading = ref(false);
    const actionError = ref("");
    const currency = computed(() => props.invoice?.currency || "USD");
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      GHS: "₵",
      CAD: "C$",
      AUD: "A$"
    };
    const formatCurrency = (amount) => {
      const sym = currencySymbols[currency.value] || "$";
      return `${sym}${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };
    const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
    const issuedDisplay = computed(() => formatDate(props.invoice?.createdAt));
    const dueDateDisplay = computed(() => props.invoice?.dueDate ? formatDate(props.invoice.dueDate) : "—");
    const isOverdue = computed(() => {
      if (!props.invoice?.dueDate) return false;
      return new Date(props.invoice.dueDate) < /* @__PURE__ */ new Date() && props.invoice.status !== "PAID";
    });
    const parsedItems = computed(() => {
      const raw = props.invoice?.items;
      if (!raw) return [];
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
      return Array.isArray(raw) ? raw : [];
    });
    const statusClass = computed(() => {
      const map = {
        DRAFT: "bg-gray-500/20 text-gray-300",
        SENT: "bg-blue-500/20 text-blue-300",
        PAID: "bg-green-500/20 text-green-300",
        OVERDUE: "bg-red-500/20 text-red-300",
        CANCELLED: "bg-gray-500/20 text-gray-400 line-through"
      };
      return map[props.invoice?.status] || "bg-gray-500/20 text-gray-300";
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.show && __props.invoice) {
          _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" data-v-3965614c><div class="absolute inset-0 bg-black/80 backdrop-blur-md" data-v-3965614c></div><div class="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden border border-purple-500/20" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(12,8,32,0.98) 0%, rgba(22,8,48,0.98) 100%)", "box-shadow": "0 0 100px rgba(168,85,247,0.12), 0 0 40px rgba(0,0,0,0.8)" })}" data-v-3965614c><div class="flex-shrink-0 flex items-center justify-between px-7 py-4 border-b border-purple-500/20" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, rgba(88,28,135,0.6) 0%, rgba(190,24,93,0.3) 100%)" })}" data-v-3965614c><div class="flex items-center gap-3" data-v-3965614c><div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #7c3aed, #db2777)", "box-shadow": "0 0 16px rgba(168,85,247,0.4)" })}" data-v-3965614c> 🧾 </div><div data-v-3965614c><h2 class="text-base font-bold text-white" data-v-3965614c>${ssrInterpolate(__props.invoice.invoiceNumber)}</h2><div class="flex items-center gap-2 mt-0.5" data-v-3965614c><span class="${ssrRenderClass(["px-2 py-0.5 rounded-md text-xs font-semibold", statusClass.value])}" data-v-3965614c>${ssrInterpolate(__props.invoice.status)}</span><span class="text-white/30 text-xs" data-v-3965614c>Issued ${ssrInterpolate(issuedDisplay.value)}</span></div></div></div><div class="flex items-center gap-2" data-v-3965614c><button class="px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white transition border border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center gap-1.5" data-v-3965614c> 🖨️ Print </button><button class="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition border border-white/10" data-v-3965614c> ✕ </button></div></div><div class="flex-1 overflow-y-auto p-6" style="${ssrRenderStyle({ "scrollbar-width": "thin", "scrollbar-color": "rgba(168,85,247,0.2) transparent" })}" data-v-3965614c><div id="invoice-print-area" class="rounded-2xl overflow-hidden border border-white/8" style="${ssrRenderStyle({ "background": "rgba(20,12,45,0.8)" })}" data-v-3965614c><div class="px-8 py-7" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(88,28,135,0.9) 0%, rgba(126,34,206,0.7) 50%, rgba(190,24,93,0.5) 100%)" })}" data-v-3965614c><div class="flex justify-between items-start" data-v-3965614c><div data-v-3965614c><div class="text-3xl font-black tracking-tighter text-white mb-1" data-v-3965614c>CHARATECH</div><div class="text-purple-300/60 text-xs tracking-widest uppercase" data-v-3965614c>Software Requirements Platform</div></div><div class="text-right" data-v-3965614c><div class="text-white/40 text-[10px] uppercase tracking-widest mb-1" data-v-3965614c>Invoice</div><div class="text-white font-bold text-2xl" data-v-3965614c>${ssrInterpolate(__props.invoice.invoiceNumber)}</div><div class="${ssrRenderClass(["mt-2 px-3 py-1 rounded-full text-xs font-bold inline-block", statusClass.value])}" data-v-3965614c>${ssrInterpolate(__props.invoice.status)}</div></div></div></div><div class="grid grid-cols-3 border-b border-white/5 bg-purple-900/10" data-v-3965614c><div class="px-6 py-3 border-r border-white/5" data-v-3965614c><p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5" data-v-3965614c>Issue Date</p><p class="text-white text-sm font-medium" data-v-3965614c>${ssrInterpolate(issuedDisplay.value)}</p></div><div class="px-6 py-3 border-r border-white/5" data-v-3965614c><p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5" data-v-3965614c>Due Date</p><p class="${ssrRenderClass(["text-sm font-medium", isOverdue.value ? "text-red-400" : "text-white"])}" data-v-3965614c>${ssrInterpolate(dueDateDisplay.value)}</p></div><div class="px-6 py-3" data-v-3965614c><p class="text-white/30 text-[10px] uppercase tracking-widest mb-0.5" data-v-3965614c>Currency</p><p class="text-white text-sm font-medium" data-v-3965614c>${ssrInterpolate(__props.invoice.currency || "USD")}</p></div></div><div class="grid grid-cols-2 border-b border-white/5" data-v-3965614c><div class="px-6 py-5 border-r border-white/5" data-v-3965614c><p class="text-white/30 text-[10px] uppercase tracking-widest mb-2" data-v-3965614c>From</p><p class="text-white font-bold" data-v-3965614c>CharaTech Ltd.</p><p class="text-white/50 text-sm mt-0.5" data-v-3965614c>info@charatech.com</p><p class="text-white/50 text-sm" data-v-3965614c>charatech-web.netlify.app</p></div><div class="px-6 py-5" data-v-3965614c><p class="text-white/30 text-[10px] uppercase tracking-widest mb-2" data-v-3965614c>Bill To</p><p class="text-white font-bold" data-v-3965614c>${ssrInterpolate(__props.invoice.client?.fullName || __props.invoice.client?.email || "Client")}</p><p class="text-white/50 text-sm mt-0.5" data-v-3965614c>${ssrInterpolate(__props.invoice.client?.email)}</p><p class="text-white/50 text-sm" data-v-3965614c>${ssrInterpolate(__props.invoice.client?.companyName)}</p></div></div><div class="px-6 pt-6 pb-4" data-v-3965614c><table class="w-full text-sm" data-v-3965614c><thead data-v-3965614c><tr class="border-b border-white/8" data-v-3965614c><th class="text-left text-white/30 uppercase text-xs tracking-wider pb-3 font-medium" data-v-3965614c>Description</th><th class="text-center text-white/30 uppercase text-xs tracking-wider pb-3 font-medium w-16" data-v-3965614c>Qty</th><th class="text-right text-white/30 uppercase text-xs tracking-wider pb-3 font-medium w-28" data-v-3965614c>Unit Price</th><th class="text-right text-white/30 uppercase text-xs tracking-wider pb-3 font-medium w-28" data-v-3965614c>Total</th></tr></thead><tbody data-v-3965614c><!--[-->`);
          ssrRenderList(parsedItems.value, (item, i) => {
            _push2(`<tr class="${ssrRenderClass(["border-b border-white/5", i % 2 !== 0 ? "bg-white/[0.01]" : ""])}" data-v-3965614c><td class="py-3 text-white/80 pr-4" data-v-3965614c>${ssrInterpolate(item.description)}</td><td class="py-3 text-center text-white/50" data-v-3965614c>${ssrInterpolate(item.quantity)}</td><td class="py-3 text-right text-white/60 tabular-nums" data-v-3965614c>${ssrInterpolate(formatCurrency(item.unitPrice))}</td><td class="py-3 text-right text-white font-semibold tabular-nums" data-v-3965614c>${ssrInterpolate(formatCurrency(item.total))}</td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="px-6 pb-6 flex justify-end" data-v-3965614c><div class="w-64 space-y-2" data-v-3965614c><div class="flex justify-between text-sm text-white/50" data-v-3965614c><span data-v-3965614c>Subtotal</span><span class="tabular-nums" data-v-3965614c>${ssrInterpolate(formatCurrency(__props.invoice.amount))}</span></div>`);
          if (__props.invoice.taxAmount) {
            _push2(`<div class="flex justify-between text-sm text-white/50" data-v-3965614c><span data-v-3965614c>Tax</span><span class="tabular-nums" data-v-3965614c>${ssrInterpolate(formatCurrency(__props.invoice.taxAmount))}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-between items-baseline pt-3 border-t border-purple-500/25" data-v-3965614c><span class="text-white font-bold" data-v-3965614c>Total Due</span><span class="text-3xl font-black text-purple-300 tabular-nums" style="${ssrRenderStyle({ "text-shadow": "0 0 20px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.4)" })}" data-v-3965614c>${ssrInterpolate(formatCurrency(__props.invoice.totalAmount))}</span></div>`);
          if (__props.invoice.paidAt) {
            _push2(`<div class="flex justify-between text-sm text-green-400" data-v-3965614c><span data-v-3965614c>Paid on</span><span data-v-3965614c>${ssrInterpolate(formatDate(__props.invoice.paidAt))}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
          if (__props.invoice.notes) {
            _push2(`<div class="px-6 py-4 border-t border-white/5" data-v-3965614c><p class="text-white/30 text-[10px] uppercase tracking-widest mb-2" data-v-3965614c>Notes</p><p class="text-white/60 text-sm whitespace-pre-wrap leading-relaxed" data-v-3965614c>${ssrInterpolate(__props.invoice.notes)}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="px-6 py-4 text-center border-t border-white/5" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, rgba(88,28,135,0.15) 0%, rgba(190,24,93,0.1) 100%)" })}" data-v-3965614c><p class="text-white/25 text-xs tracking-widest uppercase" data-v-3965614c> Thank you for choosing CharaTech · info@charatech.com </p></div></div></div><div class="flex-shrink-0 border-t border-white/8 px-7 py-4 flex items-center justify-between gap-3" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.35)" })}" data-v-3965614c>`);
          if (actionError.value) {
            _push2(`<p class="text-red-400 text-xs" data-v-3965614c>⚠ ${ssrInterpolate(actionError.value)}</p>`);
          } else {
            _push2(`<div class="text-white/25 text-xs" data-v-3965614c> Invoice · ${ssrInterpolate(formatCurrency(__props.invoice.totalAmount))} · ${ssrInterpolate(__props.invoice.status)}</div>`);
          }
          _push2(`<div class="flex items-center gap-2" data-v-3965614c>`);
          if (["DRAFT", "SENT", "OVERDUE"].includes(__props.invoice.status)) {
            _push2(`<button${ssrIncludeBooleanAttr(actionLoading.value) ? " disabled" : ""} class="px-4 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 transition border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5" data-v-3965614c> Cancel Invoice </button>`);
          } else {
            _push2(`<!---->`);
          }
          if (__props.invoice.status === "SENT") {
            _push2(`<button${ssrIncludeBooleanAttr(actionLoading.value) ? " disabled" : ""} class="px-4 py-2 rounded-xl text-xs font-medium text-orange-400/70 hover:text-orange-400 transition border border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5" data-v-3965614c> Mark Overdue </button>`);
          } else {
            _push2(`<!---->`);
          }
          if (__props.invoice.status === "DRAFT") {
            _push2(`<button${ssrIncludeBooleanAttr(actionLoading.value) ? " disabled" : ""} class="px-5 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:text-white transition border border-blue-500/30 hover:border-blue-500 hover:bg-blue-600/20 flex items-center gap-1.5" data-v-3965614c>`);
            if (actionLoading.value) {
              _push2(`<span data-v-3965614c>Sending…</span>`);
            } else {
              _push2(`<span data-v-3965614c>📨 Send to Client</span>`);
            }
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          if (["SENT", "OVERDUE"].includes(__props.invoice.status)) {
            _push2(`<button${ssrIncludeBooleanAttr(actionLoading.value) ? " disabled" : ""} class="px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #059669, #10b981)", "box-shadow": "0 0 16px rgba(16,185,129,0.3)" })}" data-v-3965614c>`);
            if (actionLoading.value) {
              _push2(`<span data-v-3965614c>Updating…</span>`);
            } else {
              _push2(`<span data-v-3965614c>✓ Mark as Paid</span>`);
            }
            _push2(`</button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InvoicePreviewModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-3965614c"]]), { __name: "InvoicePreviewModal" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const activeTab = ref("overview");
    const search = ref("");
    const filters = reactive({
      status: "",
      industry: ""
    });
    const tabs = [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "submissions", label: "Submissions", icon: "📋" },
      { id: "messages", label: "Messages", icon: "💬" },
      { id: "invoices", label: "Invoices", icon: "🧾" },
      { id: "timelines", label: "Timelines", icon: "📅" }
    ];
    const stats = ref([
      { icon: "📋", value: "0", label: "Total Submissions" },
      { icon: "⏳", value: "0", label: "Pending" },
      { icon: "✅", value: "0", label: "Completed" },
      { icon: "💰", value: "$0", label: "Total Revenue" }
    ]);
    const submissions = ref([]);
    ref(null);
    ref(null);
    ref([]);
    ref([]);
    ref("");
    const invoices = ref([]);
    const timelines = ref([]);
    const selectedTimeline = ref(null);
    const timelinesLoading = ref(false);
    const showInvoiceModal = ref(false);
    const showInvoicePreview = ref(false);
    const selectedInvoice = ref(null);
    const invoicePreselectedSubmission = ref(null);
    const invoicePreGeneratedItems = ref(void 0);
    const invoicePreGeneratedTaxRate = ref(void 0);
    const invoicePreGeneratedNotes = ref(void 0);
    const generatingInvoice = ref(false);
    const filteredSubmissions = computed(() => {
      let result = submissions.value;
      if (search.value) {
        const query = search.value.toLowerCase();
        result = result.filter(
          (s) => s.projectName.toLowerCase().includes(query) || s.user.email.toLowerCase().includes(query)
        );
      }
      if (filters.status) {
        result = result.filter((s) => s.status === filters.status);
      }
      if (filters.industry) {
        result = result.filter((s) => s.industry === filters.industry);
      }
      return result;
    });
    const { getAccessToken } = useAuth();
    const getAuthHeaders = async () => {
      const token = await getAccessToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
    const clearGeneratedInvoice = () => {
      invoicePreGeneratedItems.value = void 0;
      invoicePreGeneratedTaxRate.value = void 0;
      invoicePreGeneratedNotes.value = void 0;
    };
    const fetchInvoices = async () => {
      try {
        const headers = await getAuthHeaders();
        const data = await $fetch("/api/admin/invoices", { headers });
        if (data?.invoices) invoices.value = data.invoices;
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };
    const currencySymbol = (currency) => ({ USD: "$", EUR: "€", GBP: "£", GHS: "₵", CAD: "C$", AUD: "A$" })[currency] ?? "$";
    const onInvoiceCreated = async () => {
      showInvoiceModal.value = false;
      invoicePreselectedSubmission.value = null;
      clearGeneratedInvoice();
      await fetchInvoices();
    };
    const onInvoiceUpdated = async (updated) => {
      if (updated) {
        const idx = invoices.value.findIndex((i) => i.id === updated.id);
        if (idx !== -1) invoices.value[idx] = { ...invoices.value[idx], ...updated };
      } else {
        await fetchInvoices();
      }
      showInvoicePreview.value = false;
      selectedInvoice.value = null;
    };
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    };
    const getStatusClass = (status) => {
      const classes = {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        REVIEWING: "bg-blue-500/20 text-blue-300",
        QUOTED: "bg-purple-500/20 text-purple-300",
        ACCEPTED: "bg-green-500/20 text-green-300",
        IN_PROGRESS: "bg-cyan-500/20 text-cyan-300",
        COMPLETED: "bg-emerald-500/20 text-emerald-300",
        REJECTED: "bg-red-500/20 text-red-300"
      };
      return classes[status] || "bg-gray-500/20 text-gray-300";
    };
    const getInvoiceStatusClass = (status) => {
      const classes = {
        DRAFT: "bg-gray-500/20 text-gray-300",
        SENT: "bg-blue-500/20 text-blue-300",
        PAID: "bg-green-500/20 text-green-300",
        OVERDUE: "bg-red-500/20 text-red-300",
        CANCELLED: "bg-gray-500/20 text-gray-300"
      };
      return classes[status] || "bg-gray-500/20 text-gray-300";
    };
    const getTimelineStatusClass = (status) => {
      const classes = {
        PLANNING: "bg-yellow-500/20 text-yellow-300",
        ACTIVE: "bg-green-500/20 text-green-300",
        ON_HOLD: "bg-orange-500/20 text-orange-300",
        COMPLETED: "bg-emerald-500/20 text-emerald-300",
        CANCELLED: "bg-red-500/20 text-red-300"
      };
      return classes[status] || "bg-gray-500/20 text-gray-300";
    };
    function onTimelineUpdated(updatedTimeline) {
      const idx = timelines.value.findIndex((t) => t.id === updatedTimeline.id);
      if (idx >= 0) timelines.value[idx] = { ...timelines.value[idx], ...updatedTimeline };
      if (selectedTimeline.value?.id === updatedTimeline.id) {
        selectedTimeline.value = { ...selectedTimeline.value, ...updatedTimeline };
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminMessagesPanel = __nuxt_component_0$1;
      const _component_ProjectTimelinePanel = __nuxt_component_1;
      const _component_CreateInvoiceModal = __nuxt_component_2;
      const _component_InvoicePreviewModal = __nuxt_component_3;
      _push(`<!--[--><div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white" data-v-5df03c94><div class="container mx-auto px-4 py-8" data-v-5df03c94><div class="mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 rounded-xl border-l-4 border-purple-500 glass-morphism" data-v-5df03c94><div class="flex items-center justify-between" data-v-5df03c94><div data-v-5df03c94><div class="flex items-center gap-3 mb-2" data-v-5df03c94><span class="text-3xl" data-v-5df03c94>🛡️</span><h1 class="text-4xl font-bold text-white" data-v-5df03c94>Admin Dashboard</h1></div><p class="text-white/80 text-lg" data-v-5df03c94>Manage submissions, communicate with clients, and track projects</p></div></div></div><div class="mb-6" data-v-5df03c94><div class="flex gap-2 bg-white/5 p-2 rounded-xl inline-flex" data-v-5df03c94><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass([
          "px-6 py-3 rounded-lg font-semibold transition-all",
          activeTab.value === tab.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
        ])}" data-v-5df03c94><span class="mr-2" data-v-5df03c94>${ssrInterpolate(tab.icon)}</span> ${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div></div>`);
      if (activeTab.value === "overview") {
        _push(`<div class="grid md:grid-cols-4 gap-6 mb-8" data-v-5df03c94><!--[-->`);
        ssrRenderList(stats.value, (stat) => {
          _push(`<div class="glass-morphism p-6 rounded-xl hover:scale-105 transition-transform cursor-pointer border border-white/10" data-v-5df03c94><div class="text-4xl mb-3" data-v-5df03c94>${ssrInterpolate(stat.icon)}</div><div class="text-4xl font-bold text-white mb-2" data-v-5df03c94>${ssrInterpolate(stat.value)}</div><div class="text-white/70" data-v-5df03c94>${ssrInterpolate(stat.label)}</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "submissions") {
        _push(`<div class="space-y-6" data-v-5df03c94><div class="glass-morphism p-6 rounded-xl border border-white/10" data-v-5df03c94><div class="grid md:grid-cols-4 gap-4" data-v-5df03c94><input${ssrRenderAttr("value", search.value)} type="text" placeholder="Search submissions..." class="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" data-v-5df03c94><select class="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition" data-v-5df03c94><option value="" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "") : ssrLooseEqual(filters.status, "")) ? " selected" : ""}>All Status</option><option value="PENDING" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "PENDING") : ssrLooseEqual(filters.status, "PENDING")) ? " selected" : ""}>Pending</option><option value="REVIEWING" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "REVIEWING") : ssrLooseEqual(filters.status, "REVIEWING")) ? " selected" : ""}>Reviewing</option><option value="QUOTED" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "QUOTED") : ssrLooseEqual(filters.status, "QUOTED")) ? " selected" : ""}>Quoted</option><option value="ACCEPTED" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "ACCEPTED") : ssrLooseEqual(filters.status, "ACCEPTED")) ? " selected" : ""}>Accepted</option><option value="IN_PROGRESS" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "IN_PROGRESS") : ssrLooseEqual(filters.status, "IN_PROGRESS")) ? " selected" : ""}>In Progress</option><option value="COMPLETED" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.status) ? ssrLooseContain(filters.status, "COMPLETED") : ssrLooseEqual(filters.status, "COMPLETED")) ? " selected" : ""}>Completed</option></select><select class="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none transition" data-v-5df03c94><option value="" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.industry) ? ssrLooseContain(filters.industry, "") : ssrLooseEqual(filters.industry, "")) ? " selected" : ""}>All Industries</option><option value="HEALTHCARE" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.industry) ? ssrLooseContain(filters.industry, "HEALTHCARE") : ssrLooseEqual(filters.industry, "HEALTHCARE")) ? " selected" : ""}>Healthcare</option><option value="FINANCE" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.industry) ? ssrLooseContain(filters.industry, "FINANCE") : ssrLooseEqual(filters.industry, "FINANCE")) ? " selected" : ""}>Finance</option><option value="ECOMMERCE" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.industry) ? ssrLooseContain(filters.industry, "ECOMMERCE") : ssrLooseEqual(filters.industry, "ECOMMERCE")) ? " selected" : ""}>E-commerce</option><option value="EDUCATION" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.industry) ? ssrLooseContain(filters.industry, "EDUCATION") : ssrLooseEqual(filters.industry, "EDUCATION")) ? " selected" : ""}>Education</option><option value="TECHNOLOGY" class="bg-gray-900" data-v-5df03c94${ssrIncludeBooleanAttr(Array.isArray(filters.industry) ? ssrLooseContain(filters.industry, "TECHNOLOGY") : ssrLooseEqual(filters.industry, "TECHNOLOGY")) ? " selected" : ""}>Technology</option></select><button class="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2" data-v-5df03c94><span data-v-5df03c94>📥</span> Export CSV </button></div></div><div class="space-y-4" data-v-5df03c94><!--[-->`);
        ssrRenderList(filteredSubmissions.value, (submission) => {
          _push(`<div class="glass-morphism p-6 rounded-xl border border-white/10 hover:border-purple-500/50 transition cursor-pointer" data-v-5df03c94><div class="flex items-start justify-between" data-v-5df03c94><div class="flex-1" data-v-5df03c94><div class="flex items-center gap-3 mb-2" data-v-5df03c94><h3 class="text-xl font-bold text-white" data-v-5df03c94>${ssrInterpolate(submission.projectName)}</h3><span class="${ssrRenderClass([
            "px-3 py-1 rounded-full text-xs font-semibold",
            getStatusClass(submission.status)
          ])}" data-v-5df03c94>${ssrInterpolate(submission.status)}</span></div><p class="text-white/60 mb-3" data-v-5df03c94>${ssrInterpolate(submission.user.email)}</p><div class="flex gap-4 text-sm text-white/50" data-v-5df03c94><span data-v-5df03c94>🏢 ${ssrInterpolate(submission.industry)}</span><span data-v-5df03c94>⚡ ${ssrInterpolate(submission.complexity)}</span><span data-v-5df03c94>📅 ${ssrInterpolate(formatDate(submission.createdAt))}</span></div></div><div class="flex gap-2" data-v-5df03c94><button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition" title="Message Client" data-v-5df03c94> 💬 </button><button${ssrIncludeBooleanAttr(generatingInvoice.value) ? " disabled" : ""} class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50" title="Generate Invoice" data-v-5df03c94>${ssrInterpolate(generatingInvoice.value && invoicePreselectedSubmission.value?.id === submission.id ? "⏳" : "🧾")}</button><button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition" title="Manage Timeline" data-v-5df03c94> 📊 </button></div></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "messages") {
        _push(`<div data-v-5df03c94>`);
        _push(ssrRenderComponent(_component_AdminMessagesPanel, null, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "invoices") {
        _push(`<div data-v-5df03c94><div class="glass-morphism p-6 rounded-xl border border-white/10" data-v-5df03c94><div class="flex justify-between items-center mb-6" data-v-5df03c94><h3 class="text-2xl font-bold text-white" data-v-5df03c94>Invoices</h3><button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2" data-v-5df03c94><span data-v-5df03c94>🧾</span> + Create Invoice </button></div>`);
        if (!invoices.value.length) {
          _push(`<div class="py-16 text-center" data-v-5df03c94><div class="text-5xl mb-4" data-v-5df03c94>🧾</div><p class="text-white/40 text-lg" data-v-5df03c94>No invoices yet</p><p class="text-white/25 text-sm mt-1" data-v-5df03c94>Click &quot;+ Create Invoice&quot; to get started</p></div>`);
        } else {
          _push(`<div class="overflow-x-auto" data-v-5df03c94><table class="w-full" data-v-5df03c94><thead class="bg-white/5" data-v-5df03c94><tr data-v-5df03c94><th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider" data-v-5df03c94>Invoice #</th><th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider" data-v-5df03c94>Client</th><th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider" data-v-5df03c94>Amount</th><th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider" data-v-5df03c94>Status</th><th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider" data-v-5df03c94>Due Date</th><th class="px-6 py-3 text-left text-white/60 text-xs uppercase tracking-wider" data-v-5df03c94>Actions</th></tr></thead><tbody data-v-5df03c94><!--[-->`);
          ssrRenderList(invoices.value, (invoice) => {
            _push(`<tr class="border-t border-white/10 hover:bg-white/5 transition cursor-pointer" data-v-5df03c94><td class="px-6 py-4 text-purple-300 font-mono text-sm font-medium" data-v-5df03c94>${ssrInterpolate(invoice.invoiceNumber)}</td><td class="px-6 py-4" data-v-5df03c94><div class="text-white text-sm" data-v-5df03c94>${ssrInterpolate(invoice.client?.fullName || invoice.client?.email || "—")}</div><div class="text-white/40 text-xs" data-v-5df03c94>${ssrInterpolate(invoice.client?.email)}</div></td><td class="px-6 py-4 text-white font-semibold tabular-nums" data-v-5df03c94>${ssrInterpolate(currencySymbol(invoice.currency))}${ssrInterpolate(Number(invoice.totalAmount).toFixed(2))} <span class="text-white/30 text-xs ml-1" data-v-5df03c94>${ssrInterpolate(invoice.currency || "USD")}</span></td><td class="px-6 py-4" data-v-5df03c94><span class="${ssrRenderClass(["px-3 py-1 rounded-full text-xs font-semibold", getInvoiceStatusClass(invoice.status)])}" data-v-5df03c94>${ssrInterpolate(invoice.status)}</span></td><td class="px-6 py-4 text-white/60 text-sm" data-v-5df03c94>${ssrInterpolate(invoice.dueDate ? formatDate(invoice.dueDate) : "—")}</td><td class="px-6 py-4" data-v-5df03c94><div class="flex gap-2" data-v-5df03c94><button class="px-3 py-1.5 text-xs rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition border border-purple-500/20" data-v-5df03c94>View</button>`);
            if (invoice.status === "DRAFT") {
              _push(`<button class="px-3 py-1.5 text-xs rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition border border-blue-500/20" data-v-5df03c94>Send</button>`);
            } else {
              _push(`<!---->`);
            }
            if (["SENT", "OVERDUE"].includes(invoice.status)) {
              _push(`<button class="px-3 py-1.5 text-xs rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition border border-green-500/20" data-v-5df03c94>Paid</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (activeTab.value === "timelines") {
        _push(`<div data-v-5df03c94><div class="grid grid-cols-1 lg:grid-cols-4 gap-4" data-v-5df03c94><div class="lg:col-span-1 space-y-2" data-v-5df03c94><div class="glass-morphism rounded-xl border border-white/10 p-4" data-v-5df03c94><h3 class="text-sm font-semibold text-white mb-3" data-v-5df03c94>Projects</h3>`);
        if (timelinesLoading.value) {
          _push(`<div class="space-y-2" data-v-5df03c94><!--[-->`);
          ssrRenderList(3, (i) => {
            _push(`<div class="h-16 bg-white/5 rounded-lg animate-pulse" data-v-5df03c94></div>`);
          });
          _push(`<!--]--></div>`);
        } else if (!timelines.value.length) {
          _push(`<div class="text-white/30 text-xs text-center py-4" data-v-5df03c94> No timelines yet.<br data-v-5df03c94>Create one from the Submissions tab. </div>`);
        } else {
          _push(`<div class="space-y-1.5" data-v-5df03c94><!--[-->`);
          ssrRenderList(timelines.value, (t) => {
            _push(`<button class="${ssrRenderClass([
              "w-full text-left p-3 rounded-lg border transition-all",
              selectedTimeline.value?.id === t.id ? "bg-purple-600/20 border-purple-500/40" : "bg-white/5 border-transparent hover:border-white/10"
            ])}" data-v-5df03c94><div class="flex items-center justify-between mb-1" data-v-5df03c94><span class="text-sm font-semibold text-white truncate" data-v-5df03c94>${ssrInterpolate(t.projectName)}</span>`);
            if (t.githubRepo) {
              _push(`<span class="flex-shrink-0 ml-1 text-xs text-purple-400" title="GitHub linked" data-v-5df03c94>🔗</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-xs text-white/40 truncate" data-v-5df03c94>${ssrInterpolate(t.clientName)}</div><div class="${ssrRenderClass([
              "text-xs mt-1 font-semibold",
              t.status === "ACTIVE" ? "text-green-400" : t.status === "COMPLETED" ? "text-emerald-400" : t.status === "ON_HOLD" ? "text-orange-400" : "text-white/40"
            ])}" data-v-5df03c94>${ssrInterpolate(t.status)}</div></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div><div class="lg:col-span-3" data-v-5df03c94>`);
        if (!selectedTimeline.value) {
          _push(`<div class="glass-morphism rounded-xl border border-dashed border-white/20 p-16 text-center" data-v-5df03c94><div class="text-4xl mb-3" data-v-5df03c94>📅</div><div class="text-white/50" data-v-5df03c94>Select a project timeline from the list</div></div>`);
        } else {
          _push(`<div data-v-5df03c94><div class="flex items-center justify-between mb-4" data-v-5df03c94><div data-v-5df03c94><h3 class="text-xl font-bold text-white" data-v-5df03c94>${ssrInterpolate(selectedTimeline.value.projectName)}</h3><div class="text-sm text-white/50" data-v-5df03c94>${ssrInterpolate(selectedTimeline.value.clientName)}</div></div><span class="${ssrRenderClass(["px-3 py-1 rounded-full text-xs font-semibold", getTimelineStatusClass(selectedTimeline.value.status)])}" data-v-5df03c94>${ssrInterpolate(selectedTimeline.value.status)}</span></div>`);
          _push(ssrRenderComponent(_component_ProjectTimelinePanel, {
            timeline: selectedTimeline.value,
            "admin-mode": true,
            onUpdated: onTimelineUpdated
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      _push(ssrRenderComponent(_component_CreateInvoiceModal, {
        show: showInvoiceModal.value,
        submissions: submissions.value,
        "preselected-submission": invoicePreselectedSubmission.value,
        "pre-generated-items": invoicePreGeneratedItems.value,
        "pre-generated-tax-rate": invoicePreGeneratedTaxRate.value,
        "pre-generated-notes": invoicePreGeneratedNotes.value,
        onClose: ($event) => {
          showInvoiceModal.value = false;
          invoicePreselectedSubmission.value = null;
          clearGeneratedInvoice();
        },
        onCreated: onInvoiceCreated
      }, null, _parent));
      _push(ssrRenderComponent(_component_InvoicePreviewModal, {
        show: showInvoicePreview.value,
        invoice: selectedInvoice.value,
        onClose: ($event) => {
          showInvoicePreview.value = false;
          selectedInvoice.value = null;
        },
        onUpdated: onInvoiceUpdated
      }, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/dashboard/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5df03c94"]]);

export { index as default };
//# sourceMappingURL=index-doton5Mw.mjs.map

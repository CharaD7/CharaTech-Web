import { _ as __nuxt_component_0 } from './nuxt-link-BtQrV7j8.mjs';
import { defineComponent, withAsyncContext, ref, computed, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useUserStore } from './user-Tw6xDzm0.mjs';
import { a as useAuth, n as navigateTo } from './server.mjs';
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
import './asyncData-gvl6Vp1x.mjs';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const userStore = useUserStore();
    useAuth();
    if (userStore.currentUser?.role === "ADMIN") {
      [__temp, __restore] = withAsyncContext(() => navigateTo("/admin/dashboard")), await __temp, __restore();
    }
    const activeTab = ref("submissions");
    const tabs = [
      { id: "submissions", label: "Submissions", icon: "📋" },
      { id: "invoices", label: "Invoices", icon: "🧾" },
      { id: "timeline", label: "Timeline", icon: "📅" }
    ];
    const submissions = ref([]);
    const loading = ref(true);
    const invoices = ref([]);
    const invoicesLoading = ref(false);
    const selectedInvoice = ref(null);
    const unpaidCount = computed(
      () => invoices.value.filter((i) => ["SENT", "OVERDUE"].includes(i.status)).length
    );
    const isOverdue = (inv) => inv.status === "OVERDUE" || inv.status === "SENT" && inv.dueDate && new Date(inv.dueDate) < /* @__PURE__ */ new Date();
    const clientTimelines = ref([]);
    const timelinesLoading = ref(false);
    const selectedClientTimeline = ref(null);
    const currencySymbol = (currency) => ({ USD: "$", EUR: "€", GBP: "£", GHS: "₵", CAD: "C$", AUD: "A$" })[currency] ?? "$";
    const getStatusClass = (status) => {
      const classes = {
        PENDING: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
        REVIEWING: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
        QUOTED: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
        ACCEPTED: "bg-green-500/20 text-green-300 border border-green-500/30",
        REJECTED: "bg-red-500/20 text-red-300 border border-red-500/30",
        IN_PROGRESS: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
        COMPLETED: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
      };
      return classes[status] || "bg-gray-500/20 text-gray-300 border border-gray-500/30";
    };
    const getInvoiceStatusClass = (status) => {
      const classes = {
        DRAFT: "bg-gray-500/20 text-gray-300",
        SENT: "bg-blue-500/20 text-blue-300",
        PAID: "bg-emerald-500/20 text-emerald-300",
        OVERDUE: "bg-red-500/20 text-red-300",
        CANCELLED: "bg-gray-500/20 text-gray-400"
      };
      return classes[status] || "bg-gray-500/20 text-gray-300";
    };
    const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<!--[--><div class="container mx-auto px-4 py-8" data-v-63c42a13><div class="mb-8" data-v-63c42a13><h1 class="text-4xl font-bold text-white mb-2" data-v-63c42a13> Welcome, ${ssrInterpolate(unref(userStore).currentUser?.fullName || "User")}! 👋 </h1><p class="text-white/70 text-lg" data-v-63c42a13>Manage your project requirement submissions</p></div><div class="grid md:grid-cols-3 gap-6 mb-8" data-v-63c42a13>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/submit",
        class: "glass-morphism p-8 rounded-xl hover:scale-105 transition-transform group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="text-6xl mb-4 group-hover:scale-110 transition-transform" data-v-63c42a13${_scopeId}>📝</div><h2 class="text-2xl font-bold text-white mb-2" data-v-63c42a13${_scopeId}>New Submission</h2><p class="text-white/70" data-v-63c42a13${_scopeId}>Start a new requirements form</p>`);
          } else {
            return [
              createVNode("div", { class: "text-6xl mb-4 group-hover:scale-110 transition-transform" }, "📝"),
              createVNode("h2", { class: "text-2xl font-bold text-white mb-2" }, "New Submission"),
              createVNode("p", { class: "text-white/70" }, "Start a new requirements form")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-morphism p-8 rounded-xl" data-v-63c42a13><div class="text-6xl mb-4" data-v-63c42a13>📊</div><h2 class="text-2xl font-bold text-white mb-2" data-v-63c42a13>Total Submissions</h2><p class="text-3xl font-bold text-purple-400" data-v-63c42a13>${ssrInterpolate(unref(submissions).length)}</p></div><div class="glass-morphism p-8 rounded-xl cursor-pointer hover:scale-105 transition-transform" data-v-63c42a13><div class="text-6xl mb-4" data-v-63c42a13>🧾</div><h2 class="text-2xl font-bold text-white mb-2" data-v-63c42a13>Invoices</h2><p class="text-3xl font-bold text-pink-400" data-v-63c42a13>${ssrInterpolate(unref(invoices).length)}</p><p class="text-white/50 text-sm mt-1" data-v-63c42a13>`);
      if (unref(unpaidCount) > 0) {
        _push(`<span class="text-yellow-400" data-v-63c42a13>${ssrInterpolate(unref(unpaidCount))} awaiting payment</span>`);
      } else {
        _push(`<span class="text-emerald-400" data-v-63c42a13>All settled ✓</span>`);
      }
      _push(`</p></div></div><div class="mb-6" data-v-63c42a13><div class="flex gap-2 bg-white/5 p-1.5 rounded-xl inline-flex" data-v-63c42a13><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass([
          "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all",
          unref(activeTab) === tab.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20" : "text-white/60 hover:text-white hover:bg-white/5"
        ])}" data-v-63c42a13><span class="mr-1.5" data-v-63c42a13>${ssrInterpolate(tab.icon)}</span>${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div></div>`);
      if (unref(activeTab) === "submissions") {
        _push(`<div data-v-63c42a13><div class="glass-morphism p-8 rounded-xl" data-v-63c42a13><div class="flex items-center justify-between mb-6" data-v-63c42a13><h2 class="text-3xl font-bold text-white" data-v-63c42a13>Your Submissions</h2>`);
        if (unref(submissions).length > 0) {
          _push(`<button class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition" data-v-63c42a13> Refresh </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(loading)) {
          _push(`<div class="text-center py-12" data-v-63c42a13><svg class="animate-spin h-12 w-12 text-purple-500 mx-auto" fill="none" viewBox="0 0 24 24" data-v-63c42a13><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-63c42a13></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-63c42a13></path></svg><p class="text-white/70 mt-4" data-v-63c42a13>Loading submissions...</p></div>`);
        } else if (unref(submissions).length === 0) {
          _push(`<div class="text-center py-16" data-v-63c42a13><div class="text-6xl mb-4" data-v-63c42a13>📋</div><p class="text-xl text-white/70 mb-6" data-v-63c42a13>No submissions yet</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, { to: "/submit" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition" data-v-63c42a13${_scopeId}> Create Your First Submission </button>`);
              } else {
                return [
                  createVNode("button", { class: "px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition" }, " Create Your First Submission ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="space-y-4" data-v-63c42a13><!--[-->`);
          ssrRenderList(unref(submissions), (submission) => {
            _push(`<div class="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition border border-white/10" data-v-63c42a13><div class="flex justify-between items-start mb-3" data-v-63c42a13><div data-v-63c42a13><h3 class="text-xl font-semibold text-white mb-1" data-v-63c42a13>${ssrInterpolate(submission.projectName)}</h3><p class="text-white/60 text-sm" data-v-63c42a13>${ssrInterpolate(submission.industry)}</p></div><span class="${ssrRenderClass(["px-3 py-1 rounded-full text-xs font-semibold", getStatusClass(submission.status)])}" data-v-63c42a13>${ssrInterpolate(submission.status)}</span></div><div class="grid md:grid-cols-3 gap-4 text-sm text-white/70 mb-4" data-v-63c42a13><div data-v-63c42a13><span class="font-medium text-white" data-v-63c42a13>Complexity:</span> ${ssrInterpolate(submission.complexity)}</div><div data-v-63c42a13><span class="font-medium text-white" data-v-63c42a13>Budget:</span> ${ssrInterpolate(submission.budget || "Not specified")}</div><div data-v-63c42a13><span class="font-medium text-white" data-v-63c42a13>Submitted:</span> ${ssrInterpolate(formatDate(submission.createdAt))}</div></div>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/submissions/${submission.id}`,
              class: "inline-block"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<button class="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition" data-v-63c42a13${_scopeId}> View Details → </button>`);
                } else {
                  return [
                    createVNode("button", { class: "px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition" }, " View Details → ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "invoices") {
        _push(`<div data-v-63c42a13><div class="glass-morphism p-6 rounded-xl border border-white/10" data-v-63c42a13><div class="flex items-center justify-between mb-6" data-v-63c42a13><h2 class="text-2xl font-bold text-white" data-v-63c42a13>My Invoices</h2><button class="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition" data-v-63c42a13> Refresh </button></div>`);
        if (unref(invoicesLoading)) {
          _push(`<div class="text-center py-12" data-v-63c42a13><svg class="animate-spin h-10 w-10 text-purple-500 mx-auto" fill="none" viewBox="0 0 24 24" data-v-63c42a13><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-63c42a13></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" data-v-63c42a13></path></svg><p class="text-white/50 mt-3" data-v-63c42a13>Loading invoices...</p></div>`);
        } else if (unref(invoices).length === 0) {
          _push(`<div class="text-center py-16" data-v-63c42a13><div class="text-5xl mb-4" data-v-63c42a13>🧾</div><p class="text-white/40 text-lg" data-v-63c42a13>No invoices yet</p><p class="text-white/25 text-sm mt-1" data-v-63c42a13>Invoices created by CharaTech will appear here</p></div>`);
        } else {
          _push(`<div class="overflow-x-auto" data-v-63c42a13><table class="w-full" data-v-63c42a13><thead class="bg-white/5" data-v-63c42a13><tr data-v-63c42a13><th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider" data-v-63c42a13>Invoice #</th><th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider" data-v-63c42a13>Project</th><th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider" data-v-63c42a13>Amount</th><th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider" data-v-63c42a13>Status</th><th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider" data-v-63c42a13>Due</th><th class="px-5 py-3 text-left text-white/50 text-xs uppercase tracking-wider" data-v-63c42a13>Action</th></tr></thead><tbody data-v-63c42a13><!--[-->`);
          ssrRenderList(unref(invoices), (inv) => {
            _push(`<tr class="border-t border-white/10 hover:bg-white/5 transition" data-v-63c42a13><td class="px-5 py-4 font-mono text-sm text-purple-300 font-medium" data-v-63c42a13>${ssrInterpolate(inv.invoiceNumber)}</td><td class="px-5 py-4" data-v-63c42a13><div class="text-white text-sm" data-v-63c42a13>${ssrInterpolate(inv.submission?.projectName || "—")}</div><div class="text-white/40 text-xs" data-v-63c42a13>${ssrInterpolate(inv.submission?.industry)}</div></td><td class="px-5 py-4 text-white font-semibold tabular-nums" data-v-63c42a13>${ssrInterpolate(currencySymbol(inv.currency))}${ssrInterpolate(Number(inv.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }))} <span class="text-white/30 text-xs ml-1" data-v-63c42a13>${ssrInterpolate(inv.currency)}</span></td><td class="px-5 py-4" data-v-63c42a13><span class="${ssrRenderClass(["px-3 py-1 rounded-full text-xs font-semibold", getInvoiceStatusClass(inv.status)])}" data-v-63c42a13>${ssrInterpolate(inv.status)}</span></td><td class="px-5 py-4 text-white/60 text-sm" data-v-63c42a13>`);
            if (inv.dueDate) {
              _push(`<span class="${ssrRenderClass(isOverdue(inv) ? "text-red-400" : "")}" data-v-63c42a13>${ssrInterpolate(formatDate(inv.dueDate))}</span>`);
            } else {
              _push(`<span class="text-white/30" data-v-63c42a13>—</span>`);
            }
            _push(`</td><td class="px-5 py-4" data-v-63c42a13>`);
            if (inv.status !== "DRAFT") {
              _push(`<button class="px-3 py-1.5 text-xs rounded-lg bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 transition border border-purple-500/20" data-v-63c42a13> View </button>`);
            } else {
              _push(`<span class="text-white/20 text-xs italic" data-v-63c42a13>Pending</span>`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "timeline") {
        _push(`<div data-v-63c42a13>`);
        if (unref(timelinesLoading)) {
          _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-63c42a13><!--[-->`);
          ssrRenderList(2, (i) => {
            _push(`<div class="h-48 bg-white/5 rounded-xl animate-pulse" data-v-63c42a13></div>`);
          });
          _push(`<!--]--></div>`);
        } else if (!unref(clientTimelines).length) {
          _push(`<div class="glass-morphism rounded-2xl border border-white/10 p-12 text-center" data-v-63c42a13><div class="text-5xl mb-4" data-v-63c42a13>📅</div><h3 class="text-lg font-bold text-white mb-2" data-v-63c42a13>No Active Timelines</h3><p class="text-white/40 text-sm" data-v-63c42a13>Once your project is approved and underway, you&#39;ll see live progress, milestones, and activity here.</p></div>`);
        } else {
          _push(`<div data-v-63c42a13>`);
          if (unref(clientTimelines).length > 1) {
            _push(`<div class="flex gap-2 mb-4 flex-wrap" data-v-63c42a13><!--[-->`);
            ssrRenderList(unref(clientTimelines), (t) => {
              _push(`<button class="${ssrRenderClass([
                "px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                (unref(selectedClientTimeline) ?? unref(clientTimelines)[0]).id === t.id ? "bg-purple-600/30 border-purple-500/40 text-white" : "bg-white/5 border-transparent text-white/50 hover:text-white"
              ])}" data-v-63c42a13>${ssrInterpolate(t.projectName)}</button>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList([unref(selectedClientTimeline) ?? unref(clientTimelines)[0]], (t) => {
            _push(`<div class="space-y-4" data-v-63c42a13><div class="glass-morphism rounded-2xl border border-white/10 p-6" data-v-63c42a13><div class="flex items-center justify-between mb-4" data-v-63c42a13><div data-v-63c42a13><h3 class="text-xl font-bold text-white" data-v-63c42a13>${ssrInterpolate(t.projectName)}</h3>`);
            if (t.githubRepo) {
              _push(`<div class="text-sm text-purple-400 mt-0.5" data-v-63c42a13> 🔗 <a${ssrRenderAttr("href", `https://github.com/${t.githubRepo}`)} target="_blank" class="hover:underline" data-v-63c42a13>${ssrInterpolate(t.githubRepo)}</a></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="${ssrRenderClass([
              "px-3 py-1 rounded-full text-xs font-bold",
              t.status === "ACTIVE" ? "bg-green-500/20 text-green-300" : t.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300" : t.status === "ON_HOLD" ? "bg-orange-500/20 text-orange-300" : "bg-white/10 text-white/50"
            ])}" data-v-63c42a13>${ssrInterpolate(t.status)}</div></div><div class="mb-3" data-v-63c42a13><div class="flex justify-between text-xs text-white/50 mb-1.5" data-v-63c42a13><span data-v-63c42a13>Overall Progress</span><span class="font-bold text-purple-400" data-v-63c42a13>${ssrInterpolate(t.progress)}%</span></div><div class="h-3 bg-white/10 rounded-full overflow-hidden" data-v-63c42a13><div class="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all duration-700 relative" style="${ssrRenderStyle({ width: `${t.progress}%` })}" data-v-63c42a13>`);
            if (t.status === "ACTIVE") {
              _push(`<div class="absolute inset-0 bg-white/20 animate-pulse rounded-full" data-v-63c42a13></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div></div>`);
            if (t.startDate || t.endDate) {
              _push(`<div class="flex gap-4 text-xs text-white/40" data-v-63c42a13>`);
              if (t.startDate) {
                _push(`<span data-v-63c42a13>🚀 Started: ${ssrInterpolate(new Date(t.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}</span>`);
              } else {
                _push(`<!---->`);
              }
              if (t.endDate) {
                _push(`<span data-v-63c42a13>🏁 Target: ${ssrInterpolate(new Date(t.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (t.milestones?.length) {
              _push(`<div class="glass-morphism rounded-2xl border border-white/10 p-6" data-v-63c42a13><h4 class="text-sm font-bold text-white mb-4" data-v-63c42a13>Project Milestones</h4><div class="space-y-3" data-v-63c42a13><!--[-->`);
              ssrRenderList(t.milestones, (m) => {
                _push(`<div class="flex items-start gap-3 p-3 rounded-xl bg-white/5" data-v-63c42a13><div class="${ssrRenderClass([
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                  m.status === "COMPLETED" ? "bg-green-500/20" : m.status === "IN_PROGRESS" ? "bg-blue-500/20" : m.status === "DELAYED" ? "bg-orange-500/20" : "bg-white/10"
                ])}" data-v-63c42a13>${ssrInterpolate(m.status === "COMPLETED" ? "✅" : m.status === "IN_PROGRESS" ? "🔧" : m.status === "DELAYED" ? "⚠️" : "⏳")}</div><div class="flex-1" data-v-63c42a13><div class="text-sm font-semibold text-white" data-v-63c42a13>${ssrInterpolate(m.title)}</div>`);
                if (m.description) {
                  _push(`<div class="text-xs text-white/40 mt-0.5" data-v-63c42a13>${ssrInterpolate(m.description)}</div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`<div class="text-xs text-white/30 mt-1" data-v-63c42a13>${ssrInterpolate(new Date(m.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }))} → ${ssrInterpolate(new Date(m.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }))}</div></div><span class="${ssrRenderClass([
                  "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                  m.status === "COMPLETED" ? "bg-green-500/20 text-green-300" : m.status === "IN_PROGRESS" ? "bg-blue-500/20 text-blue-300" : m.status === "DELAYED" ? "bg-orange-500/20 text-orange-300" : "bg-white/10 text-white/40"
                ])}" data-v-63c42a13>${ssrInterpolate(m.status.replace("_", " "))}</span></div>`);
              });
              _push(`<!--]--></div></div>`);
            } else {
              _push(`<!---->`);
            }
            if (t.github?.milestones?.length) {
              _push(`<div class="glass-morphism rounded-2xl border border-white/10 p-6" data-v-63c42a13><h4 class="text-sm font-bold text-white mb-4" data-v-63c42a13>GitHub Milestones</h4><div class="space-y-3" data-v-63c42a13><!--[-->`);
              ssrRenderList(t.github.milestones, (m) => {
                _push(`<div class="p-3 rounded-xl bg-white/5" data-v-63c42a13><div class="flex items-center justify-between mb-2" data-v-63c42a13><span class="text-sm font-semibold text-white" data-v-63c42a13>${ssrInterpolate(m.title)}</span><span class="${ssrRenderClass([
                  "text-xs px-2 py-0.5 rounded-full",
                  m.state === "closed" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"
                ])}" data-v-63c42a13>${ssrInterpolate(m.state === "closed" ? "✅ Done" : "🔧 Active")}</span></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden" data-v-63c42a13><div class="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full" style="${ssrRenderStyle({ width: `${m.open_issues + m.closed_issues > 0 ? Math.round(m.closed_issues / (m.open_issues + m.closed_issues) * 100) : 0}%` })}" data-v-63c42a13></div></div><div class="text-xs text-white/30 mt-1" data-v-63c42a13>${ssrInterpolate(m.closed_issues)}/${ssrInterpolate(m.open_issues + m.closed_issues)} tasks completed</div></div>`);
              });
              _push(`<!--]--></div></div>`);
            } else {
              _push(`<!---->`);
            }
            if (t.github?.recentCommits?.length) {
              _push(`<div class="glass-morphism rounded-2xl border border-white/10 p-6" data-v-63c42a13><h4 class="text-sm font-bold text-white mb-4" data-v-63c42a13>Recent Development Activity</h4><div class="space-y-2" data-v-63c42a13><!--[-->`);
              ssrRenderList(t.github.recentCommits, (c) => {
                _push(`<div class="flex items-start gap-3 p-2.5 rounded-lg bg-white/5" data-v-63c42a13>`);
                if (c.avatar) {
                  _push(`<img${ssrRenderAttr("src", c.avatar)}${ssrRenderAttr("alt", c.author)} class="w-6 h-6 rounded-full flex-shrink-0 border border-white/10 mt-0.5" data-v-63c42a13>`);
                } else {
                  _push(`<div class="w-6 h-6 rounded-full bg-purple-700/40 flex items-center justify-center text-xs flex-shrink-0 mt-0.5" data-v-63c42a13>${ssrInterpolate(c.author?.[0])}</div>`);
                }
                _push(`<div class="flex-1 min-w-0" data-v-63c42a13><div class="text-xs text-white/70 leading-snug" data-v-63c42a13>${ssrInterpolate(c.message)}</div><div class="text-xs text-white/30 mt-0.5" data-v-63c42a13>${ssrInterpolate(c.author)} · <a${ssrRenderAttr("href", c.url)} target="_blank" class="font-mono hover:text-purple-400" data-v-63c42a13>${ssrInterpolate(c.sha)}</a></div></div></div>`);
              });
              _push(`<!--]--></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(selectedInvoice)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-63c42a13><div class="absolute inset-0 bg-black/80 backdrop-blur-md" data-v-63c42a13></div><div class="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-purple-500/20" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(12,8,32,0.98) 0%, rgba(22,8,48,0.98) 100%)", "box-shadow": "0 0 80px rgba(168,85,247,0.12), 0 0 40px rgba(0,0,0,0.8)" })}" data-v-63c42a13><div class="flex-shrink-0 flex items-center justify-between px-7 py-5 border-b border-purple-500/20" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, rgba(88,28,135,0.6) 0%, rgba(190,24,93,0.3) 100%)" })}" data-v-63c42a13><div class="flex items-center gap-3" data-v-63c42a13><div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#7c3aed,#db2777)" })}" data-v-63c42a13>🧾</div><div data-v-63c42a13><div class="font-bold text-white" data-v-63c42a13>${ssrInterpolate(unref(selectedInvoice).invoiceNumber)}</div><div class="text-white/50 text-xs" data-v-63c42a13>${ssrInterpolate(unref(selectedInvoice).submission?.projectName)}</div></div></div><div class="flex items-center gap-3" data-v-63c42a13><span class="${ssrRenderClass(["px-3 py-1 rounded-full text-xs font-semibold", getInvoiceStatusClass(unref(selectedInvoice).status)])}" data-v-63c42a13>${ssrInterpolate(unref(selectedInvoice).status)}</span><button class="text-white/40 hover:text-white text-2xl leading-none transition" data-v-63c42a13>×</button></div></div><div class="flex-1 overflow-y-auto p-7 space-y-5" data-v-63c42a13><div class="grid grid-cols-2 gap-4" data-v-63c42a13><div class="bg-white/5 rounded-xl p-4 border border-white/10" data-v-63c42a13><div class="text-white/40 text-xs uppercase tracking-wider mb-1" data-v-63c42a13>Due Date</div><div class="${ssrRenderClass(["font-semibold", isOverdue(unref(selectedInvoice)) ? "text-red-400" : "text-white"])}" data-v-63c42a13>${ssrInterpolate(unref(selectedInvoice).dueDate ? formatDate(unref(selectedInvoice).dueDate) : "Upon receipt")}</div></div><div class="bg-white/5 rounded-xl p-4 border border-white/10" data-v-63c42a13><div class="text-white/40 text-xs uppercase tracking-wider mb-1" data-v-63c42a13>Total Amount</div><div class="text-2xl font-bold text-purple-300" data-v-63c42a13>${ssrInterpolate(currencySymbol(unref(selectedInvoice).currency))}${ssrInterpolate(Number(unref(selectedInvoice).totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }))} <span class="text-white/30 text-sm" data-v-63c42a13>${ssrInterpolate(unref(selectedInvoice).currency)}</span></div></div></div><div data-v-63c42a13><div class="text-white/40 text-xs uppercase tracking-wider mb-3" data-v-63c42a13>Line Items</div><div class="space-y-1.5" data-v-63c42a13><!--[-->`);
          ssrRenderList(unref(selectedInvoice).items || [], (item, i) => {
            _push2(`<div class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5" data-v-63c42a13><div class="flex-1 text-white text-sm" data-v-63c42a13>${ssrInterpolate(item.description)}</div><div class="text-white/40 text-xs tabular-nums w-10 text-center" data-v-63c42a13>×${ssrInterpolate(item.quantity)}</div><div class="text-purple-300 font-semibold text-sm tabular-nums" data-v-63c42a13>${ssrInterpolate(currencySymbol(unref(selectedInvoice).currency))}${ssrInterpolate(Number(item.total).toLocaleString("en-US", { minimumFractionDigits: 2 }))}</div></div>`);
          });
          _push2(`<!--]--></div></div><div class="border border-white/10 rounded-xl overflow-hidden" data-v-63c42a13><div class="flex justify-between px-4 py-2.5 text-sm" data-v-63c42a13><span class="text-white/60" data-v-63c42a13>Subtotal</span><span class="text-white tabular-nums" data-v-63c42a13>${ssrInterpolate(currencySymbol(unref(selectedInvoice).currency))}${ssrInterpolate(Number(unref(selectedInvoice).amount).toLocaleString("en-US", { minimumFractionDigits: 2 }))}</span></div>`);
          if (unref(selectedInvoice).taxAmount) {
            _push2(`<div class="flex justify-between px-4 py-2.5 text-sm border-t border-white/10" data-v-63c42a13><span class="text-white/60" data-v-63c42a13>Tax / Levy</span><span class="text-purple-300 tabular-nums" data-v-63c42a13>${ssrInterpolate(currencySymbol(unref(selectedInvoice).currency))}${ssrInterpolate(Number(unref(selectedInvoice).taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }))}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-between px-4 py-3 bg-purple-500/10 border-t border-purple-500/20" data-v-63c42a13><span class="font-bold text-white" data-v-63c42a13>Total Due</span><span class="font-bold text-pink-300 text-lg tabular-nums" data-v-63c42a13>${ssrInterpolate(currencySymbol(unref(selectedInvoice).currency))}${ssrInterpolate(Number(unref(selectedInvoice).totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }))}</span></div></div>`);
          if (unref(selectedInvoice).notes) {
            _push2(`<div class="bg-white/5 rounded-xl p-4 border border-white/10" data-v-63c42a13><div class="text-white/40 text-xs uppercase tracking-wider mb-2" data-v-63c42a13>Notes</div><p class="text-white/70 text-sm leading-relaxed" data-v-63c42a13>${ssrInterpolate(unref(selectedInvoice).notes)}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="text-center pt-2" data-v-63c42a13><p class="text-white/40 text-xs mb-3" data-v-63c42a13>Questions about this invoice?</p><a href="mailto:hello@charatech.com" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.3))", "border": "1px solid rgba(168,85,247,0.3)" })}" data-v-63c42a13> ✉️ Contact CharaTech </a></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-63c42a13"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-C31wKrST.mjs.map

import { defineComponent, ref, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { a as useAuth, b as useRouter } from './server.mjs';
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

var Industry = /* @__PURE__ */ ((Industry2) => {
  Industry2["HEALTHCARE"] = "HEALTHCARE";
  Industry2["FINANCE"] = "FINANCE";
  Industry2["ECOMMERCE"] = "ECOMMERCE";
  Industry2["EDUCATION"] = "EDUCATION";
  Industry2["REAL_ESTATE"] = "REAL_ESTATE";
  Industry2["LOGISTICS"] = "LOGISTICS";
  Industry2["HOSPITALITY"] = "HOSPITALITY";
  Industry2["ENTERTAINMENT"] = "ENTERTAINMENT";
  Industry2["GOVERNMENT"] = "GOVERNMENT";
  Industry2["NONPROFIT"] = "NONPROFIT";
  Industry2["MANUFACTURING"] = "MANUFACTURING";
  Industry2["RETAIL"] = "RETAIL";
  Industry2["TECHNOLOGY"] = "TECHNOLOGY";
  Industry2["LEGAL"] = "LEGAL";
  Industry2["AGRICULTURE"] = "AGRICULTURE";
  Industry2["ENERGY"] = "ENERGY";
  Industry2["TRANSPORTATION"] = "TRANSPORTATION";
  Industry2["TELECOMMUNICATIONS"] = "TELECOMMUNICATIONS";
  Industry2["MEDIA"] = "MEDIA";
  Industry2["CONSULTING"] = "CONSULTING";
  Industry2["OTHER"] = "OTHER";
  return Industry2;
})(Industry || {});
var ProjectType = /* @__PURE__ */ ((ProjectType2) => {
  ProjectType2["WEB_APPLICATION"] = "WEB_APPLICATION";
  ProjectType2["MOBILE_APPLICATION"] = "MOBILE_APPLICATION";
  ProjectType2["DESKTOP_APPLICATION"] = "DESKTOP_APPLICATION";
  ProjectType2["API_BACKEND"] = "API_BACKEND";
  ProjectType2["CMS"] = "CMS";
  ProjectType2["ECOMMERCE_PLATFORM"] = "ECOMMERCE_PLATFORM";
  ProjectType2["CRM"] = "CRM";
  ProjectType2["ERP"] = "ERP";
  ProjectType2["SAAS_PLATFORM"] = "SAAS_PLATFORM";
  ProjectType2["DASHBOARD_ANALYTICS"] = "DASHBOARD_ANALYTICS";
  ProjectType2["BOOKING_SYSTEM"] = "BOOKING_SYSTEM";
  ProjectType2["PAYMENT_GATEWAY"] = "PAYMENT_GATEWAY";
  ProjectType2["SOCIAL_PLATFORM"] = "SOCIAL_PLATFORM";
  ProjectType2["LEARNING_PLATFORM"] = "LEARNING_PLATFORM";
  ProjectType2["MARKETPLACE"] = "MARKETPLACE";
  ProjectType2["PORTFOLIO_WEBSITE"] = "PORTFOLIO_WEBSITE";
  ProjectType2["BLOG"] = "BLOG";
  ProjectType2["OTHER"] = "OTHER";
  return ProjectType2;
})(ProjectType || {});
var ComplexityLevel = /* @__PURE__ */ ((ComplexityLevel2) => {
  ComplexityLevel2["BASIC"] = "BASIC";
  ComplexityLevel2["INTERMEDIATE"] = "INTERMEDIATE";
  ComplexityLevel2["ADVANCED"] = "ADVANCED";
  ComplexityLevel2["ENTERPRISE"] = "ENTERPRISE";
  return ComplexityLevel2;
})(ComplexityLevel || {});
var BudgetRange = /* @__PURE__ */ ((BudgetRange2) => {
  BudgetRange2["LESS_THAN_5K"] = "LESS_THAN_5K";
  BudgetRange2["FROM_5K_TO_10K"] = "FROM_5K_TO_10K";
  BudgetRange2["FROM_10K_TO_25K"] = "FROM_10K_TO_25K";
  BudgetRange2["FROM_25K_TO_50K"] = "FROM_25K_TO_50K";
  BudgetRange2["FROM_50K_TO_100K"] = "FROM_50K_TO_100K";
  BudgetRange2["FROM_100K_TO_250K"] = "FROM_100K_TO_250K";
  BudgetRange2["ABOVE_250K"] = "ABOVE_250K";
  BudgetRange2["NOT_SURE"] = "NOT_SURE";
  return BudgetRange2;
})(BudgetRange || {});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "submit",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useRouter();
    const currentStep = ref(1);
    const submitting = ref(false);
    const formData = reactive({
      projectName: "",
      industry: "",
      projectTypes: [],
      complexity: "",
      budget: void 0,
      timeline: "",
      requirements: {},
      additionalNotes: "",
      dialogflowSessionId: ""
    });
    const requirements = ref([]);
    const industryOptions = Object.values(Industry).map((v) => ({ value: v, label: v.replace(/_/g, " ") }));
    const projectTypeOptions = Object.values(ProjectType).map((v) => ({ value: v, label: v.replace(/_/g, " ") }));
    const complexityOptions = Object.values(ComplexityLevel).map((v) => ({ value: v, label: v }));
    const budgetOptions = Object.values(BudgetRange).map((v) => ({ value: v, label: v.replace(/_/g, " ") }));
    const aiMessages = ref([
      { type: "ai", text: "Hi! I'm here to help you with your requirements. Feel free to ask me anything!" }
    ]);
    const aiInput = ref("");
    const aiLoading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8 max-w-5xl" }, _attrs))}><div class="text-center mb-12"><h1 class="text-4xl font-bold text-white mb-4">Submit Your Requirements</h1><p class="text-white/70">Tell us about your project and we&#39;ll help bring it to life</p></div><div class="grid lg:grid-cols-3 gap-8"><div class="lg:col-span-2"><div class="glass-morphism p-8 rounded-xl"><form class="space-y-8"><div style="${ssrRenderStyle(unref(currentStep) === 1 ? null : { display: "none" })}"><h2 class="text-2xl font-bold text-white mb-6">Basic Information</h2><div class="space-y-5"><div><label class="block text-sm font-medium text-white mb-2"> Project Name <span class="text-red-400">*</span></label><input${ssrRenderAttr("value", unref(formData).projectName)} type="text" required class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" placeholder="My Awesome Project"></div><div><label class="block text-sm font-medium text-white mb-2"> Industry <span class="text-red-400">*</span></label><select required class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10" style="${ssrRenderStyle({ "background-image": "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", "background-size": "1.5em", "background-position": "right 0.5rem center" })}"><option value="" disabled class="bg-gray-900 text-white/40"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).industry) ? ssrLooseContain(unref(formData).industry, "") : ssrLooseEqual(unref(formData).industry, "")) ? " selected" : ""}>Select Industry</option><!--[-->`);
      ssrRenderList(unref(industryOptions), (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)} class="bg-gray-900 text-white"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).industry) ? ssrLooseContain(unref(formData).industry, option.value) : ssrLooseEqual(unref(formData).industry, option.value)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="block text-sm font-medium text-white mb-2"> Project Types <span class="text-red-400">*</span></label><div class="space-y-2 bg-white/5 p-4 rounded-lg border border-white/20 max-h-64 overflow-y-auto"><!--[-->`);
      ssrRenderList(unref(projectTypeOptions), (option) => {
        _push(`<label class="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition"><input type="checkbox"${ssrRenderAttr("value", option.value)}${ssrIncludeBooleanAttr(Array.isArray(unref(formData).projectTypes) ? ssrLooseContain(unref(formData).projectTypes, option.value) : unref(formData).projectTypes) ? " checked" : ""} class="w-5 h-5 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"><span class="text-white">${ssrInterpolate(option.label)}</span></label>`);
      });
      _push(`<!--]--></div><p class="text-xs text-white/60 mt-1">Select all that apply</p></div><div><label class="block text-sm font-medium text-white mb-2"> Complexity Level <span class="text-red-400">*</span></label><select required class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10" style="${ssrRenderStyle({ "background-image": "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", "background-size": "1.5em", "background-position": "right 0.5rem center" })}"><option value="" disabled class="bg-gray-900 text-white/40"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).complexity) ? ssrLooseContain(unref(formData).complexity, "") : ssrLooseEqual(unref(formData).complexity, "")) ? " selected" : ""}>Select Complexity</option><!--[-->`);
      ssrRenderList(unref(complexityOptions), (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)} class="bg-gray-900 text-white"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).complexity) ? ssrLooseContain(unref(formData).complexity, option.value) : ssrLooseEqual(unref(formData).complexity, option.value)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="block text-sm font-medium text-white mb-2"> Budget Range </label><select class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none bg-no-repeat bg-right pr-10" style="${ssrRenderStyle({ "background-image": "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27white%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')", "background-size": "1.5em", "background-position": "right 0.5rem center" })}"><option value="" disabled class="bg-gray-900 text-white/40"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).budget) ? ssrLooseContain(unref(formData).budget, "") : ssrLooseEqual(unref(formData).budget, "")) ? " selected" : ""}>Select Budget Range</option><!--[-->`);
      ssrRenderList(unref(budgetOptions), (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)} class="bg-gray-900 text-white"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).budget) ? ssrLooseContain(unref(formData).budget, option.value) : ssrLooseEqual(unref(formData).budget, option.value)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="block text-sm font-medium text-white mb-2"> Timeline </label><input${ssrRenderAttr("value", unref(formData).timeline)} type="text" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition" placeholder="e.g., 3 months, 6 weeks"></div></div></div><div style="${ssrRenderStyle(unref(currentStep) === 2 ? null : { display: "none" })}"><h2 class="text-2xl font-bold text-white mb-6">Feature Requirements</h2>`);
      if (unref(requirements).length) {
        _push(`<div class="space-y-6"><!--[-->`);
        ssrRenderList(unref(requirements), (category) => {
          _push(`<div class="bg-white/5 p-6 rounded-lg"><h3 class="text-xl font-semibold text-white mb-4">${ssrInterpolate(category.title)}</h3>`);
          if (category.description) {
            _push(`<p class="text-white/70 text-sm mb-4">${ssrInterpolate(category.description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(category.items, (item) => {
            _push(`<div class="flex items-start gap-3">`);
            if (item.type === "checkbox") {
              _push(`<label class="flex items-center gap-3 cursor-pointer"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(formData).requirements[item.id]) ? ssrLooseContain(unref(formData).requirements[item.id], null) : unref(formData).requirements[item.id]) ? " checked" : ""} class="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-purple-500"><span class="text-white">${ssrInterpolate(item.label)}</span></label>`);
            } else if (item.type === "text") {
              _push(`<input${ssrRenderAttr("value", unref(formData).requirements[item.id])} type="text"${ssrRenderAttr("placeholder", item.label)} class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition">`);
            } else if (item.type === "textarea") {
              _push(`<textarea${ssrRenderAttr("placeholder", item.label)} rows="3" class="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none">${ssrInterpolate(unref(formData).requirements[item.id])}</textarea>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div style="${ssrRenderStyle(unref(currentStep) === 3 ? null : { display: "none" })}"><h2 class="text-2xl font-bold text-white mb-6">Additional Information</h2><div><label class="block text-sm font-medium text-white mb-2"> Additional Notes or Special Requirements </label><textarea rows="8" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none" placeholder="Tell us anything else you&#39;d like us to know about your project...">${ssrInterpolate(unref(formData).additionalNotes)}</textarea></div></div><div class="flex justify-between pt-6 border-t border-white/10">`);
      if (unref(currentStep) > 1) {
        _push(`<button type="button" class="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"> Previous </button>`);
      } else {
        _push(`<div></div>`);
      }
      if (unref(currentStep) < 3) {
        _push(`<button type="button" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"> Next </button>`);
      } else {
        _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition">`);
        if (!unref(submitting)) {
          _push(`<span>Submit Requirements</span>`);
        } else {
          _push(`<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Submitting... </span>`);
        }
        _push(`</button>`);
      }
      _push(`</div></form><div class="mt-6 flex justify-center gap-2"><!--[-->`);
      ssrRenderList(3, (step) => {
        _push(`<div class="${ssrRenderClass([
          "w-12 h-1 rounded-full transition-all",
          unref(currentStep) >= step ? "bg-purple-500" : "bg-white/20"
        ])}"></div>`);
      });
      _push(`<!--]--></div></div></div><div class="lg:col-span-1"><div class="glass-morphism p-6 rounded-xl sticky top-24"><div class="flex items-center gap-3 mb-4"><div class="text-3xl">🤖</div><h3 class="text-xl font-bold text-white">AI Assistant</h3></div><div class="space-y-3 mb-4 max-h-96 overflow-y-auto"><!--[-->`);
      ssrRenderList(unref(aiMessages), (msg, i) => {
        _push(`<div class="${ssrRenderClass([
          "p-3 rounded-lg text-sm",
          msg.type === "user" ? "bg-purple-500/20 ml-4" : "bg-white/5 mr-4"
        ])}"><p class="text-white">${ssrInterpolate(msg.text)}</p></div>`);
      });
      _push(`<!--]--></div><div class="flex gap-2"><input${ssrRenderAttr("value", unref(aiInput))} type="text" placeholder="Ask AI for help..." class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"><button${ssrIncludeBooleanAttr(unref(aiLoading)) ? " disabled" : ""} class="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition disabled:opacity-50">`);
      if (!unref(aiLoading)) {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
      }
      _push(`</button></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/submit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=submit-DPpBRza8.mjs.map

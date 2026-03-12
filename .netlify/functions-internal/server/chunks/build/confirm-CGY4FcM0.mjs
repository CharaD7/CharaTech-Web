import { _ as __nuxt_component_0 } from './nuxt-link-BtQrV7j8.mjs';
import { defineComponent, ref, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { c as useRoute, d as useSupabase } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "confirm",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useSupabase();
    const status = ref("pending");
    const errorMessage = ref("");
    const email = ref(route.query.email || "");
    const resendLoading = ref(false);
    const resendSuccess = ref(false);
    const resendError = ref("");
    const resendCooldown = ref(0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(status) === "confirmed") {
        _push(`<div class="text-center"><div class="flex justify-center mb-6"><div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div></div><h1 class="text-2xl font-bold text-white mb-2">Email Confirmed!</h1><p class="text-gray-300 mb-6">Your account is verified. Redirecting to your dashboard…</p><div class="flex justify-center"><svg class="animate-spin h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div></div>`);
      } else if (unref(status) === "error") {
        _push(`<div class="text-center"><div class="flex justify-center mb-6"><div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div></div><h1 class="text-2xl font-bold text-white mb-2">Confirmation Failed</h1><p class="text-gray-300 mb-6">${ssrInterpolate(unref(errorMessage))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/register",
          class: "inline-block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-center"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Register `);
            } else {
              return [
                createTextVNode(" Back to Register ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(status) === "checking") {
        _push(`<div class="text-center"><div class="flex justify-center mb-6"><svg class="animate-spin h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div><p class="text-gray-300">Confirming your email…</p></div>`);
      } else {
        _push(`<div><div class="flex justify-center mb-6"><div class="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div></div><h1 class="text-2xl font-bold text-white text-center mb-2">Check Your Email</h1><p class="text-gray-300 text-center mb-1">We sent a confirmation link to:</p><p class="text-white font-semibold text-center mb-6 break-all">${ssrInterpolate(unref(email) || "your email address")}</p><div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-6"><p class="text-gray-300 text-sm text-center"> Click the link in the email to activate your account. Check your spam folder if you don&#39;t see it. </p></div>`);
        if (unref(resendSuccess)) {
          _push(`<div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4"><p class="text-green-400 text-sm text-center">Confirmation email resent! Check your inbox.</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(resendError)) {
          _push(`<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"><p class="text-red-400 text-sm text-center">${ssrInterpolate(unref(resendError))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button${ssrIncludeBooleanAttr(unref(resendLoading) || unref(resendCooldown) > 0) ? " disabled" : ""} class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition duration-200 flex items-center justify-center gap-2">`);
        if (unref(resendLoading)) {
          _push(`<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(resendCooldown) > 0) {
          _push(`<span>Resend in ${ssrInterpolate(unref(resendCooldown))}s</span>`);
        } else if (unref(resendLoading)) {
          _push(`<span>Sending…</span>`);
        } else {
          _push(`<span>Resend Confirmation Email</span>`);
        }
        _push(`</button><p class="text-center text-gray-400 text-sm mt-6"> Wrong email? `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/register",
          class: "text-purple-400 hover:text-purple-300 font-medium transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Sign up again `);
            } else {
              return [
                createTextVNode(" Sign up again ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/confirm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=confirm-CGY4FcM0.mjs.map

import { _ as __nuxt_component_0 } from './nuxt-link-BtQrV7j8.mjs';
import { defineComponent, reactive, ref, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrRenderDynamicModel, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { VueTelInput } from 'vue-tel-input';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useRouter();
    const form = reactive({
      fullName: "",
      email: "",
      phoneNumber: "",
      companyName: "",
      password: ""
    });
    const loading = ref(false);
    const error = ref("");
    const showPassword = ref(false);
    const phoneValid = ref(true);
    const onPhoneValidate = (phoneObject) => {
      phoneValid.value = phoneObject.valid;
      if (phoneObject.valid) {
        form.phoneNumber = phoneObject.number;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="text-center mb-8"><h1 class="text-3xl font-bold text-white mb-2">Create Account</h1><p class="text-gray-300">Join CharaTech today</p></div><form class="space-y-5"><div><label for="fullName" class="block text-sm font-medium text-white mb-2"> Full Name </label><input id="fullName"${ssrRenderAttr("value", unref(form).fullName)} type="text" required class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" placeholder="John Doe"></div><div><label for="email" class="block text-sm font-medium text-white mb-2"> Email Address </label><input id="email"${ssrRenderAttr("value", unref(form).email)} type="email" required class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" placeholder="you@example.com"></div><div class="relative z-20"><label for="phone" class="block text-sm font-medium text-white mb-2"> Phone Number </label>`);
      _push(ssrRenderComponent(unref(VueTelInput), {
        modelValue: unref(form).phoneNumber,
        "onUpdate:modelValue": ($event) => unref(form).phoneNumber = $event,
        mode: "international",
        inputOptions: {
          placeholder: "Enter phone number",
          styleClasses: "w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
        },
        dropdownOptions: {
          showSearchBox: true,
          showDialCodeInSelection: true,
          showFlags: true
        },
        defaultCountry: "US",
        autoDefaultCountry: false,
        onValidate: onPhoneValidate
      }, null, _parent));
      if (!unref(phoneValid) && unref(form).phoneNumber) {
        _push(`<p class="text-xs text-red-300 mt-1"> Please enter a valid phone number </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label for="company" class="block text-sm font-medium text-white mb-2"> Company Name <span class="text-gray-300">(Optional)</span></label><input id="company"${ssrRenderAttr("value", unref(form).companyName)} type="text" class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" placeholder="Your Company Inc."></div><div><label for="password" class="block text-sm font-medium text-white mb-2"> Password </label><div class="relative"><input id="password"${ssrRenderDynamicModel(unref(showPassword) ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("type", unref(showPassword) ? "text" : "password")} required minlength="6" class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition pr-10" placeholder="Minimum 6 characters"><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition">`);
      if (!unref(showPassword)) {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>`);
      }
      _push(`</button></div></div>`);
      if (unref(error)) {
        _push(`<div class="bg-red-500/20 border border-red-400/50 text-white px-4 py-3 rounded-lg backdrop-blur-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">`);
      if (!unref(loading)) {
        _push(`<span>Create Account</span>`);
      } else {
        _push(`<span class="flex items-center justify-center gap-2"><svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Creating account... </span>`);
      }
      _push(`</button></form><p class="mt-6 text-center text-white"> Already have an account? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-purple-300 hover:text-purple-200 font-semibold transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Sign in `);
          } else {
            return [
              createTextVNode(" Sign in ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=register-uA9oXwoI.mjs.map
